import React from 'react';
import {RouteProp,useRoute,useFocusEffect} from '@react-navigation/native';
import {useSQLiteContext} from 'expo-sqlite';
import {getLocalInvitations,type LocalInvitation} from '../../db/repositories/localInvitationRepository';
import {Text,View,Pressable,Alert,TextInput,StyleSheet} from 'react-native';
import {Screen} from '../../components/ui/Screen';
import {Surface} from '../../components/ui/Surface';
import {Avatar} from '../../components/ui/Avatar';
import {Button} from '../../components/ui/Button';
import {Segmented} from '../../components/ui/Segmented';
import {palette} from '../../constants/theme';
import {useData} from '../../context/DataContext';
import {useProject} from '../../hooks/useProject';
import {useAppNavigation} from '../../hooks/useAppNavigation';
import {canManageMembers} from '../../utils/permissions';
import type {AppStackParamList} from '../../types/navigation';
import type {ProjectRole} from '../../types/models';
export default function MembersPermissionsScreen(){
 const db=useSQLiteContext();
 const {params}=useRoute<RouteProp<AppStackParamList,'MembersPermissions'>>(),nav=useAppNavigation(),{data,setMemberRole,roleFor}=useData();
 const [pending,setPending]=React.useState<LocalInvitation[]>([]);
 useFocusEffect(React.useCallback(()=>{let active=true;getLocalInvitations(db,params.projectId).then(rows=>{if(active)setPending(rows)}).catch(()=>{});return()=>{active=false};},[db,params.projectId]));
 const {project,members}=useProject(params.projectId),[query,setQuery]=React.useState(''),[filter,setFilter]=React.useState<'all'|'admin'|'editor'|'viewer'>('all');
 const filtered=members.filter(m=>(filter==='all'||m.role===filter)&&data?.users.find(u=>u.id===m.userId)?.name.toLowerCase().includes(query.toLowerCase()));
 const myRole=roleFor(params.projectId);
 const roles:ProjectRole[]=['admin','editor','viewer'];
 const change=(uid:string,now:ProjectRole)=>{const i=roles.indexOf(now),next=roles[(i+1)%roles.length];Alert.alert('Modifier le rôle ?',`Attribuer le rôle ${next} ?`,[{text:'Annuler'},{text:'Confirmer',onPress:()=>setMemberRole(params.projectId,uid,next).catch(e=>Alert.alert('Erreur',String(e)))}]);};
 return <Screen title="Membres et permissions" back><Surface><Text style={s.title}>{project?.icon} {project?.title}</Text><Text style={s.muted}>{members.length} membres collaborateurs · Espace de travail</Text></Surface>
 <Surface><Text style={s.title}>Inviter un équipier</Text><Text style={s.muted}>Invitations locales : enregistrement sur ce téléphone, sans envoi d’e-mail.</Text><Button title="Envoyer une invitation" onPress={()=>nav.navigate('InviteMember',{projectId:params.projectId})}/></Surface>
 <TextInput style={s.search} value={query} onChangeText={setQuery} placeholder="Rechercher par nom ou e-mail..." placeholderTextColor={palette.muted}/><Segmented value={filter} onChange={setFilter} options={[{label:'Tous',value:'all'},{label:'Admins',value:'admin'},{label:'Éditeurs',value:'editor'},{label:'Lecteurs',value:'viewer'}]}/>
 <Text style={s.label}>MEMBRES DE L’ÉQUIPE</Text>{filtered.map(m=>{const u=data?.users.find(x=>x.id===m.userId);return <Surface key={m.userId} style={s.member}><Avatar name={u?.name??'?'} size={48}/><View style={{flex:1}}><Text style={s.memberName}>{u?.name}</Text><Text numberOfLines={1} style={s.muted}>{u?.email}</Text></View>
 {m.role==='owner'?<Text style={s.role}>Propriétaire</Text>:<Pressable disabled={!canManageMembers(myRole)} onPress={()=>change(m.userId,m.role)}><Text style={s.role}>{m.role==='admin'?'Admin':m.role==='editor'?'Éditeur':'Lecteur'} ▾</Text></Pressable>}</Surface>;})}
 <Text style={s.label}>INVITATIONS LOCALES EN ATTENTE ({pending.length})</Text>
 {pending.map(i=><Surface key={i.id}><Text style={s.memberName}>{i.email}</Text><Text style={s.muted}>{i.role} · En attente de création de compte sur ce téléphone</Text></Surface>)}
 <Text style={s.muted}>La synchronisation entre téléphones et les invitations par e-mail ne sont pas disponibles en mode SQLite local.</Text></Screen>;
}
const s=StyleSheet.create({title:{fontSize:18,fontWeight:'700',color:palette.ink},muted:{color:palette.mutedDark,marginTop:5,fontSize:12},search:{marginTop:24,marginBottom:12,minHeight:51,backgroundColor:palette.subtle,borderRadius:17,padding:14,fontSize:14,color:palette.ink},label:{fontWeight:'700',color:palette.mutedDark,marginTop:26,marginBottom:8,letterSpacing:1},member:{flexDirection:'row',alignItems:'center',gap:10},memberName:{color:palette.ink,fontWeight:'700',fontSize:15},role:{color:palette.primaryDark,backgroundColor:palette.subtle,borderRadius:14,padding:8,fontSize:12}});
