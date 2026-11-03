import React,{createContext,useCallback,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
import {useSQLiteContext} from 'expo-sqlite';
import type {AppSnapshot,NewProject,NewTask,ProjectRole} from '../types/models';
import {loadSnapshot} from '../db/repositories/snapshotRepository';
import {insertProject,updateProject,updateProjectRole} from '../db/repositories/projectRepository';
import {insertTask,updateTask,deleteTask,toggleSubtask,createSubtask,createComment} from '../db/repositories/taskRepository';
import {addStatus,editStatus,removeStatus} from '../db/repositories/statusRepository';
import {markNotificationRead} from '../db/repositories/notificationRepository';
import * as remote from '../services/remoteDataService';
import {runtime} from '../config/runtime';
import {useAuth} from './AuthContext';
import {canEdit,canManageMembers} from '../utils/permissions';
type DataValue={
 data:AppSnapshot|null;loading:boolean;syncError:string|null;reload:()=>Promise<void>;
 createProject:(p:NewProject)=>Promise<string>;saveProject:(id:string,p:NewProject)=>Promise<void>;
 createTask:(t:NewTask)=>Promise<string>;saveTask:(id:string,t:NewTask)=>Promise<void>;removeTask:(id:string)=>Promise<void>;
 createStatus:(p:string,n:string,c:string)=>Promise<void>;saveStatus:(id:string,n:string,c:string)=>Promise<void>;deleteStatus:(id:string)=>Promise<void>;
 setSubtask:(id:string,done:boolean)=>Promise<void>;addSubtask:(taskId:string,title:string)=>Promise<void>;
 addComment:(taskId:string,body:string)=>Promise<void>;readNotification:(id:string)=>Promise<void>;
 setMemberRole:(projectId:string,userId:string,role:ProjectRole)=>Promise<void>;
 roleFor:(projectId:string)=>ProjectRole|undefined;
};
const Context=createContext<DataValue|null>(null);
export function DataProvider({children}:{children:ReactNode}){
 const db=useSQLiteContext();const {user,mode}=useAuth();const remoteMode=mode==='remote';
 const userId=user?.id??runtime.demoUserId;
 const [data,setData]=useState<AppSnapshot|null>(null),[loading,setLoading]=useState(true),[syncError,setSyncError]=useState<string|null>(null);
 const reload=useCallback(async()=>{
  try{
   const next=remoteMode?await remote.fetchRemoteData():await loadSnapshot(db);
   setData(next);setSyncError(null);
  }catch(e){setSyncError(e instanceof Error?e.message:'Synchronisation impossible.');throw e;}
  finally{setLoading(false);}
 },[db,remoteMode,userId]);
 useEffect(()=>{setLoading(true);setData(null);reload().catch(()=>{});},[reload]);
 // Actualisation légère pour les changements effectués sur d'autres appareils.
 useEffect(()=>{if(!remoteMode)return;const timer=setInterval(()=>reload().catch(()=>{}),20000);return()=>clearInterval(timer);},[remoteMode,reload]);
 const roleFor=useCallback((pid:string)=>data?.members.find(m=>m.projectId===pid&&m.userId===userId)?.role,[data,userId]);
 const requireEdit=(pid:string)=>{if(!canEdit(roleFor(pid)))throw new Error('Droits insuffisants pour modifier ce projet.');};
 const changed=async(action:()=>Promise<unknown>)=>{await action();await reload();};
 const value=useMemo<DataValue>(()=>({
  data,loading,syncError,reload,roleFor,
  createProject:async p=>{
   if(!p.title.trim())throw new Error('Titre requis.');
   const id=remoteMode?await remote.createRemoteProject(p):await insertProject(db,p,userId);
   await reload();return id;
  },
  saveProject:async(id,p)=>{requireEdit(id);await changed(()=>remoteMode?remote.saveRemoteProject(id,p):updateProject(db,id,p));},
  createTask:async t=>{
   requireEdit(t.projectId);if(!t.title.trim())throw new Error('Titre requis.');
   const id=remoteMode?await remote.createRemoteTask(t):await insertTask(db,t);
   await reload();return id;
  },
  saveTask:async(id,t)=>{requireEdit(t.projectId);await changed(()=>remoteMode?remote.saveRemoteTask(id,t):updateTask(db,id,t));},
  removeTask:async id=>{const t=data?.tasks.find(x=>x.id===id);if(!t)throw new Error('Tâche absente.');requireEdit(t.projectId);await changed(()=>remoteMode?remote.deleteRemoteTask(id):deleteTask(db,id));},
  createStatus:async(p,n,c)=>{requireEdit(p);if(!n.trim())throw new Error('Nom requis.');await changed(()=>remoteMode?remote.createRemoteStatus(p,n,c):addStatus(db,p,n,c));},
  saveStatus:async(id,n,c)=>{const st=data?.statuses.find(s=>s.id===id);if(!st)throw new Error('État absent.');requireEdit(st.projectId);await changed(()=>remoteMode?remote.saveRemoteStatus(id,n,c):editStatus(db,id,n,c));},
  deleteStatus:async id=>{const st=data?.statuses.find(s=>s.id===id);if(!st)throw new Error('État absent.');requireEdit(st.projectId);await changed(()=>remoteMode?remote.deleteRemoteStatus(id):removeStatus(db,id));},
  setSubtask:async(id,done)=>{const st=data?.subtasks.find(s=>s.id===id),t=data?.tasks.find(t=>t.id===st?.taskId);if(!t)throw new Error('Sous-tâche absente.');requireEdit(t.projectId);await changed(()=>remoteMode?remote.saveRemoteSubtask(id,done):toggleSubtask(db,id,done));},
  addSubtask:async(id,title)=>{const t=data?.tasks.find(t=>t.id===id);if(!t)throw new Error('Tâche absente.');requireEdit(t.projectId);if(!title.trim())return;await changed(()=>remoteMode?remote.createRemoteSubtask(id,title):createSubtask(db,id,title));},
  addComment:async(id,body)=>{if(!body.trim())return;const t=data?.tasks.find(t=>t.id===id);if(!t)throw new Error('Tâche absente.');requireEdit(t.projectId);await changed(()=>remoteMode?remote.createRemoteComment(id,body):createComment(db,id,userId,body));},
  readNotification:async id=>{await changed(()=>remoteMode?remote.readRemoteNotification(id):markNotificationRead(db,id));},
  setMemberRole:async(pid,uid,role)=>{if(!canManageMembers(roleFor(pid)))throw new Error('Droits insuffisants.');await changed(()=>remoteMode?remote.saveRemoteMemberRole(pid,uid,role):updateProjectRole(db,pid,uid,role));},
 }),[db,data,loading,syncError,reload,roleFor,userId,remoteMode]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useData(){const ctx=useContext(Context);if(!ctx)throw new Error('DataProvider manquant');return ctx;}
