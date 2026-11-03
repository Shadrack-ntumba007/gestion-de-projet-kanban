import type {SQLiteDatabase} from 'expo-sqlite';
import type {AppSnapshot, Project, KanbanStatus, Task, Subtask, Notification, ProjectRole} from '../../types/models';
import {runtime} from '../../config/runtime';
type ProjectRow={id:string;workspace_id:string;title:string;description:string;icon:string;priority:Project['priority'];due_date:string|null;created_at:string;updated_at:string};
type StatusRow={id:string;project_id:string;name:string;color:string;position:number};
type TaskRow={id:string;project_id:string;status_id:string;title:string;description:string;priority:Task['priority'];start_date:string|null;due_date:string|null;created_at:string;updated_at:string};
export async function loadSnapshot(db:SQLiteDatabase):Promise<AppSnapshot>{
 const [users,workspaces,projects,roles,statuses,tasks,assignees,subtasks,comments,notifications]=await Promise.all([
 db.getAllAsync<{id:string;name:string;email:string}>('SELECT * FROM users'),
 db.getAllAsync<{id:string;name:string;owner_id:string}>('SELECT * FROM workspaces'),
 db.getAllAsync<ProjectRow>('SELECT * FROM projects ORDER BY created_at ASC'),
 db.getAllAsync<{project_id:string;user_id:string;role:ProjectRole}>('SELECT * FROM project_members'),
 db.getAllAsync<StatusRow>('SELECT * FROM statuses ORDER BY position'),
 db.getAllAsync<TaskRow>('SELECT * FROM tasks ORDER BY created_at'),
 db.getAllAsync<{task_id:string;user_id:string}>('SELECT * FROM task_assignees'),
 db.getAllAsync<{id:string;task_id:string;title:string;done:number;position:number}>('SELECT * FROM subtasks ORDER BY position'),
 db.getAllAsync<{id:string;task_id:string;author_id:string;body:string;created_at:string}>('SELECT * FROM comments ORDER BY created_at'),
 db.getAllAsync<{id:string;user_id:string;title:string;body:string;created_at:string;read:number}>('SELECT * FROM notifications ORDER BY created_at DESC'),
 ]);
 const w=workspaces.find(x=>x.id===runtime.workspaceId);
 if(!w) throw new Error('Espace de travail de démonstration introuvable.');
 return {
 users, workspace:{id:w.id,name:w.name,ownerId:w.owner_id},
 projects:projects.map(p=>({id:p.id,workspaceId:p.workspace_id,title:p.title,description:p.description,icon:p.icon,priority:p.priority,dueDate:p.due_date,createdAt:p.created_at,updatedAt:p.updated_at})),
 members:roles.map(m=>({projectId:m.project_id,userId:m.user_id,role:m.role})),
 statuses:statuses.map((s):KanbanStatus=>({id:s.id,projectId:s.project_id,name:s.name,color:s.color,position:s.position})),
 tasks:tasks.map((t):Task=>({id:t.id,projectId:t.project_id,statusId:t.status_id,title:t.title,description:t.description,priority:t.priority,startDate:t.start_date,dueDate:t.due_date,createdAt:t.created_at,updatedAt:t.updated_at})),
 assignees:assignees.map(x=>({taskId:x.task_id,userId:x.user_id})),
 subtasks:subtasks.map((s):Subtask=>({id:s.id,taskId:s.task_id,title:s.title,done:!!s.done,position:s.position})),
 comments:comments.map(c=>({id:c.id,taskId:c.task_id,authorId:c.author_id,body:c.body,createdAt:c.created_at})),
 notifications:notifications.map((n):Notification=>({id:n.id,userId:n.user_id,title:n.title,body:n.body,createdAt:n.created_at,read:!!n.read})),
 };
}
