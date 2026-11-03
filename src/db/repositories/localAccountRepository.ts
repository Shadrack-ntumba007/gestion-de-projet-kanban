import type {SQLiteDatabase} from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import * as bcrypt from 'bcryptjs';
import type {User} from '../../types/models';
import {createId} from '../../utils/ids';
import {validEmail,validPassword} from '../../utils/validation';
import {runtime} from '../../config/runtime';

// bcryptjs reçoit une source aléatoire native lorsque Web Crypto n'est pas disponible.
bcrypt.setRandomFallback(n=>Array.from(Crypto.getRandomBytes(n)));
export const DEMO_EMAIL='demo@taskify.local';
export const DEMO_PASSWORD='12345678';
type AccountRow={id:string;name:string;email:string;password_hash:string};
export async function getLocalUser(db:SQLiteDatabase,id:string):Promise<User|null>{
 const row=await db.getFirstAsync<User>('SELECT id,name,email FROM users WHERE id=?',id);
 return row??null;
}
export async function loginLocal(db:SQLiteDatabase,email:string,password:string):Promise<User>{
 const normal=email.trim().toLowerCase();
 if(normal===DEMO_EMAIL&&password===DEMO_PASSWORD){
  const demo=await getLocalUser(db,runtime.demoUserId);
  if(!demo)throw new Error('Compte de démonstration absent.');
  return demo;
 }
 const found=await db.getFirstAsync<AccountRow>(`SELECT u.id,u.name,u.email,a.password_hash FROM users u
  JOIN local_accounts a ON a.user_id=u.id WHERE lower(u.email)=?`,normal);
 if(!found || !(await bcrypt.compare(password,found.password_hash)))throw new Error('Email ou mot de passe incorrect.');
 return {id:found.id,name:found.name,email:found.email};
}
export async function registerLocal(db:SQLiteDatabase,name:string,email:string,password:string):Promise<User>{
 const normal=email.trim().toLowerCase();
 if(!name.trim()||!validEmail(normal)||!validPassword(password))throw new Error('Nom, email et mot de passe (8 caractères minimum) requis.');
 if(normal===DEMO_EMAIL)throw new Error('Cet email est réservé à la démonstration.');
 if(await db.getFirstAsync('SELECT id FROM users WHERE lower(email)=?',normal))throw new Error('Cet email est déjà utilisé sur cet appareil.');
 const user:User={id:createId('user'),name:name.trim(),email:normal};
 const hash=await bcrypt.hash(password,10);
 await db.withTransactionAsync(async()=>{
  await db.runAsync('INSERT INTO users(id,name,email) VALUES(?,?,?)',user.id,user.name,user.email);
  await db.runAsync('INSERT INTO local_accounts(user_id,password_hash,created_at) VALUES(?,?,?)',user.id,hash,new Date().toISOString());
  // Les invitations préexistantes sur CE téléphone deviennent des accès locaux.
  const invites=await db.getAllAsync<{id:string;project_id:string;role:'admin'|'editor'|'viewer'}>(
   'SELECT id,project_id,role FROM local_invitations WHERE email=? AND accepted_at IS NULL',normal);
  for(const inv of invites){
   await db.runAsync(`INSERT INTO project_members(project_id,user_id,role) VALUES(?,?,?)
    ON CONFLICT(project_id,user_id) DO UPDATE SET role=excluded.role`,inv.project_id,user.id,inv.role);
   await db.runAsync('UPDATE local_invitations SET accepted_at=? WHERE id=?',new Date().toISOString(),inv.id);
  }
 });
 return user;
}
