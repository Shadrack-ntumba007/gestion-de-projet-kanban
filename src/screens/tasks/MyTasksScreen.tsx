import React,{useState} from 'react';
import {Text,TextInput,View,StyleSheet} from 'react-native';
import {Screen} from '../../components/ui/Screen';
import {Segmented} from '../../components/ui/Segmented';
import {TaskCard} from '../../components/tasks/TaskCard';
import {Button} from '../../components/ui/Button';
import {palette} from '../../constants/theme';
import {runtime} from '../../config/runtime';
import {useAppNavigation} from '../../hooks/useAppNavigation';
import {useData} from '../../context/DataContext';
export default function MyTasksScreen(){
 const nav=useAppNavigation(),{data}=useData(),[scope,setScope]=useState<'mine'|'all'>('mine'),[query,setQuery]=useState('');
 const mine=(data?.tasks??[]).filter(t=>(scope==='all'||data?.assignees.some(a=>a.taskId===t.id&&a.userId===runtime.demoUserId))&&t.title.toLowerCase().includes(query.toLowerCase()));
 return <Screen title="Mes tâches"><Segmented value={scope} onChange={setScope} options={[{label:'Assignées à moi',value:'mine'},{label:'Toutes',value:'all'}]}/><TextInput placeholder="Rechercher une tâche..." placeholderTextColor={palette.muted} value={query} onChangeText={setQuery} style={s.search}/>
 <Text style={s.heading}>{mine.length} tâche(s)</Text>{mine.map(t=><TaskCard key={t.id} task={t} onPress={()=>nav.navigate('TaskDetails',{taskId:t.id})}/>)}
 {mine.length===0&&<Text style={s.empty}>Aucune tâche dans cette sélection.</Text>}<Button title="＋ Nouvelle tâche" onPress={()=>nav.navigate('NewTask')}/></Screen>;
}
const s=StyleSheet.create({search:{height:52,borderRadius:18,backgroundColor:palette.subtle,padding:14,marginTop:14,fontSize:16,color:palette.ink},heading:{fontSize:20,fontWeight:'700',color:palette.ink,marginTop:24,marginBottom:8},empty:{padding:26,color:palette.muted,textAlign:'center'}});
