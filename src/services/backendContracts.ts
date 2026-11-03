/** Contrats prévus pour une API future, aucune URL/endpoints inventés. */
import type { NewProject, NewTask, Project, Task, User } from '../types/models';
export interface AuthGateway {
 signIn(email:string,password:string):Promise<{user:User;accessToken:string}>;
 signUp(name:string,email:string,password:string):Promise<void>;
 resetPassword(email:string):Promise<void>;
}
export interface CollaborationGateway {
 invite(projectId:string,email:string,role:'admin'|'editor'|'viewer'):Promise<void>;
 subscribeToChanges(projectId:string,onChange:()=>void):()=>void;
}
export interface ProjectGateway { create(input:NewProject):Promise<Project>; list():Promise<Project[]>; }
export interface TaskGateway { create(input:NewTask):Promise<Task>; list(projectId:string):Promise<Task[]>; }
export class BackendNotConfiguredError extends Error {
 constructor(){super('Service distant non configuré. Cette version fonctionne uniquement en démonstration locale.');}
}
export const backendStatus = { auth:false, synchronization:false, invitations:false, oauth:false, push:false, encryptionE2E:false } as const;
