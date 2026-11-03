import React from 'react';
import {ScrollView,View,Text,Pressable,StyleSheet} from 'react-native';
import {RouteProp,useRoute} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import {Screen} from '../../components/ui/Screen';
import {TaskCard} from '../../components/tasks/TaskCard';
import {Avatar} from '../../components/ui/Avatar';
import {Button} from '../../components/ui/Button';
import {EmptyState} from '../../components/ui/EmptyState';
import {palette,radius} from '../../constants/theme';
import {useProject} from '../../hooks/useProject';
import {useData} from '../../context/DataContext';
import {useAppNavigation} from '../../hooks/useAppNavigation';
import type {AppStackParamList} from '../../types/navigation';
import {projectProgress} from '../../utils/taskMetrics';
export default function ProjectBoardScreen(){
 const {params}=useRoute<RouteProp<AppStackParamList,'ProjectBoard'>>(),nav=useAppNavigation();
 const {project,statuses,tasks,members}=useProject(params.projectId),{data}=useData();
 if(!project)return <Screen title="Projet" back><EmptyState text="Projet introuvable."/></Screen>;
 const done=statuses.filter(s=>/termin|fini|done/i.test(s.name)).map(s=>s.id);
 return <Screen title="Accueil" back><View style={s.headerRow}><Text style={s.kicker}>● SPRINT ACTIF • DEMO</Text><Pressable onPress={()=>nav.navigate('ProjectSettings',{projectId:project.id})}><Ionicons name="ellipsis-horizontal-circle" size={30} color={palette.mutedDark}/></Pressable></View>
 <Text style={s.heading}>{project.title}</Text><View style={s.members}><View style={{flexDirection:'row',alignItems:'center',gap:4}}>{members.slice(0,3).map(m=><Avatar key={m.userId} name={data?.users.find(u=>u.id===m.userId)?.name??'M'} size={34}/>)}</View>
 <Pressable onPress={()=>nav.navigate('MembersPermissions',{projectId:project.id})}><Text style={s.link}>{members.length} membres ▾</Text></Pressable><Text style={s.progress}>{projectProgress(tasks,done)}%</Text></View>
 <View style={s.controls}><Text style={s.boardTitle}>▣ Tableau Kanban</Text><Pressable onPress={()=>nav.navigate('Search')}><Ionicons name="search" size={25} color={palette.mutedDark}/></Pressable><Pressable onPress={()=>nav.navigate('StatusEditor',{projectId:project.id})}><Ionicons name="options-outline" size={26} color={palette.mutedDark}/></Pressable></View>
 <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:14,paddingBottom:14}}>
 {statuses.map(st=>{const cards=tasks.filter(t=>t.statusId===st.id);return <View key={st.id} style={s.column}><View style={s.colHeader}><View style={[s.dot,{backgroundColor:st.color}]}/><Text style={s.colTitle}>{st.name}</Text><Text style={s.count}>{cards.length}</Text></View>
 {cards.map(t=><TaskCard key={t.id} task={t} onPress={()=>nav.navigate('TaskDetails',{taskId:t.id})}/>)}
 <Pressable style={s.add} onPress={()=>nav.navigate('NewTask',{projectId:project.id,statusId:st.id})}><Text style={s.link}>＋ Nouvelle tâche</Text></Pressable></View>;})}
 </ScrollView><Button title="＋ Ajouter un état" variant="soft" onPress={()=>nav.navigate('StatusEditor',{projectId:project.id})}/>
 <View style={s.cadence}><Ionicons name="trending-up" size={29} color={palette.primary}/><View style={{flex:1}}><Text style={{fontWeight:'700',color:palette.ink}}>Cadence du Sprint</Text><Text style={{color:palette.mutedDark}}>{tasks.filter(t=>done.includes(t.statusId)).length} tâche(s) terminée(s) sur {tasks.length}</Text></View></View>
 </Screen>;
}
const s=StyleSheet.create({headerRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:10},kicker:{color:palette.mutedDark,letterSpacing:1},heading:{fontSize:29,fontWeight:'800',color:palette.ink,marginTop:12},members:{flexDirection:'row',alignItems:'center',gap:12,marginVertical:22},link:{color:palette.primaryDark,fontWeight:'700',fontSize:14},progress:{marginLeft:'auto',color:palette.ink,fontWeight:'800'},controls:{flexDirection:'row',alignItems:'center',gap:22,marginBottom:16},boardTitle:{backgroundColor:palette.lilac,borderRadius:radius.pill,padding:13,fontWeight:'700',color:palette.ink,flex:1,textAlign:'center'},column:{width:286,backgroundColor:palette.subtle,padding:13,borderRadius:radius.lg,minHeight:240},colHeader:{flexDirection:'row',alignItems:'center',gap:8,marginBottom:13},dot:{width:13,height:13,borderRadius:7},colTitle:{fontSize:16,color:palette.ink,fontWeight:'700'},count:{color:palette.mutedDark,backgroundColor:palette.white,borderRadius:20,paddingHorizontal:9,paddingVertical:4},add:{backgroundColor:'#EBE8E8',borderRadius:radius.md,alignItems:'center',padding:15,marginTop:9},cadence:{flexDirection:'row',gap:15,padding:19,alignItems:'center',backgroundColor:palette.white,borderRadius:radius.lg,marginTop:17}});
