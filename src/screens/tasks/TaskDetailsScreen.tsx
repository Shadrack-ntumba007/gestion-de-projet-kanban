import React,{useState} from 'react';
import {RouteProp,useRoute} from '@react-navigation/native';
import {Alert,Pressable,Text,TextInput,View,StyleSheet} from 'react-native';
import {Screen} from '../../components/ui/Screen';
import {Surface} from '../../components/ui/Surface';
import {Button} from '../../components/ui/Button';
import {PriorityChip,StatusChip} from '../../components/ui/Chips';
import {Avatar} from '../../components/ui/Avatar';
import {palette,radius} from '../../constants/theme';
import {useData} from '../../context/DataContext';
import {useTask} from '../../hooks/useTask';
import {useAppNavigation} from '../../hooks/useAppNavigation';
import {formatShortDate,taskCompletionPercent} from '../../utils/taskMetrics';
import type {AppStackParamList} from '../../types/navigation';
export default function TaskDetailsScreen(){
 const {params}=useRoute<RouteProp<AppStackParamList,'TaskDetails'>>(),nav=useAppNavigation(),{data,moveTask,roleFor,removeTask,setSubtask,addSubtask,addComment}=useData();
 const{task,subtasks,assignees,comments}=useTask(params.taskId),[comment,setComment]=useState(''),[newSub,setNewSub]=useState('');
 const [correctionOpen,setCorrectionOpen]=useState(false);
 const [correctionReason,setCorrectionReason]=useState('');
 const [workflowBusy,setWorkflowBusy]=useState(false);
 if(!task)return <Screen title="Détails de la tâche" back><Text>Tâche introuvable.</Text></Screen>;
 const currentStatus=data?.statuses.find(s=>s.id===task.statusId),project=data?.projects.find(p=>p.id===task.projectId),availableStatuses=data?.statuses.filter(s=>s.projectId===task.projectId)??[];
 const role=roleFor(task.projectId);
 const canEditWorkflow=role==='owner'||role==='admin'||role==='editor';
 const responsible=role==='owner'||role==='admin';

 const performTransition=async(targetName:string,reason?:string)=>{
  if(workflowBusy)return;

  const normalizeStatus = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const target = availableStatuses.find(
  st => normalizeStatus(st.name) === normalizeStatus(targetName)
);

  if (!target) {
  Alert.alert(
    'Workflow',
    `État « ${targetName} » introuvable.\n\n` +
    `États disponibles : ${availableStatuses.map(s => s.name).join(', ')}`
  );
  return;
}

  setWorkflowBusy(true);

  try{
   await moveTask(task.id,target.id,null,reason);
   setCorrectionOpen(false);
   setCorrectionReason('');
  }catch(error){
   Alert.alert(
    'Transition refusée',
    error instanceof Error?error.message:String(error)
   );
  }finally{
   setWorkflowBusy(false);
  }
 };

 const onRemove=()=>Alert.alert('Supprimer la tâche ?',task.title,[{text:'Annuler'},{text:'Supprimer',style:'destructive',onPress:()=>removeTask(task.id).then(()=>nav.goBack()).catch(e=>Alert.alert('Erreur',String(e)))}]);
 return <Screen title="Détails de la tâche" back><View style={s.top}><Text style={s.id}>TASK • {task.id.slice(0,12)}</Text><Pressable onPress={()=>nav.navigate('EditTask',{taskId:task.id})}><Text style={s.link}>Modifier</Text></Pressable></View>
 <Text style={s.heading}>{task.title}</Text><Text style={s.desc}>{task.description||'Sans description.'}</Text>
 <Surface style={{backgroundColor:palette.subtle}}>
 <Text style={s.label}>État actuel</Text>

 <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,marginVertical:10}}>
  {availableStatuses.map(st=>(
   <StatusChip
    key={st.id}
    name={st.name}
    color={st.id===currentStatus?.id?st.color:palette.white}
   />
  ))}
 </View>

 {canEditWorkflow&&currentStatus?.name==='À faire'&&(
  <Button
   title="Commencer"
   onPress={()=>{void performTransition('En cours');}}
  />
 )}

 {canEditWorkflow&&currentStatus?.name==='En cours'&&(
  <Button
   title="Soumettre"
   onPress={()=>{void performTransition('À valider');}}
  />
 )}

 {responsible&&currentStatus?.name==='À valider'&&(
  <Button
   title="Approuver"
   onPress={()=>{void performTransition('Terminé');}}
  />
 )}

 {responsible&&currentStatus?.name==='À valider'&&(
  <Button
   title="Demander une correction"
   onPress={()=>setCorrectionOpen(true)}
  />
 )}

 {correctionOpen&&responsible&&currentStatus?.name==='À valider'&&(
  <View style={{gap:10,marginVertical:12}}>
   <Text style={s.label}>Justification obligatoire</Text>

   <TextInput
    multiline
    maxLength={2500}
    value={correctionReason}
    onChangeText={setCorrectionReason}
    placeholder="Expliquez les corrections demandées..."
    placeholderTextColor={palette.muted}
    style={[s.input,{minHeight:90,textAlignVertical:'top'}]}
   />

   <Button
    title="Confirmer la correction"
    onPress={()=>{
     const reason=correctionReason.trim();

     if(!reason){
      Alert.alert('Justification requise','Saisissez le motif.');
      return;
     }

     void performTransition('En cours',reason);
    }}
   />

   <Pressable onPress={()=>setCorrectionOpen(false)}>
    <Text style={s.link}>Annuler</Text>
   </Pressable>
  </View>
 )}

 {workflowBusy&&(
  <Text style={s.muted}>Enregistrement en cours...</Text>
 )}
 <Text style={s.label}>Assignés</Text><View style={{flexDirection:'row',gap:7,marginBottom:12}}>{assignees.map(a=><Avatar key={a.userId} name={data?.users.find(u=>u.id===a.userId)?.name??'?'} size={35}/>)}{assignees.length===0&&<Text style={s.muted}>Non assignée</Text>}</View>
 <Text style={s.label}>Échéance : <Text style={s.muted}>{formatShortDate(task.dueDate)}</Text></Text><View style={{height:12}}/><PriorityChip priority={task.priority}/>
 <Text style={[s.label,{marginTop:14}]}>Projet : <Text style={s.link}>{project?.title}</Text></Text></Surface>
 <View style={s.section}><Text style={s.sectionTitle}>Sous-tâches ({subtasks.filter(x=>x.done).length}/{subtasks.length})</Text><Text style={s.muted}>{taskCompletionPercent(subtasks)} % complété</Text></View>
 <View style={s.progressBg}><View style={[s.progressFill,{width:`${taskCompletionPercent(subtasks)}%`}]}/></View>
 {subtasks.map(st=><Pressable key={st.id} onPress={()=>setSubtask(st.id,!st.done).catch(e=>Alert.alert('Erreur',String(e)))} style={s.subtask}><Text style={{fontSize:21,color:st.done?palette.primary:palette.mutedDark}}>{st.done?'☑':'☐'}</Text><Text style={[s.subtaskText,st.done&&{textDecorationLine:'line-through',color:palette.muted}]}>{st.title}</Text></Pressable>)}
 <View style={s.inputRow}><TextInput placeholder="Ajouter une sous-tâche" placeholderTextColor={palette.muted} value={newSub} onChangeText={setNewSub} style={s.input}/><Pressable onPress={()=>{addSubtask(task.id,newSub).then(()=>setNewSub('')).catch(e=>Alert.alert('Erreur',String(e)));}}><Text style={s.link}>Ajouter</Text></Pressable></View>
 <Text style={s.sectionTitle}>Activité ({comments.length})</Text>
 {comments.map(c=><Surface key={c.id} style={{backgroundColor:palette.subtle}}><Text style={{fontWeight:'700',color:palette.ink}}>{data?.users.find(u=>u.id===c.authorId)?.name??'Membre'}</Text><Text style={{color:palette.mutedDark,lineHeight:22,marginTop:5}}>{c.body}</Text></Surface>)}
 <View style={s.inputRow}><TextInput placeholder="Écrire un commentaire..." placeholderTextColor={palette.muted} value={comment} onChangeText={setComment} style={s.input}/><Pressable onPress={()=>{addComment(task.id,comment).then(()=>setComment('')).catch(e=>Alert.alert('Erreur',String(e)));}}><Text style={s.link}>Envoyer</Text></Pressable></View>
 <Button title="Modifier la tâche" onPress={()=>nav.navigate('EditTask',{taskId:task.id})}/><Button title="Supprimer la tâche" variant="danger" onPress={onRemove}/>
 </Screen>;
}
const s=StyleSheet.create({top:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:4},id:{color:palette.muted,fontSize:12},link:{color:palette.primaryDark,fontWeight:'700'},heading:{fontSize:27,fontWeight:'800',color:palette.ink,marginTop:16},desc:{fontSize:16,color:palette.mutedDark,lineHeight:25,marginVertical:14},label:{color:palette.mutedDark,fontSize:15,marginTop:5,fontWeight:'600'},muted:{color:palette.muted,fontWeight:'400'},section:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:28},sectionTitle:{fontSize:19,fontWeight:'700',color:palette.ink,marginTop:16,marginBottom:12},progressBg:{height:7,backgroundColor:palette.border,borderRadius:99,marginTop:10,marginBottom:12},progressFill:{height:7,backgroundColor:palette.primary,borderRadius:99},subtask:{padding:11,backgroundColor:palette.subtle,borderRadius:radius.md,marginVertical:3,flexDirection:'row',gap:10,alignItems:'center'},subtaskText:{color:palette.ink,fontSize:14,flex:1},inputRow:{flexDirection:'row',alignItems:'center',gap:14,borderWidth:1,borderColor:palette.border,borderRadius:radius.pill,paddingHorizontal:14,minHeight:51,marginTop:12,marginBottom:16},input:{flex:1,color:palette.ink,minHeight:44}});
