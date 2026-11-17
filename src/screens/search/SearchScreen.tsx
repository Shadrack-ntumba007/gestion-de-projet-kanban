import React,{useState} from 'react';
import {TextInput,Text,StyleSheet,Pressable} from 'react-native';
import {Screen} from '../../components/ui/Screen';
import {Surface} from '../../components/ui/Surface';
import {type ThemePalette} from '../../constants/theme';
import {useAppTheme} from '../../hooks/useAppTheme';
import {useData} from '../../context/DataContext';
import {useAppNavigation} from '../../hooks/useAppNavigation';
export default function SearchScreen(){
 const {palette}=useAppTheme();
 const s=makeThemeStyles_s(palette);
const{data}=useData(),nav=useAppNavigation(),[query,setQuery]=useState('');const v=query.toLowerCase().trim();return <Screen title="Recherche" back><TextInput style={s.input} value={query} onChangeText={setQuery} placeholder="Rechercher projets et tâches..." placeholderTextColor={palette.muted}/>
 {v.length>0&&<><Text style={s.title}>Projets</Text>{data?.projects.filter(p=>p.title.toLowerCase().includes(v)).map(p=><Pressable key={p.id} onPress={()=>nav.navigate('ProjectBoard',{projectId:p.id})}><Surface><Text>{p.icon} {p.title}</Text></Surface></Pressable>)}<Text style={s.title}>Tâches</Text>{data?.tasks.filter(t=>t.title.toLowerCase().includes(v)).map(t=><Pressable key={t.id} onPress={()=>nav.navigate('TaskDetails',{taskId:t.id})}><Surface><Text>{t.title}</Text></Surface></Pressable>)}</>}
 </Screen>;}
const makeThemeStyles_s=(palette:ThemePalette)=>StyleSheet.create({input:{height:55,backgroundColor:palette.subtle,borderRadius:17,padding:15,fontSize:16,color:palette.ink},title:{fontSize:18,fontWeight:'700',marginTop:23,color:palette.ink}});
