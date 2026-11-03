import {createServer, type IncomingMessage, type ServerResponse} from 'node:http';
import {pool} from './db.ts';
import {hashPassword,verifyPassword,normalizeEmail,validEmail,validPassword,newToken,newInviteCode,tokenHash} from './security.ts';
import {HttpError,send,body,str} from './http.ts';
import {handleKanban} from './kanban.ts';

export type Identity={id:string;full_name:string;email:string;workspace_id:string|null};
const envPort=Number(process.env.PORT||3005);
const host=process.env.HOST||'0.0.0.0';
const loginAttempts=new Map<string,{count:number;resetAt:number}>();
function rateLimit(req:IncomingMessage){
 const ip=req.socket.remoteAddress??'unknown';const now=Date.now();const curr=loginAttempts.get(ip);
 const next=(!curr||curr.resetAt<now)?{count:1,resetAt:now+60_000}:{count:curr.count+1,resetAt:curr.resetAt};
 loginAttempts.set(ip,next);if(next.count>20)throw new HttpError(429,'Trop de tentatives. Réessayez plus tard.');
}
async function requireUser(req:IncomingMessage):Promise<Identity>{
 const bearer=req.headers.authorization?.match(/^Bearer ([a-zA-Z0-9_-]{40,80})$/);
 if(!bearer)throw new HttpError(401,'Connexion nécessaire.');
 const {rows}=await pool.query<Identity>(`
 SELECT u.id,u.full_name,u.email,
 (SELECT wm.workspace_id::text FROM workspace_members wm WHERE wm.user_id=u.id ORDER BY (wm.role='owner') DESC,wm.joined_at LIMIT 1) workspace_id
 FROM auth_sessions s JOIN app_users u ON u.id=s.user_id
 WHERE s.token_hash=$1 AND s.expires_at>now()`,[tokenHash(bearer[1])]);
 if(!rows[0])throw new HttpError(401,'Session expirée.');return rows[0];
}
function responseUser(u:Identity){return {id:u.id,name:u.full_name,email:u.email,workspaceId:u.workspace_id};}
async function newSession(userId:string):Promise<string>{
 const token=newToken();await pool.query(`INSERT INTO auth_sessions(user_id,token_hash,expires_at) VALUES($1,$2,now()+interval '7 days')`,[userId,tokenHash(token)]);return token;
}
async function route(req:IncomingMessage,res:ServerResponse):Promise<void>{
 if(req.method==='GET' && req.url==='/health'){await pool.query('SELECT 1');return send(res,200,{status:'ok',backend:'postgresql'});}
 if(req.url?.startsWith('/api/data/'))return handleKanban(req,res,await requireUser(req),req.url.split('?')[0]);
 if(req.url==='/api/auth/register'&&req.method==='POST'){
  rateLimit(req);const b=await body(req);const name=str(b.name).trim();const email=normalizeEmail(str(b.email));const password=str(b.password);
  if(name.length<2||name.length>120||!validEmail(email)||!validPassword(password))throw new HttpError(400,'Nom, e-mail ou mot de passe invalide (8 à 128 caractères).');
  const passHash=await hashPassword(password);const conn=await pool.connect();let userId='';let workspaceId='';
  try{await conn.query('BEGIN');
   const r=await conn.query<{id:string}>(`INSERT INTO app_users(full_name,email,password_hash) VALUES($1,$2,$3) RETURNING id`,[name,email,passHash]);userId=r.rows[0].id;
   const w=await conn.query<{id:string}>(`INSERT INTO workspaces(name,owner_id) VALUES($1,$2) RETURNING id`,[`Espace de ${name}`,userId]);workspaceId=w.rows[0].id;
   await conn.query(`INSERT INTO workspace_members(workspace_id,user_id,role) VALUES($1,$2,'owner')`,[workspaceId,userId]);
   await conn.query('COMMIT');
  }catch(e){await conn.query('ROLLBACK');if((e as {code?:string}).code==='23505')throw new HttpError(409,'Cette adresse e-mail est déjà utilisée.');throw e;}finally{conn.release();}
  const token=await newSession(userId);return send(res,201,{token,user:{id:userId,name,email,workspaceId}});
 }
 if(req.url==='/api/auth/login'&&req.method==='POST'){
  rateLimit(req);const b=await body(req);const email=normalizeEmail(str(b.email));const password=str(b.password);
  const r=await pool.query<{id:string;full_name:string;email:string;password_hash:string}>(`SELECT id,full_name,email,password_hash FROM app_users WHERE lower(email)=$1`,[email]);
  const u=r.rows[0];if(!u||!(await verifyPassword(password,u.password_hash)))throw new HttpError(401,'Identifiants incorrects.');
  const w=await pool.query<{workspace_id:string}>(`SELECT workspace_id FROM workspace_members WHERE user_id=$1 ORDER BY (role='owner') DESC,joined_at LIMIT 1`,[u.id]);
  const token=await newSession(u.id);return send(res,200,{token,user:{id:u.id,name:u.full_name,email:u.email,workspaceId:w.rows[0]?.workspace_id??null}});
 }
 if(req.url==='/api/auth/me'&&req.method==='GET'){
  const u=await requireUser(req);return send(res,200,{user:responseUser(u)});
 }
 if(req.url==='/api/auth/logout'&&req.method==='POST'){
  await requireUser(req);const token=req.headers.authorization!.slice(7);
  await pool.query('DELETE FROM auth_sessions WHERE token_hash=$1',[tokenHash(token)]);return send(res,200,{ok:true});
 }
 if(req.url==='/api/invitations'&&req.method==='POST'){
  const u=await requireUser(req);const b=await body(req);const email=normalizeEmail(str(b.email));const role=str(b.role);
  if(!validEmail(email)||!['admin','editor','viewer'].includes(role))throw new HttpError(400,'Adresse ou rôle invalide.');
  const projectId=str(b.projectId);
  if(!/^[0-9a-f-]{36}$/i.test(projectId))throw new HttpError(400,'Projet requis pour inviter.');
  const project=await pool.query<{workspace_id:string}>(`SELECT workspace_id FROM projects WHERE id=$1`,[projectId]);
  if(!project.rows[0])throw new HttpError(404,'Projet introuvable.');
  const workspaceId=project.rows[0].workspace_id;
  if(!workspaceId)throw new HttpError(400,'Aucun espace de travail disponible.');
  if(email===normalizeEmail(u.email))throw new HttpError(400,'Vous ne pouvez pas vous inviter vous-même.');
  const r=await pool.query<{role:string}>(`SELECT role FROM workspace_members WHERE workspace_id=$1 AND user_id=$2`,[workspaceId,u.id]);
  if(!r.rows[0]||!['owner','admin'].includes(r.rows[0].role))throw new HttpError(403,'Droits insuffisants.');
  if(r.rows[0].role==='admin' && role==='admin')throw new HttpError(403,'Seul le propriétaire peut inviter un administrateur.');
  const member=await pool.query(`SELECT 1 FROM workspace_members wm JOIN app_users a ON a.id=wm.user_id WHERE wm.workspace_id=$1 AND lower(a.email)=$2`,[workspaceId,email]);
  if(member.rowCount)throw new HttpError(409,'Cette personne est déjà membre.');
  try{
   const code=newInviteCode();
   const created=await pool.query<{id:string}>(`INSERT INTO workspace_invitations(workspace_id,invited_email,role,invited_by,invite_code_hash) VALUES($1,$2,$3,$4,$5) RETURNING id`,[workspaceId,email,role,u.id,tokenHash(code)]);
   return send(res,201,{id:created.rows[0].id,status:'pending',delivery:'manual_code',code,message:'Invitation enregistrée. Transmettez ce code au destinataire par un canal privé ; il devra le saisir dans Taskify.'});
  }catch(e){if((e as {code?:string}).code==='23505')throw new HttpError(409,'Une invitation est déjà en attente pour cette adresse.');throw e;}
 }
 const wsInvites=req.url?.match(/^\/api\/workspaces\/([0-9a-f-]{36})\/invitations$/);
 if(wsInvites&&req.method==='GET'){
  const u=await requireUser(req);const r=await pool.query<{role:string}>(`SELECT role FROM workspace_members WHERE workspace_id=$1 AND user_id=$2`,[wsInvites[1],u.id]);
  if(!r.rows[0]||!['owner','admin'].includes(r.rows[0].role))throw new HttpError(403,'Accès refusé.');
  const invites=await pool.query(`SELECT id,invited_email AS email,role,created_at AS "createdAt" FROM workspace_invitations WHERE workspace_id=$1 AND status='pending' ORDER BY created_at DESC`,[wsInvites[1]]);
  return send(res,200,{invitations:invites.rows});
 }
 if(req.url==='/api/invitations'&&req.method==='GET'){
  const u=await requireUser(req);
  const r=await pool.query(`SELECT i.id,i.role,i.status,i.created_at AS "createdAt",w.name AS "workspaceName",a.full_name AS "invitedBy"
    FROM workspace_invitations i JOIN workspaces w ON w.id=i.workspace_id JOIN app_users a ON a.id=i.invited_by
    WHERE lower(i.invited_email)=lower($1) AND i.status='pending' ORDER BY i.created_at DESC`,[u.email]);
  return send(res,200,{invitations:r.rows});
 }
 const match=req.url?.match(/^\/api\/invitations\/([0-9a-f-]{36})\/(accept|reject)$/);
 if(req.method==='POST'&&match){
  const u=await requireUser(req);const id=match[1],decision=match[2];const b=await body(req);
  const submittedCode=str(b.code).trim();if(decision==='accept'&&!/^[A-Za-z0-9_-]{12}$/.test(submittedCode))throw new HttpError(400,'Code d’invitation requis.');
  const conn=await pool.connect();
  try{
   await conn.query('BEGIN');
   const r=await conn.query<{workspace_id:string;role:string;invite_code_hash:string}>(`SELECT workspace_id,role,invite_code_hash FROM workspace_invitations WHERE id=$1 AND lower(invited_email)=lower($2) AND status='pending' FOR UPDATE`,[id,u.email]);
   if(!r.rows[0])throw new HttpError(404,'Invitation absente ou déjà traitée.');
   if(decision==='accept' && tokenHash(submittedCode)!==r.rows[0].invite_code_hash)throw new HttpError(403,'Code d’invitation invalide.');
   if(decision==='accept')await conn.query(`INSERT INTO workspace_members(workspace_id,user_id,role) VALUES($1,$2,$3)
     ON CONFLICT(workspace_id,user_id) DO NOTHING`,[r.rows[0].workspace_id,u.id,r.rows[0].role]);
   await conn.query(`UPDATE workspace_invitations SET status=$1,answered_at=now() WHERE id=$2`,[decision==='accept'?'accepted':'rejected',id]);
   await conn.query('COMMIT');return send(res,200,{ok:true,status:decision==='accept'?'accepted':'rejected'});
  }catch(e){await conn.query('ROLLBACK');throw e;}finally{conn.release();}
 }
 if(req.url==='/api/workspaces'&&req.method==='GET'){
  const u=await requireUser(req);const r=await pool.query(`SELECT w.id,w.name,m.role FROM workspaces w JOIN workspace_members m ON m.workspace_id=w.id WHERE m.user_id=$1 ORDER BY (m.role='owner') DESC,w.created_at`,[u.id]);return send(res,200,{workspaces:r.rows});
 }
 throw new HttpError(404,'Route introuvable.');
}
const server=createServer(async(req,res)=>{
 try{await route(req,res);}catch(e){const err=e instanceof HttpError?e:new HttpError(500,'Erreur interne du serveur.');
  if(err.status===500)console.error(e);send(res,err.status,{error:err.message});}
});
server.listen(envPort,host,()=>console.log(`Taskify API PostgreSQL: http://${host}:${envPort}`));
process.on('SIGTERM',()=>{server.close();void pool.end();});
