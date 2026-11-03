import React,{createContext,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSQLiteContext} from 'expo-sqlite';
import {runtime} from '../config/runtime';
import type {User} from '../types/models';
import {DEMO_EMAIL,DEMO_PASSWORD,getLocalUser,loginLocal,registerLocal} from '../db/repositories/localAccountRepository';
const KEY='@taskify/local-user-id';
const OLD_KEY='@taskify/demo-enabled';
type AuthValue={
 user:User|null;isAuthenticated:boolean;loading:boolean;
 login:(email:string,password:string)=>Promise<void>;
 signUp:(name:string,email:string,password:string)=>Promise<void>;
 enterDemo:()=>Promise<void>;logout:()=>Promise<void>;
};
const AuthContext=createContext<AuthValue|null>(null);
export function AuthProvider({children}:{children:ReactNode}){
 const db=useSQLiteContext();
 const[user,setUser]=useState<User|null>(null);
 const[loading,setLoading]=useState(true);
 useEffect(()=>{let active=true;(async()=>{
  try {
   let id=await AsyncStorage.getItem(KEY);
   if(!id&&(await AsyncStorage.getItem(OLD_KEY))==='true')id=runtime.demoUserId;
   if(id){const account=await getLocalUser(db,id);if(active&&account)setUser(account);}
  }catch{}finally{if(active)setLoading(false);}
 })();return()=>{active=false};},[db]);
 const remember=async(account:User)=>{await AsyncStorage.setItem(KEY,account.id);await AsyncStorage.removeItem(OLD_KEY);setUser(account);};
 const value=useMemo<AuthValue>(()=>({user,isAuthenticated:!!user,loading,
  login:async(email,password)=>{await remember(await loginLocal(db,email,password));},
  signUp:async(name,email,password)=>{await remember(await registerLocal(db,name,email,password));},
  enterDemo:async()=>{await remember(await loginLocal(db,DEMO_EMAIL,DEMO_PASSWORD));},
  logout:async()=>{await AsyncStorage.removeItem(KEY);await AsyncStorage.removeItem(OLD_KEY);setUser(null);},
 }),[db,user,loading]);
 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(){const v=useContext(AuthContext);if(!v)throw new Error('AuthProvider manquant');return v;}
export const demoAccountId=runtime.demoUserId;
