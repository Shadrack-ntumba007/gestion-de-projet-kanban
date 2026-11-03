import React,{createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {ThemePreference} from '../types/models';
const KEY='@taskify/theme';
type Preferences={theme:ThemePreference;setTheme:(theme:ThemePreference)=>void};
const Context=createContext<Preferences|null>(null);
export function PreferencesProvider({children}:{children:ReactNode}){
 const[theme,setThemeState]=useState<ThemePreference>('auto');
 useEffect(()=>{AsyncStorage.getItem(KEY).then(v=>{if(v==='light'||v==='dark'||v==='auto')setThemeState(v);}).catch(()=>{});},[]);
 const setTheme=(v:ThemePreference)=>{setThemeState(v);AsyncStorage.setItem(KEY,v).catch(()=>{});};
 return <Context.Provider value={{theme,setTheme}}>{children}</Context.Provider>;
}
export function usePreferences(){const x=useContext(Context);if(!x)throw new Error('PreferencesProvider manquant');return x;}
