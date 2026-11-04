import React,{createContext,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSQLiteContext} from 'expo-sqlite';
import {runtime} from '../config/runtime';
import {apiConfigured,getSessionToken,saveSessionToken,clearSessionToken} from '../config/api';
import {remoteRegister,remoteLogin,remoteMe,remoteLogout} from '../services/authService';
import type {User} from '../types/models';
import {DEMO_EMAIL,DEMO_PASSWORD,getLocalUser,loginLocal,registerLocal} from '../db/repositories/localAccountRepository';
const KEY='@taskify/local-user-id';
const OLD_KEY='@taskify/demo-enabled';
type Mode='local'|'remote'|null;
type AuthValue={
 user:User|null;isAuthenticated:boolean;loading:boolean;mode:Mode;
 login:(email:string,password:string)=>Promise<void>;
 signUp:(name:string,email:string,password:string)=>Promise<void>;
 enterDemo:()=>Promise<void>;logout:()=>Promise<void>;
};
const Context=createContext<AuthValue|null>(null);
export function AuthProvider({children}:{children:ReactNode}){
 const db=useSQLiteContext();
 const [user,setUser]=useState<User|null>(null);
 const [mode,setMode]=useState<Mode>(null);
 const [loading,setLoading]=useState(true);
 useEffect(()=>{let active=true;(async()=>{
  try{
   const token=apiConfigured?await getSessionToken():null;
   if(token){
    try{const {user:remote}=await remoteMe();if(active){setUser(remote);setMode('remote');}return;}
    catch(e){if(e instanceof Error&&/Session expirée|Connexion nécessaire|Session absente/i.test(e.message))await clearSessionToken();}
   }
   let id=await AsyncStorage.getItem(KEY);
   if(!id&&(await AsyncStorage.getItem(OLD_KEY))==='true')id=runtime.demoUserId;
   if(id){const account=await getLocalUser(db,id);if(account&&active){setUser(account);setMode('local');}}
  }catch{/* La démo locale reste accessible. */}
  finally{if(active)setLoading(false);}
 })();return()=>{active=false};},[db]);
 const rememberLocal=async(account:User)=>{
  await AsyncStorage.setItem(KEY,account.id);await AsyncStorage.removeItem(OLD_KEY);
  await clearSessionToken();setUser(account);setMode('local');
 };
 const rememberRemote=async(token:string,account:User)=>{
  await saveSessionToken(token);await AsyncStorage.removeItem(KEY);await AsyncStorage.removeItem(OLD_KEY);
  setUser(account);setMode('remote');
 };
 const value=useMemo<AuthValue>(()=>({
  user,mode,isAuthenticated:!!user,loading,
  login:async(email,password)=>{
   if(apiConfigured){const r=await remoteLogin(email,password);await rememberRemote(r.token,r.user);}
   else await rememberLocal(await loginLocal(db,email,password));
  },
  signUp:async(name,email,password)=>{
   if(apiConfigured){const r=await remoteRegister(name,email,password);await rememberRemote(r.token,r.user);}
   else await rememberLocal(await registerLocal(db,name,email,password));
  },
  enterDemo:async()=>rememberLocal(await loginLocal(db,DEMO_EMAIL,DEMO_PASSWORD)),
  logout:async()=>{
   if(mode==='remote')try{await remoteLogout();}catch{await clearSessionToken();}
   await AsyncStorage.removeItem(KEY);await AsyncStorage.removeItem(OLD_KEY);
   setUser(null);setMode(null);
  },
 }),[db,user,loading,mode]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useAuth(){const v=useContext(Context);if(!v)throw new Error('AuthProvider manquant');return v;}
export const demoAccountId=runtime.demoUserId;
