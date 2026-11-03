import type {SQLiteDatabase} from 'expo-sqlite';
import type {NewProject,Project,ProjectRole} from '../../types/models';
import {createId} from '../../utils/ids';
import {runtime} from '../../config/runtime';
import {statusColors} from '../../constants/theme';
export async function insertProject(db:SQLiteDatabase,input:NewProject):Promise<string>{
 const id=createId('project'),now=new Date().toISOString();
 await db.withTransactionAsync(async()=>{
  await db.runAsync('INSERT INTO projects(id,workspace_id,title,description,icon,priority,due_date,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)',id,runtime.workspaceId,input.title.trim(),input.description.trim(),input.icon,input.priority,input.dueDate,now,now);
  await db.runAsync('INSERT INTO project_members(project_id,user_id,role) VALUES(?,?,?)',id,runtime.demoUserId,'owner');
  for(const [i,name] of ['À faire','En cours','Terminé'].entries()) await db.runAsync('INSERT INTO statuses(id,project_id,name,color,position) VALUES(?,?,?,?,?)',createId('status'),id,name,statusColors[i],i);
 });
 return id;
}
export async function updateProject(db:SQLiteDatabase,id:string,input:NewProject):Promise<void>{
 await db.runAsync('UPDATE projects SET title=?,description=?,icon=?,priority=?,due_date=?,updated_at=? WHERE id=?',input.title.trim(),input.description.trim(),input.icon,input.priority,input.dueDate,new Date().toISOString(),id);
}
export async function updateProjectRole(db:SQLiteDatabase,projectId:string,userId:string,role:ProjectRole):Promise<void>{
 await db.runAsync('UPDATE project_members SET role=? WHERE project_id=? AND user_id=? AND role<>?',role,projectId,userId,'owner');
}
