import React,{useState} from 'react';
import {Alert,Text,Pressable,View,StyleSheet} from 'react-native';
import {Screen} from '../../components/ui/Screen';
import {Field} from '../../components/ui/Field';
import {Button} from '../../components/ui/Button';
import {Segmented} from '../../components/ui/Segmented';
import {palette} from '../../constants/theme';
import {useData} from '../../context/DataContext';
import {useAppNavigation} from '../../hooks/useAppNavigation';
import type {Priority,NewTask} from '../../types/models';
import {calendarDateToIso} from '../../utils/dates';
export function TaskForm({taskId,initialProjectId,initialStatusId}:{taskId?:string;initialProjectId?:string;initialStatusId?:string}){
 const nav=useAppNavigation(),{data,createTask,saveTask}=useData(),existing=data?.tasks.find(t=>t.id===taskId);
 const[projectId,setProjectId]=useState(existing?.projectId??initialProjectId??data?.projects[0]?.id??'');
 const statuses=data?.statuses.filter(s=>s.projectId===projectId)??[];
 const[statusId,setStatusId]=useState(existing?.statusId??initialStatusId??statuses[0]?.id??'');
 const[title,setTitle]=useState(existing?.title??''),[description,setDescription]=useState(existing?.description??''),[priority,setPriority]=useState<Priority>(existing?.priority??'medium');
 const[dueDate,setDueDate]=useState(existing?.dueDate?.slice(0,10)??''),[busy,setBusy]=useState(false);
 const save=async()=>{
  if(!title.trim()||!projectId||!statusId){Alert.alert('Champs manquants','Indiquez le titre, le projet et l’état.');return;}
  if(dueDate&&!calendarDateToIso(dueDate)){Alert.alert('Date invalide','Saisissez une date réelle au format AAAA-MM-JJ.');return;}
  const input:NewTask={projectId,statusId,title,description,priority,startDate:existing?.startDate??null,dueDate:dueDate?calendarDateToIso(dueDate):null};setBusy(true);
  try{if(taskId){await saveTask(taskId,input);nav.goBack();}else{const id=await createTask(input);nav.replace('TaskDetails',{taskId:id});}}catch(e){Alert.alert('Erreur',e instanceof Error?e.message:'Erreur');}finally{setBusy(false);}
 };
 return <Screen title={taskId?'Modifier la tâche':'Nouvelle tâche'} back><Text style={s.label}>Projet</Text><View style={s.options}>{(data?.projects??[]).map(p=><Pressable key={p.id} onPress={()=>{setProjectId(p.id);setStatusId(data?.statuses.find(st=>st.projectId===p.id)?.id??'');}} style={[s.option,projectId===p.id&&s.selected]}><Text style={{color:projectId===p.id?palette.white:palette.ink}}>{p.title}</Text></Pressable>)}</View>
 <Field label="Titre de la tâche" value={title} onChangeText={setTitle}/><Field label="Description" value={description} onChangeText={setDescription} multiline/>
 <Text style={s.label}>État</Text><View style={s.options}>{statuses.map(st=><Pressable key={st.id} onPress={()=>setStatusId(st.id)} style={[s.option,st.id===statusId&&s.selected]}><Text style={{color:st.id===statusId?palette.white:palette.ink}}>{st.name}</Text></Pressable>)}</View>
 <Text style={s.label}>Priorité</Text><Segmented value={priority} onChange={setPriority} options={[{value:'low',label:'Faible'},{value:'medium',label:'Moyenne'},{value:'high',label:'Haute'}]}/>
 <Field label="Échéance (AAAA-MM-JJ, facultatif)" value={dueDate} onChangeText={setDueDate} placeholder="2026-12-31"/>
 <Text style={{color:palette.muted,fontSize:13,marginVertical:13}}>L’affectation des personnes, les pièces jointes et la synchronisation d’équipe restent à connecter au backend.</Text>
 <Button title={taskId?'Enregistrer les modifications':'Créer la tâche'} disabled={busy} onPress={save}/></Screen>;
}
const s=StyleSheet.create({label:{fontWeight:'700',color:palette.ink,fontSize:15,marginBottom:9,marginTop:9},options:{flexDirection:'row',flexWrap:'wrap',gap:6,marginBottom:18},option:{backgroundColor:palette.subtle,paddingHorizontal:14,paddingVertical:10,borderRadius:23},selected:{backgroundColor:palette.primary}});
