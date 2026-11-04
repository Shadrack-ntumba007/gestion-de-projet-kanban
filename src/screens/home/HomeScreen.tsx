import {useAuth} from '../../context/AuthContext';
import React,{useState} from 'react';
import {Text,View,TextInput,Pressable,StyleSheet,ScrollView} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {Screen} from '../../components/ui/Screen';
import {Avatar} from '../../components/ui/Avatar';
import {ProjectCard} from '../../components/projects/ProjectCard';
import {Button} from '../../components/ui/Button';
import {palette,radius} from '../../constants/theme';
import {useData} from '../../context/DataContext';
import {useAppNavigation} from '../../hooks/useAppNavigation';
import {runtime} from '../../config/runtime';
import {formatShortDate} from '../../utils/taskMetrics';
export default function HomeScreen(){
 const {data,syncError,reload}=useData(),{user,mode}=useAuth(),nav=useAppNavigation(),[query,setQuery]=useState('');
 const displayUser=user??data?.users.find(u=>u.id===runtime.demoUserId);
 const projects=(data?.projects??[]).filter(p=>p.title.toLowerCase().includes(query.trim().toLowerCase()));
 const recent=(data?.projects??[]).slice(0,3);
 return <Screen title="Accueil"><View style={s.greet}><View><Text style={s.mutedLarge}>Bonjour,</Text><Text style={s.name}>{displayUser?.name??'Collaborateur'}</Text></View><Avatar name={displayUser?.name??'AM'} size={60}/></View>
 {mode==='remote'&&syncError?<Pressable onPress={()=>reload().catch(()=>{})}><Text style={{color:palette.danger,marginBottom:10}}>Connexion au serveur interrompue · Réessayer</Text></Pressable>:null}
 <View style={s.search}><Ionicons name="search" size={22} color={palette.muted}/><TextInput placeholder="Rechercher un projet..." placeholderTextColor={palette.muted} value={query} onChangeText={setQuery} style={{flex:1,fontSize:15,color:palette.ink}}/><Pressable accessibilityLabel="Filtres" onPress={()=>nav.navigate('Filters')}><Ionicons name="options-outline" color={palette.primary} size={24}/></Pressable></View>
 <Text style={s.section}>Récemment ouverts <Text style={{color:palette.primary}}>•</Text></Text>
 <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:12,paddingBottom:8}}>
 {recent.map((p,i)=><Pressable key={p.id} onPress={()=>nav.navigate('ProjectBoard',{projectId:p.id})} style={[s.feature,{backgroundColor:i%2===0?palette.lilac:palette.mint}]}>
 <Text style={{color:palette.mutedDark,marginBottom:24}}>{p.priority==='medium'?'Moyenne':p.priority==='high'?'Élevée':'Faible'}　·　En cours</Text><Text style={s.featureTitle}>{p.title}</Text><Text style={s.featureMeta}>▢ {formatShortDate(p.dueDate)}</Text><Text style={s.featureMeta}>{data?.tasks.filter(t=>t.projectId===p.id).length??0} tâches</Text>
 </Pressable>)}
 </ScrollView><View style={s.sectionRow}><Text style={s.section}>Mes projets <Text style={s.counter}>{projects.length}</Text></Text><Pressable onPress={()=>nav.navigate('Search')}><Ionicons name="filter-outline" size={22} color={palette.mutedDark}/></Pressable></View>
 {projects.map(p=><ProjectCard key={p.id} project={p} tasksCount={data?.tasks.filter(t=>t.projectId===p.id).length??0} membersCount={data?.members.filter(m=>m.projectId===p.id).length??0} onPress={()=>nav.navigate('ProjectBoard',{projectId:p.id})}/>)}
 {projects.length===0&&<Text style={{color:palette.muted}}>Aucun projet correspondant.</Text>}
 {mode==='remote'&&<Text style={{color:palette.mutedDark,marginTop:14}}>Espace partagé · actualisation toutes les 20 secondes</Text>}
 <Button title="＋ Nouveau projet" onPress={()=>nav.navigate('NewProject')}/>
 </Screen>;
}
const s=StyleSheet.create({greet:{marginTop:12,marginBottom:25,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},mutedLarge:{fontSize:22,color:palette.muted},name:{fontSize:28,fontWeight:'800',color:palette.ink},search:{height:60,backgroundColor:palette.subtle,borderRadius:radius.md,flexDirection:'row',alignItems:'center',paddingHorizontal:15,gap:12},section:{fontSize:20,fontWeight:'700',color:palette.ink,marginTop:32,marginBottom:16},sectionRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},feature:{width:265,minHeight:170,borderRadius:radius.lg,padding:18,justifyContent:'space-between'},featureTitle:{fontSize:20,fontWeight:'700',color:palette.ink},featureMeta:{color:palette.mutedDark,marginTop:6},counter:{color:palette.muted},});
