export type ID = string;
export type Priority = 'low' | 'medium' | 'high';
export type ProjectRole = 'owner' | 'admin' | 'editor' | 'viewer';
export type ThemePreference = 'light' | 'dark' | 'auto';
export interface User { id:ID; name:string; email:string; }
export interface Workspace { id:ID; name:string; ownerId:ID; }
export interface Project {
 id:ID; workspaceId:ID; title:string; description:string; icon:string;
 priority:Priority; dueDate:string|null; createdAt:string; updatedAt:string;
}
export interface ProjectMember { projectId:ID; userId:ID; role:ProjectRole; }
export interface KanbanStatus { id:ID; projectId:ID; name:string; color:string; position:number; }
export interface Task {
 id:ID; projectId:ID; statusId:ID; title:string; description:string;
 priority:Priority; startDate:string|null; dueDate:string|null;
 createdAt:string; updatedAt:string;
}
export interface TaskAssignee { taskId:ID; userId:ID; }
export interface Subtask { id:ID; taskId:ID; title:string; done:boolean; position:number; }
export interface TaskComment { id:ID; taskId:ID; authorId:ID; body:string; createdAt:string; }
export interface Notification { id:ID; userId:ID; title:string; body:string; createdAt:string; read:boolean; }
export interface AppSnapshot {
 users:User[]; workspace:Workspace; projects:Project[]; members:ProjectMember[];
 statuses:KanbanStatus[]; tasks:Task[]; assignees:TaskAssignee[];
 subtasks:Subtask[]; comments:TaskComment[]; notifications:Notification[];
}
export type NewProject = Pick<Project,'title'|'description'|'icon'|'priority'|'dueDate'>;
export type NewTask = Pick<Task,'projectId'|'statusId'|'title'|'description'|'priority'|'startDate'|'dueDate'>;
