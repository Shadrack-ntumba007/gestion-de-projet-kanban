import React,{createContext,useCallback,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
import {useSQLiteContext} from 'expo-sqlite';
import type {AppSnapshot,NewProject,NewTask,ProjectRole} from '../types/models';
import {loadSnapshot} from '../db/repositories/snapshotRepository';
import {insertProject,updateProject,updateProjectRole} from '../db/repositories/projectRepository';
import {insertTask,updateTask,deleteTask,toggleSubtask,createSubtask,createComment} from '../db/repositories/taskRepository';
import {addStatus,editStatus,removeStatus} from '../db/repositories/statusRepository';
import {markNotificationRead} from '../db/repositories/notificationRepository';
import {runtime} from '../config/runtime';
import {canEdit,canManageMembers} from '../utils/permissions';
type DataValue={
 data:AppSnapshot|null; loading:boolean; reload:()=>Promise<void>;
 createProject:(p:NewProject)=>Promise<string>; saveProject:(id:string,p:NewProject)=>Promise<void>;
 createTask:(t:NewTask)=>Promise<string>;saveTask:(id:string,t:NewTask)=>Promise<void>;removeTask:(id:string)=>Promise<void>;
 createStatus:(p:string,n:string,c:string)=>Promise<void>;saveStatus:(id:string,n:string,c:string)=>Promise<void>;deleteStatus:(id:string)=>Promise<void>;
 setSubtask:(id:string,done:boolean)=>Promise<void>;addSubtask:(taskId:string,title:string)=>Promise<void>;
 addComment:(taskId:string,body:string)=>Promise<void>;readNotification:(id:string)=>Promise<void>;
 setMemberRole:(projectId:string,userId:string,role:ProjectRole)=>Promise<void>;
 roleFor:(projectId:string)=>ProjectRole|undefined;
};
const Context=createContext<DataValue|null>(null);
export function DataProvider({children}:{children:ReactNode}){
 const db=useSQLiteContext();const[data,setData]=useState<AppSnapshot|null>(null);const[loading,setLoading]=useState(true);
 const reload=useCallback(async()=>{setData(await loadSnapshot(db));setLoading(false);},[db]);
 useEffect(()=>{reload().catch(()=>setLoading(false));},[reload]);
 const roleFor=useCallback((projectId:string)=>data?.members.find(m=>m.projectId===projectId&&m.userId===runtime.demoUserId)?.role,[data]);
 const requireEdit=(projectId:string)=>{if(!canEdit(roleFor(projectId)))throw new Error('Droits insuffisants pour modifier ce projet.');};
 const changed=async(action:()=>Promise<void>)=>{await action();await reload();};
 const value=useMemo<DataValue>(()=>({
 data,loading,reload,roleFor,
 createProject:async p=>{if(!p.title.trim())throw new Error('Le titre est requis.');const id=await insertProject(db,p);await reload();return id;},
 saveProject:async(id,p)=>{requireEdit(id);await changed(()=>updateProject(db,id,p));},
 createTask:async t=>{requireEdit(t.projectId);if(!t.title.trim())throw new Error('Le titre est requis.');const id=await insertTask(db,t);await reload();return id;},
 saveTask:async(id,t)=>{requireEdit(t.projectId);await changed(()=>updateTask(db,id,t));},
 removeTask:async id=>{const t=data?.tasks.find(x=>x.id===id);if(!t)throw new Error('Tâche absente.');requireEdit(t.projectId);await changed(()=>deleteTask(db,id));},
 createStatus:async(p,n,c)=>{requireEdit(p);if(!n.trim())throw new Error('Le nom est requis.');await changed(()=>addStatus(db,p,n,c));},
 saveStatus:async(id,n,c)=>{const s=data?.statuses.find(x=>x.id===id);if(!s)throw new Error('État absent.');requireEdit(s.projectId);await changed(()=>editStatus(db,id,n,c));},
 deleteStatus:async id=>{const s=data?.statuses.find(x=>x.id===id);if(!s)throw new Error('État absent.');requireEdit(s.projectId);await changed(()=>removeStatus(db,id));},
 setSubtask:async(id,done)=>{const s=data?.subtasks.find(x=>x.id===id),t=data?.tasks.find(x=>x.id===s?.taskId);if(!t)throw new Error('Sous-tâche absente.');requireEdit(t.projectId);await changed(()=>toggleSubtask(db,id,done));},
 addSubtask:async(id,title)=>{const t=data?.tasks.find(x=>x.id===id);if(!t)throw new Error('Tâche absente.');requireEdit(t.projectId);if(!title.trim())return;await changed(()=>createSubtask(db,id,title));},
 addComment:async(id,body)=>{if(!body.trim())return;await changed(()=>createComment(db,id,runtime.demoUserId,body));},
 readNotification:async id=>{await changed(()=>markNotificationRead(db,id));},
 setMemberRole:async(pid,uid,role)=>{if(!canManageMembers(roleFor(pid)))throw new Error('Droits insuffisants.');await changed(()=>updateProjectRole(db,pid,uid,role));},
 }),[db,data,loading,reload,roleFor]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useData(){const ctx=useContext(Context);if(!ctx)throw new Error('DataProvider manquant');return ctx;}
