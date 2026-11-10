import {handleEmailInvitations} from './emailInvitations.ts';
import type {IncomingMessage,ServerResponse} from 'node:http';
import {pool} from './db.ts';
import {HttpError,send,body,str,validUuid,required,priority,optionalDate,isoDate} from './http.ts';
import type {Identity} from './server.ts';

// Autorisations validées côté serveur : ne jamais faire confiance au rôle déclaré par Expo.
async function workspaceRole(userId:string, workspaceId:string){
  const r=await pool.query<{role:string}>(`SELECT role FROM workspace_members WHERE user_id=$1 AND workspace_id=$2`,[userId,workspaceId]);
  if(!r.rows[0])throw new HttpError(403,'Vous ne faites pas partie de cet espace de travail.');
  return r.rows[0].role;
}
async function projectRole(userId:string,projectId:string){
  if(!validUuid(projectId))throw new HttpError(400,'Identifiant de projet invalide.');
  const r=await pool.query<{workspace_id:string;role:string}>(`SELECT p.workspace_id, m.role FROM projects p
   JOIN workspace_members m ON m.workspace_id=p.workspace_id AND m.user_id=$1 WHERE p.id=$2`,[userId,projectId]);
  if(!r.rows[0])throw new HttpError(404,'Projet introuvable.');
  return r.rows[0];
}
async function requireEditor(userId:string,projectId:string){const p=await projectRole(userId,projectId);if(p.role==='viewer')throw new HttpError(403,'Lecture seule.');return p;}
async function requireManager(userId:string,projectId:string){const p=await projectRole(userId,projectId);if(!['owner','admin'].includes(p.role))throw new HttpError(403,'Gestion des membres réservée aux responsables.');return p;}
async function taskProject(userId:string,taskId:string,edit=false){
  if(!validUuid(taskId))throw new HttpError(400,'Identifiant de tâche invalide.');
  const r=await pool.query<{project_id:string}>(`SELECT t.project_id FROM tasks t JOIN projects p ON p.id=t.project_id JOIN workspace_members m ON m.workspace_id=p.workspace_id AND m.user_id=$1 WHERE t.id=$2`,[userId,taskId]);
  if(!r.rows[0])throw new HttpError(404,'Tâche introuvable.');
  if(edit)await requireEditor(userId,r.rows[0].project_id);
  return r.rows[0].project_id;
}
const visibleProjects=`SELECT p.id FROM projects p JOIN workspace_members wm ON wm.workspace_id=p.workspace_id WHERE wm.user_id=$1`;
async function snapshot(user:Identity){
  const uid=user.id;
  const ws=await pool.query<{id:string;name:string;owner_id:string}>(`SELECT w.id,w.name,w.owner_id FROM workspaces w JOIN workspace_members m ON m.workspace_id=w.id WHERE m.user_id=$1 ORDER BY (m.role='owner') DESC,w.created_at LIMIT 1`,[uid]);
  if(!ws.rows[0])throw new HttpError(409,'Aucun espace de travail rattaché.');
  const [projects,users,members,statuses,tasks,assignees,subtasks,comments,notifications]=await Promise.all([
    pool.query(`SELECT p.* FROM projects p WHERE p.id IN (${visibleProjects}) ORDER BY p.updated_at DESC`,[uid]),
    pool.query(`SELECT DISTINCT u.id,u.full_name,u.email FROM app_users u JOIN workspace_members wm ON wm.user_id=u.id WHERE wm.workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id=$1)`,[uid]),
    pool.query(`SELECT p.id AS project_id,wm.user_id,wm.role FROM projects p JOIN workspace_members wm ON wm.workspace_id=p.workspace_id WHERE p.id IN (${visibleProjects})`,[uid]),
    pool.query(`SELECT s.* FROM kanban_statuses s WHERE s.project_id IN (${visibleProjects}) ORDER BY s.position`,[uid]),
    pool.query(`SELECT t.* FROM tasks t LEFT JOIN task_kanban_order o ON o.task_id=t.id WHERE t.project_id IN (${visibleProjects}) ORDER BY t.project_id,t.status_id,COALESCE(o.position,2147483647),t.created_at,t.id`,[uid]),
    pool.query(`SELECT a.* FROM task_assignees a JOIN tasks t ON t.id=a.task_id WHERE t.project_id IN (${visibleProjects})`,[uid]),
    pool.query(`SELECT s.* FROM subtasks s JOIN tasks t ON t.id=s.task_id WHERE t.project_id IN (${visibleProjects}) ORDER BY s.position`,[uid]),
    pool.query(`SELECT c.* FROM task_comments c JOIN tasks t ON t.id=c.task_id WHERE t.project_id IN (${visibleProjects}) ORDER BY c.created_at`,[uid]),
    pool.query(`SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC`,[uid])
  ]);
  return {
    workspace:{id:ws.rows[0].id,name:ws.rows[0].name,ownerId:ws.rows[0].owner_id},
    users:users.rows.map((u:any)=>({id:u.id,name:u.full_name,email:u.email})),
    projects:projects.rows.map((p:any)=>({id:p.id,workspaceId:p.workspace_id,title:p.title,description:p.description,icon:p.icon,priority:p.priority,dueDate:isoDate(p.due_date),createdAt:isoDate(p.created_at),updatedAt:isoDate(p.updated_at)})),
    members:members.rows.map((m:any)=>({projectId:m.project_id,userId:m.user_id,role:m.role})),
    statuses:statuses.rows.map((s:any)=>({id:s.id,projectId:s.project_id,name:s.name,color:s.color,position:s.position})),
    tasks:tasks.rows.map((t:any)=>({id:t.id,projectId:t.project_id,statusId:t.status_id,title:t.title,description:t.description,priority:t.priority,startDate:isoDate(t.start_date),dueDate:isoDate(t.due_date),createdAt:isoDate(t.created_at),updatedAt:isoDate(t.updated_at)})),
    assignees:assignees.rows.map((a:any)=>({taskId:a.task_id,userId:a.user_id})),
    subtasks:subtasks.rows.map((s:any)=>({id:s.id,taskId:s.task_id,title:s.title,done:s.done,position:s.position})),
    comments:comments.rows.map((c:any)=>({id:c.id,taskId:c.task_id,authorId:c.author_id,body:c.body,createdAt:isoDate(c.created_at)})),
    notifications:notifications.rows.map((n:any)=>({id:n.id,userId:n.user_id,title:n.title,body:n.body,createdAt:isoDate(n.created_at),read:n.is_read})),
  };
}
function idFrom(path:string,expr:RegExp){return path.match(expr)?.[1]??null;}
export async function handleKanban(req:IncomingMessage,res:ServerResponse,user:Identity,path:string):Promise<void>{
 const m=req.method;const uid=user.id;
 if(await handleEmailInvitations(req,res,user,path))return;
 if(path==='/api/data/snapshot'&&m==='GET'){return send(res,200,{data:await snapshot(user)});}
 if(path==='/api/data/projects'&&m==='POST'){
  const b=await body(req);const title=required(b.title,'Titre du projet',200),description=str(b.description).slice(0,4000),icon=str(b.icon).slice(0,16)||'💻';
  const pr=priority(b.priority);const due=optionalDate(b.dueDate);
  const workspace=user.workspace_id;if(!workspace)throw new HttpError(409,'Espace de travail manquant.');
  const role=await workspaceRole(uid,workspace);if(role==='viewer')throw new HttpError(403,'Lecture seule.');
  const conn=await pool.connect();
  try{await conn.query('BEGIN');
    const created=await conn.query<{id:string}>(`INSERT INTO projects(workspace_id,title,description,icon,priority,due_date,created_by) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id`,[workspace,title,description,icon,pr,due,uid]);
    const pid=created.rows[0].id;
    for(const [pos,name,color] of [[0,'À faire','#D4E9E7'],[1,'En cours','#E5DEFF'],[2,'Terminé','#FFD9D9']] as const){
      await conn.query(`INSERT INTO kanban_statuses(project_id,name,color,position) VALUES($1,$2,$3,$4)`,[pid,name,color,pos]);
    }
    await conn.query('COMMIT');return send(res,201,{id:pid});
  }catch(e){await conn.query('ROLLBACK');throw e;}finally{conn.release();}
 }
 const projectId=idFrom(path,/^\/api\/data\/projects\/([a-f\d-]{36})$/i);
 if(projectId&&m==='PATCH'){
  await requireEditor(uid,projectId);const b=await body(req);
  await pool.query(`UPDATE projects SET title=$1,description=$2,icon=$3,priority=$4,due_date=$5,updated_at=now() WHERE id=$6`,[required(b.title,'Titre',200),str(b.description).slice(0,4000),str(b.icon).slice(0,16)||'💻',priority(b.priority),optionalDate(b.dueDate),projectId]);
  return send(res,200,{ok:true});
 }
 const statusProject=idFrom(path,/^\/api\/data\/projects\/([a-f\d-]{36})\/statuses$/i);
 if(statusProject&&m==='POST'){
  await requireEditor(uid,statusProject);const b=await body(req);
  const r=await pool.query<{id:string}>(`INSERT INTO kanban_statuses(project_id,name,color,position) VALUES($1,$2,$3,(SELECT COALESCE(MAX(position)+1,0) FROM kanban_statuses WHERE project_id=$1)) RETURNING id`,[statusProject,required(b.name,'État',80),required(b.color,'Couleur',25)]);
  return send(res,201,{id:r.rows[0].id});
 }
 const statusId=idFrom(path,/^\/api\/data\/statuses\/([a-f\d-]{36})$/i);
 if(statusId&&(m==='PATCH'||m==='DELETE')){
  const r=await pool.query<{project_id:string}>(`SELECT project_id FROM kanban_statuses WHERE id=$1`,[statusId]);
  if(!r.rows[0])throw new HttpError(404,'État introuvable.');await requireEditor(uid,r.rows[0].project_id);
  if(m==='PATCH'){const b=await body(req);await pool.query(`UPDATE kanban_statuses SET name=$1,color=$2 WHERE id=$3`,[required(b.name,'État',80),required(b.color,'Couleur',25),statusId]);}
  else {
    const r2=await pool.query('SELECT 1 FROM tasks WHERE status_id=$1 LIMIT 1',[statusId]);
    if(r2.rowCount)throw new HttpError(409,'Cet état contient des tâches.');
    await pool.query('DELETE FROM kanban_statuses WHERE id=$1',[statusId]);
  }
  return send(res,200,{ok:true});
 }
 if(path==='/api/data/tasks'&&m==='POST'){
  const b=await body(req);
  const pid=required(b.projectId,'Projet',40);
  await requireEditor(uid,pid);
  // KANBAN-01 : une tâche commence toujours dans le premier état du projet.
  const firstStatus=await pool.query<{id:string}>(`SELECT id FROM kanban_statuses WHERE project_id=$1 ORDER BY position ASC,id ASC LIMIT 1`,[pid]);
  if(!firstStatus.rows[0])throw new HttpError(409,'Ce projet ne possède aucun état Kanban.');
  const sid=firstStatus.rows[0].id;
  const conn=await pool.connect();
  try{
   await conn.query('BEGIN');
   const r=await conn.query<{id:string}>(`INSERT INTO tasks(project_id,status_id,title,description,priority,start_date,due_date,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,[pid,sid,required(b.title,'Tâche',200),str(b.description).slice(0,4000),priority(b.priority),optionalDate(b.startDate),optionalDate(b.dueDate),uid]);
   await conn.query('INSERT INTO task_assignees(task_id,user_id) VALUES($1,$2)',[r.rows[0].id,uid]);
   await conn.query('COMMIT');return send(res,201,{id:r.rows[0].id});
  }catch(e){await conn.query('ROLLBACK');throw e;}finally{conn.release();}
 }
 // KANBAN-02 : modifier uniquement le statut d'une tâche, sans écraser les autres champs.
  // KANBAN-03 : deplacement et insertion ordonnee, sans reecrire la fiche.
 const movingTaskId=idFrom(path,/^\/api\/data\/tasks\/([a-f\d-]{36})\/status$/i);
 if(movingTaskId&&m==='PATCH'){
  const pid=await taskProject(uid,movingTaskId,true);
  const b=await body(req);
  const sid=required(b.statusId,'État',40);
  const beforeTaskId=b.beforeTaskId===undefined||b.beforeTaskId===null?null:str(b.beforeTaskId);
  if(beforeTaskId!==null&&(!validUuid(beforeTaskId)||beforeTaskId===movingTaskId)){
   throw new HttpError(400,'Position de dépôt invalide.');
  }
  const conn=await pool.connect();
  try{
   await conn.query('BEGIN');
   // Verrou de projet : deux reordonnancements concurrents ne se melangent pas.
   await conn.query('SELECT id FROM projects WHERE id=$1 FOR UPDATE',[pid]);
   const task=await conn.query<{status_id:string}>(
    'SELECT status_id FROM tasks WHERE id=$1 AND project_id=$2 FOR UPDATE',
    [movingTaskId,pid]
   );
   if(!task.rows[0])throw new HttpError(404,'Tâche introuvable.');
   const target=await conn.query(
    'SELECT 1 FROM kanban_statuses WHERE id=$1 AND project_id=$2',[sid,pid]
   );
   if(!target.rowCount)throw new HttpError(400,'État hors de ce projet.');

   const originalStatus=task.rows[0].status_id;
   const idsIn=async(statusId:string):Promise<string[]>=>{
    const result=await conn.query<{id:string}>(`
     SELECT t.id FROM tasks t
     LEFT JOIN task_kanban_order o ON o.task_id=t.id
     WHERE t.project_id=$1 AND t.status_id=$2 AND t.id<>$3
     ORDER BY COALESCE(o.position,2147483647),t.created_at,t.id
    `,[pid,statusId,movingTaskId]);
    return result.rows.map(row=>row.id);
   };
   const destination=await idsIn(sid);
   const index=beforeTaskId===null?destination.length:destination.indexOf(beforeTaskId);
   if(index<0)throw new HttpError(400,'La carte de référence ne se trouve pas dans la colonne cible.');
   destination.splice(index,0,movingTaskId);
   const origin=originalStatus!==sid?await idsIn(originalStatus):[];

   await conn.query(
    'UPDATE tasks SET status_id=$1,updated_at=now() WHERE id=$2 AND project_id=$3',
    [sid,movingTaskId,pid]
   );
   const saveRanks=async(ids:string[]):Promise<void>=>{
    for(let i=0;i<ids.length;i++){
     await conn.query(`
      INSERT INTO task_kanban_order(task_id,position) VALUES($1,$2)
      ON CONFLICT(task_id) DO UPDATE SET position=EXCLUDED.position
     `,[ids[i],i]);
    }
   };
   await saveRanks(destination);
   await saveRanks(origin);
   await conn.query('COMMIT');
   return send(res,200,{ok:true});
  }catch(e){await conn.query('ROLLBACK');throw e;}
  finally{conn.release();}
 }
 const taskId=idFrom(path,/^\/api\/data\/tasks\/([a-f\d-]{36})$/i);
 if(taskId&&(m==='PATCH'||m==='DELETE')){
  const pid=await taskProject(uid,taskId,true);
  if(m==='DELETE'){await pool.query('DELETE FROM tasks WHERE id=$1',[taskId]);return send(res,200,{ok:true});}
  const b=await body(req);
  if(str(b.projectId)!==pid)throw new HttpError(400,'Déplacer une tâche entre projets n’est pas disponible.');
  const sid=required(b.statusId,'État',40);
  const st=await pool.query('SELECT 1 FROM kanban_statuses WHERE id=$1 AND project_id=$2',[sid,pid]);if(!st.rowCount)throw new HttpError(400,'État hors du projet.');
  await pool.query(`UPDATE tasks SET status_id=$1,title=$2,description=$3,priority=$4,start_date=$5,due_date=$6,updated_at=now() WHERE id=$7`,[sid,required(b.title,'Tâche',200),str(b.description).slice(0,4000),priority(b.priority),optionalDate(b.startDate),optionalDate(b.dueDate),taskId]);
  return send(res,200,{ok:true});
 }
 const taskSub=idFrom(path,/^\/api\/data\/tasks\/([a-f\d-]{36})\/subtasks$/i);
 if(taskSub&&m==='POST'){
  await taskProject(uid,taskSub,true);const b=await body(req);
  await pool.query(`INSERT INTO subtasks(task_id,title,position) VALUES($1,$2,(SELECT COALESCE(MAX(position)+1,0) FROM subtasks WHERE task_id=$1))`,[taskSub,required(b.title,'Sous-tâche',250)]);
  return send(res,201,{ok:true});
 }
 const subId=idFrom(path,/^\/api\/data\/subtasks\/([a-f\d-]{36})$/i);
 if(subId&&m==='PATCH'){
  const r=await pool.query<{task_id:string}>(`SELECT task_id FROM subtasks WHERE id=$1`,[subId]);if(!r.rows[0])throw new HttpError(404,'Sous-tâche introuvable.');
  await taskProject(uid,r.rows[0].task_id,true);const b=await body(req);
  if(typeof b.done!=='boolean')throw new HttpError(400,'Valeur done invalide.');
  await pool.query('UPDATE subtasks SET done=$1 WHERE id=$2',[b.done,subId]);return send(res,200,{ok:true});
 }
 const commentTask=idFrom(path,/^\/api\/data\/tasks\/([a-f\d-]{36})\/comments$/i);
 if(commentTask&&m==='POST'){
  const projectId=await taskProject(uid,commentTask);const b=await body(req);
  const userRole=await projectRole(uid,projectId);
  if(userRole.role==='viewer')throw new HttpError(403,'Lecture seule.');
  await pool.query(`INSERT INTO task_comments(task_id,author_id,body) VALUES($1,$2,$3)`,[commentTask,uid,required(b.body,'Commentaire',3000)]);
  return send(res,201,{ok:true});
 }
 const notificationId=idFrom(path,/^\/api\/data\/notifications\/([a-f\d-]{36})\/read$/i);
 if(notificationId&&m==='PATCH'){
  await pool.query('UPDATE notifications SET is_read=true WHERE id=$1 AND user_id=$2',[notificationId,uid]);return send(res,200,{ok:true});
 }
 const roleMatch=path.match(/^\/api\/data\/projects\/([a-f\d-]{36})\/members\/([a-f\d-]{36})\/role$/i);
 if(roleMatch&&m==='PATCH'){
  const pid=roleMatch[1],target=roleMatch[2],my=await requireManager(uid,pid),b=await body(req);
  if(!['admin','editor','viewer'].includes(str(b.role)))throw new HttpError(400,'Rôle invalide.');
  const r=await pool.query<{role:string}>(`SELECT role FROM workspace_members WHERE workspace_id=$1 AND user_id=$2`,[my.workspace_id,target]);
  if(!r.rows[0])throw new HttpError(404,'Membre introuvable.');
  if(r.rows[0].role==='owner')throw new HttpError(403,'Impossible de modifier le propriétaire.');
  if(my.role==='admin'&&(r.rows[0].role==='admin'||b.role==='admin'))throw new HttpError(403,'Rôle administrateur réservé au propriétaire.');
  await pool.query(`UPDATE workspace_members SET role=$1 WHERE workspace_id=$2 AND user_id=$3`,[b.role,my.workspace_id,target]);return send(res,200,{ok:true});
 }
 throw new HttpError(404,'Route de données introuvable.');
}
