import React,{createContext,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {runtime} from '../config/runtime';
/** Démo locale uniquement : aucun mot de passe ni jeton sauvegardé. */
const KEY='@taskify/demo-enabled';
type AuthValue={isAuthenticated:boolean;loading:boolean;enterDemo:()=>Promise<void>;logout:()=>Promise<void>};
const AuthContext=createContext<AuthValue|null>(null);
export function AuthProvider({children}:{children:ReactNode}){
 const [isAuthenticated,setAuthenticated]=useState(false);const[loading,setLoading]=useState(true);
 useEffect(()=>{AsyncStorage.getItem(KEY).then(v=>setAuthenticated(v==='true')).catch(()=>{}).finally(()=>setLoading(false));},[]);
 const value=useMemo<AuthValue>(()=>({isAuthenticated,loading,
  enterDemo:async()=>{await AsyncStorage.setItem(KEY,'true');setAuthenticated(true);},
  logout:async()=>{await AsyncStorage.removeItem(KEY);setAuthenticated(false);},
 }),[isAuthenticated,loading]);
 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error('AuthProvider manquant');return value;}
export const demoAccountId=runtime.demoUserId;
