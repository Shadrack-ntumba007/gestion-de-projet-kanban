import React,{useState} from 'react';
import {Alert,Text,View,Pressable,StyleSheet} from 'react-native';
import {Screen} from '../../components/ui/Screen';
import {Field} from '../../components/ui/Field';
import {Button} from '../../components/ui/Button';
import {Segmented} from '../../components/ui/Segmented';
import {palette} from '../../constants/theme';
import {useData} from '../../context/DataContext';
import {useAppNavigation} from '../../hooks/useAppNavigation';
import type {Priority,NewProject} from '../../types/models';
import {calendarDateToIso} from '../../utils/dates';
export function ProjectForm({projectId}:{projectId?:string}){
 const nav=useAppNavigation(),{data,createProject,saveProject}=useData(),project=data?.projects.find(p=>p.id===projectId);
 const[title,setTitle]=useState(project?.title??''),[description,setDesc]=useState(project?.description??''),[icon,setIcon]=useState(project?.icon??'💻'),[priority,setPriority]=useState<Priority>(project?.priority??'medium'),[date,setDate]=useState(project?.dueDate?.slice(0,10)??''),[busy,setBusy]=useState(false);
 const save=async()=>{
  if(!title.trim()){Alert.alert('Champ requis','Indiquez le nom du projet.');return;}
  if(date && !calendarDateToIso(date)){Alert.alert('Date invalide','Saisissez une date réelle au format AAAA-MM-JJ.');return;}
  const dueDate=date?calendarDateToIso(date):null;
  const input:NewProject={title,description,icon,priority,dueDate};setBusy(true);
  try{if(projectId){await saveProject(projectId,input);nav.goBack();}else{const id=await createProject(input);nav.replace('ProjectBoard',{projectId:id});}}catch(e){Alert.alert('Erreur',e instanceof Error?e.message:'Impossible d’enregistrer.');}finally{setBusy(false);}
 };
 return <Screen title={projectId?'Modifier le projet':'Nouveau projet'} back>
 <Field label="Nom du projet" value={title} onChangeText={setTitle} placeholder="Nom du projet"/>
 <Field label="Description" value={description} onChangeText={setDesc} multiline placeholder="Décrivez l’objectif"/>
 <Text style={s.label}>Icône & thème</Text><View style={s.iconRow}>{['💻','🚀','🎨','☀️','🌱','📊'].map(x=><Pressable key={x} onPress={()=>setIcon(x)} style={[s.icon,icon===x&&{backgroundColor:palette.lilac,borderColor:palette.primary}]}><Text style={{fontSize:24}}>{x}</Text></Pressable>)}</View>
 <Field label="Date de fin (AAAA-MM-JJ, facultatif)" value={date} onChangeText={setDate} placeholder="2026-12-31"/>
 <Text style={s.label}>Priorité</Text><Segmented value={priority} onChange={setPriority} options={[{value:'low',label:'Faible'},{value:'medium',label:'Moyenne'},{value:'high',label:'Haute'}]}/>
 <Button title={busy?'Enregistrement...':projectId?'Enregistrer le projet':'Créer le projet'} disabled={busy} onPress={save}/>
 </Screen>;
}
const s=StyleSheet.create({label:{fontSize:15,color:palette.ink,fontWeight:'700',marginBottom:12},iconRow:{flexDirection:'row',flexWrap:'wrap',gap:9,marginBottom:24},icon:{width:48,height:48,borderRadius:23,backgroundColor:palette.subtle,borderColor:palette.border,borderWidth:1,alignItems:'center',justifyContent:'center'}});
