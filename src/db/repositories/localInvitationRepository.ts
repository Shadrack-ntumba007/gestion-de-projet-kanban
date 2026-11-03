import type {SQLiteDatabase} from 'expo-sqlite';
import type {ProjectRole} from '../../types/models';
import {createId} from '../../utils/ids';
import {validEmail} from '../../utils/validation';
export type LocalInvitation={id:string;project_id:string;email:string;role:'admin'|'editor'|'viewer';created_at:string;accepted_at:string|null};
export async function getLocalInvitations(db:SQLiteDatabase,projectId:string):Promise<LocalInvitation[]>{
 return db.getAllAsync<LocalInvitation>(
  'SELECT * FROM local_invitations WHERE project_id=? AND accepted_at IS NULL ORDER BY created_at DESC',projectId);
}
export async function inviteLocal(db:SQLiteDatabase,projectId:string,email:string,role:ProjectRole,actorId:string):Promise<'member'|'pending'>{
 const e=email.trim().toLowerCase();
 if(!validEmail(e))throw new Error('Adresse e-mail invalide.');
 if(role==='owner')throw new Error('Le rôle propriétaire ne peut être attribué.');
 const actor=await db.getFirstAsync<{role:string}>('SELECT role FROM project_members WHERE project_id=? AND user_id=?',projectId,actorId);
 if(actor?.role!=='owner' && actor?.role!=='admin')throw new Error('Vous devez être admin du projet.');
 const known=await db.getFirstAsync<{id:string}>('SELECT id FROM users WHERE lower(email)=?',e);
 if(known){
  await db.runAsync(`INSERT INTO project_members(project_id,user_id,role) VALUES(?,?,?)
   ON CONFLICT(project_id,user_id) DO UPDATE SET role=excluded.role WHERE role<>'owner'`,projectId,known.id,role);
  return 'member';
 }
 await db.runAsync(`INSERT INTO local_invitations(id,project_id,email,role,created_at,accepted_at)
 VALUES(?,?,?,?,?,NULL) ON CONFLICT(project_id,email)
 DO UPDATE SET role=excluded.role,created_at=excluded.created_at,accepted_at=NULL`,
 createId('inv'),projectId,e,role,new Date().toISOString());
 return 'pending';
}
