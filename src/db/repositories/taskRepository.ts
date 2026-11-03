import type {SQLiteDatabase} from 'expo-sqlite';
import type {NewTask} from '../../types/models';
import {createId} from '../../utils/ids';
export async function insertTask(db:SQLiteDatabase,input:NewTask):Promise<string>{
 const id=createId('task'),now=new Date().toISOString();
 await db.runAsync('INSERT INTO tasks(id,project_id,status_id,title,description,priority,start_date,due_date,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)',id,input.projectId,input.statusId,input.title.trim(),input.description.trim(),input.priority,input.startDate,input.dueDate,now,now);return id;
}
export async function updateTask(db:SQLiteDatabase,id:string,input:NewTask):Promise<void>{
 await db.runAsync('UPDATE tasks SET status_id=?,title=?,description=?,priority=?,start_date=?,due_date=?,updated_at=? WHERE id=? AND project_id=?',input.statusId,input.title.trim(),input.description.trim(),input.priority,input.startDate,input.dueDate,new Date().toISOString(),id,input.projectId);
}
export async function deleteTask(db:SQLiteDatabase,id:string):Promise<void>{await db.runAsync('DELETE FROM tasks WHERE id=?',id);}
export async function toggleSubtask(db:SQLiteDatabase,id:string,done:boolean):Promise<void>{await db.runAsync('UPDATE subtasks SET done=? WHERE id=?',done?1:0,id);}
export async function createSubtask(db:SQLiteDatabase,taskId:string,title:string):Promise<void>{
 const row=await db.getFirstAsync<{n:number}>('SELECT COALESCE(MAX(position),-1)+1 AS n FROM subtasks WHERE task_id=?',taskId);
 await db.runAsync('INSERT INTO subtasks(id,task_id,title,done,position) VALUES(?,?,?,?,?)',createId('sub'),taskId,title.trim(),0,row?.n??0);
}
export async function createComment(db:SQLiteDatabase,taskId:string,authorId:string,body:string):Promise<void>{
 await db.runAsync('INSERT INTO comments(id,task_id,author_id,body,created_at) VALUES(?,?,?,?,?)',createId('comment'),taskId,authorId,body.trim(),new Date().toISOString());
}
