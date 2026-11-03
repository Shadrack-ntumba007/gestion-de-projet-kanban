import type {SQLiteDatabase} from 'expo-sqlite';
import {createId} from '../../utils/ids';
export async function addStatus(db:SQLiteDatabase,projectId:string,name:string,color:string):Promise<void>{
 const pos=await db.getFirstAsync<{n:number}>('SELECT COALESCE(MAX(position),-1)+1 AS n FROM statuses WHERE project_id=?',projectId);
 await db.runAsync('INSERT INTO statuses(id,project_id,name,color,position) VALUES(?,?,?,?,?)',createId('status'),projectId,name.trim(),color,pos?.n??0);
}
export async function editStatus(db:SQLiteDatabase,id:string,name:string,color:string):Promise<void>{
 await db.runAsync('UPDATE statuses SET name=?,color=? WHERE id=?',name.trim(),color,id);
}
export async function removeStatus(db:SQLiteDatabase,id:string):Promise<void>{
 const row=await db.getFirstAsync<{n:number}>('SELECT COUNT(*) AS n FROM tasks WHERE status_id=?',id);
 if(row?.n) throw new Error('Déplacez les tâches avant de supprimer cet état.');
 await db.runAsync('DELETE FROM statuses WHERE id=?',id);
}
