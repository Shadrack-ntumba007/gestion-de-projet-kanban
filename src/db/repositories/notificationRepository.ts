import type {SQLiteDatabase} from 'expo-sqlite';
export async function markNotificationRead(db:SQLiteDatabase,id:string):Promise<void>{
 await db.runAsync('UPDATE notifications SET read=1 WHERE id=?',id);
}
