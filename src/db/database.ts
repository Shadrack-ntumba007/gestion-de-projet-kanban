import type { SQLiteDatabase } from 'expo-sqlite';
import { demoAssignees,demoComments,demoMembers,demoNotifications,demoProjects,demoStatuses,demoSubtasks,demoTasks,demoUsers,demoWorkspace } from '../data/demoData';
export const DATABASE_NAME='taskify-local.db';
const DATABASE_VERSION=1;
export async function migrateDbIfNeeded(db:SQLiteDatabase):Promise<void> {
 await db.execAsync('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
 const row=await db.getFirstAsync<{user_version:number}>('PRAGMA user_version');
 if((row?.user_version ?? 0)>=DATABASE_VERSION) return;
 await db.execAsync(`
 CREATE TABLE IF NOT EXISTS workspaces(id TEXT PRIMARY KEY,name TEXT NOT NULL,owner_id TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL UNIQUE);
 CREATE TABLE IF NOT EXISTS projects(id TEXT PRIMARY KEY,workspace_id TEXT NOT NULL REFERENCES workspaces(id),title TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',icon TEXT NOT NULL DEFAULT '💻',priority TEXT NOT NULL DEFAULT 'medium',due_date TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS project_members(project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,user_id TEXT NOT NULL REFERENCES users(id),role TEXT NOT NULL,PRIMARY KEY(project_id,user_id));
 CREATE TABLE IF NOT EXISTS statuses(id TEXT PRIMARY KEY,project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,name TEXT NOT NULL,color TEXT NOT NULL,position INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS tasks(id TEXT PRIMARY KEY,project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,status_id TEXT NOT NULL REFERENCES statuses(id) ON DELETE RESTRICT,title TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',priority TEXT NOT NULL DEFAULT 'medium',start_date TEXT,due_date TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS task_assignees(task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,user_id TEXT NOT NULL REFERENCES users(id),PRIMARY KEY(task_id,user_id));
 CREATE TABLE IF NOT EXISTS subtasks(id TEXT PRIMARY KEY,task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,title TEXT NOT NULL,done INTEGER NOT NULL DEFAULT 0,position INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS comments(id TEXT PRIMARY KEY,task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,author_id TEXT NOT NULL REFERENCES users(id),body TEXT NOT NULL,created_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS notifications(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),title TEXT NOT NULL,body TEXT NOT NULL,created_at TEXT NOT NULL,read INTEGER NOT NULL DEFAULT 0);
 CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON tasks(project_id,status_id);
 CREATE INDEX IF NOT EXISTS idx_statuses_project_position ON statuses(project_id,position);
 CREATE INDEX IF NOT EXISTS idx_assignees_user ON task_assignees(user_id);
 `);
 // Pré-remplissage uniquement à la première migration : pas de données immobilières.
 const count=await db.getFirstAsync<{count:number}>('SELECT COUNT(*) AS count FROM workspaces');
 if(!count?.count) await db.withTransactionAsync(async()=>{
  await db.runAsync('INSERT INTO workspaces(id,name,owner_id) VALUES (?,?,?)',demoWorkspace.id,demoWorkspace.name,demoWorkspace.ownerId);
  for(const u of demoUsers) await db.runAsync('INSERT INTO users(id,name,email) VALUES (?,?,?)',u.id,u.name,u.email);
  for(const p of demoProjects) await db.runAsync('INSERT INTO projects(id,workspace_id,title,description,icon,priority,due_date,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)',p.id,p.workspaceId,p.title,p.description,p.icon,p.priority,p.dueDate,p.createdAt,p.updatedAt);
  for(const m of demoMembers) await db.runAsync('INSERT INTO project_members(project_id,user_id,role) VALUES (?,?,?)',m.projectId,m.userId,m.role);
  for(const s of demoStatuses) await db.runAsync('INSERT INTO statuses(id,project_id,name,color,position) VALUES (?,?,?,?,?)',s.id,s.projectId,s.name,s.color,s.position);
  for(const t of demoTasks) await db.runAsync('INSERT INTO tasks(id,project_id,status_id,title,description,priority,start_date,due_date,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)',t.id,t.projectId,t.statusId,t.title,t.description,t.priority,t.startDate,t.dueDate,t.createdAt,t.updatedAt);
  for(const a of demoAssignees) await db.runAsync('INSERT INTO task_assignees(task_id,user_id) VALUES (?,?)',a.taskId,a.userId);
  for(const s of demoSubtasks) await db.runAsync('INSERT INTO subtasks(id,task_id,title,done,position) VALUES (?,?,?,?,?)',s.id,s.taskId,s.title,s.done?1:0,s.position);
  for(const c of demoComments) await db.runAsync('INSERT INTO comments(id,task_id,author_id,body,created_at) VALUES (?,?,?,?,?)',c.id,c.taskId,c.authorId,c.body,c.createdAt);
  for(const n of demoNotifications) await db.runAsync('INSERT INTO notifications(id,user_id,title,body,created_at,read) VALUES (?,?,?,?,?,?)',n.id,n.userId,n.title,n.body,n.createdAt,n.read?1:0);
 });
 await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
