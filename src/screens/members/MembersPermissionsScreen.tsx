import React from 'react';
import {RouteProp,useRoute,useFocusEffect} from '@react-navigation/native';
import {useSQLiteContext} from 'expo-sqlite';
import {getLocalInvitations,type LocalInvitation} from '../../db/repositories/localInvitationRepository';
import {sentInvitations,type PendingSentInvitation} from '../../services/collaborationService';
import {Text,View,Pressable,Alert,TextInput,StyleSheet} from 'react-native';
import {Screen} from '../../components/ui/Screen';
import {Surface} from '../../components/ui/Surface';
import {Avatar} from '../../components/ui/Avatar';
import {Button} from '../../components/ui/Button';
import {Segmented} from '../../components/ui/Segmented';
import {palette} from '../../constants/theme';
import {useAuth} from '../../context/AuthContext';
import {useData} from '../../context/DataContext';
import {useProject} from '../../hooks/useProject';
import {useAppNavigation} from '../../hooks/useAppNavigation';
import {canManageMembers} from '../../utils/permissions';
import type {AppStackParamList} from '../../types/navigation';
import type {ProjectRole} from '../../types/models';
export default function MembersPermissionsScreen(){
 const db=useSQLiteContext();
 const {params}=useRoute<RouteProp<AppStackParamList,'MembersPermissions'>>();
 const nav=useAppNavigation(),{mode}=useAuth(),{data,setMemberRole,roleFor,reload}=useData();
 const {project,members}=useProject(params.projectId);
 const [pending,setPending]=React.useState<Array<{id:string;email:string;role:string}>>([]);
 useFocusEffect(React.useCallback(()=>{
  let active=true;
  const load=async()=>{
   try{
    const rows=mode==='remote'&&project?.workspaceId?(await sentInvitations(project.workspaceId)).invitations:await getLocalInvitations(db,params.projectId);
    if(active)setPending(rows.map((x:PendingSentInvitation|LocalInvitation)=>({id:x.id,email:x.email,role:x.role})));
   }catch(e){if(active&&mode==='remote')Alert.alert('Invitations',e instanceof Error?e.message:'Erreur réseau.');}
  };
  load();if(mode==='remote')reload().catch(()=>{});
  return()=>{active=false};
 },[db,mode,params.projectId,project?.workspaceId,reload]));
 const [query,setQuery]=React.useState(''),[filter,setFilter]=React.useState<'all'|'admin'|'editor'|'viewer'>('all');
 const filtered=members.filter(m=>{
  const u=data?.users.find(u=>u.id===m.userId);
  return (filter==='all'||m.role===filter) && `${u?.name??''} ${u?.email??''}`.toLowerCase().includes(query.toLowerCase());
 });
 const myRole=roleFor(params.projectId);
 const roles:ProjectRole[]=['admin','editor','viewer'];
 const change=(uid:string,current:ProjectRole)=>{
  const i=roles.indexOf(current),next=roles[(i+1)%roles.length];
  Alert.alert('Modifier le rôle ?',`Attribuer le rôle ${next} ?`,[{text:'Annuler'},{text:'Confirmer',onPress:()=>setMemberRole(params.projectId,uid,next).catch(e=>Alert.alert('Erreur',String(e)))}]);
 };
 return <Screen title="Membres et permissions" back>
  <Surface><Text style={s.title}>{project?.icon} {project?.title}</Text><Text style={s.muted}>{members.length} membres · {mode==='remote'?'Espace de travail partagé':'Démonstration locale'}</Text></Surface>
  <Surface><Text style={s.title}>Inviter un équipier</Text><Text style={s.muted}>{mode==='remote'?'Le rôle donne accès à tous les projets du même espace.':'Invitation enregistrée sur ce téléphone uniquement.'}</Text><Button title={mode==='remote'?'Créer une invitation':'Enregistrer une invitation locale'} disabled={!canManageMembers(myRole)} onPress={()=>nav.navigate('InviteMember',{projectId:params.projectId})}/></Surface>
  <TextInput style={s.search} value={query} onChangeText={setQuery} placeholder="Rechercher par nom ou e-mail..." placeholderTextColor={palette.muted}/>
  <Segmented value={filter} onChange={setFilter} options={[{label:'Tous',value:'all'},{label:'Admins',value:'admin'},{label:'Éditeurs',value:'editor'},{label:'Lecteurs',value:'viewer'}]}/>
  <Text style={s.label}>MEMBRES DE L’ÉQUIPE</Text>
  {filtered.map(m=>{const u=data?.users.find(x=>x.id===m.userId);return <Surface key={m.userId} style={s.member}>
   <Avatar name={u?.name??'?'} size={48}/><View style={{flex:1}}><Text style={s.memberName}>{u?.name}</Text><Text numberOfLines={1} style={s.muted}>{u?.email}</Text></View>
   {m.role==='owner'?<Text style={s.role}>Propriétaire</Text>:<Pressable disabled={!canManageMembers(myRole)} onPress={()=>change(m.userId,m.role)}><Text style={s.role}>{m.role==='admin'?'Admin':m.role==='editor'?'Éditeur':'Lecteur'} ▾</Text></Pressable>}
  </Surface>;})}
  {canManageMembers(myRole)?<><Text style={s.label}>INVITATIONS EN ATTENTE ({pending.length})</Text>
   {pending.map(i=><Surface key={i.id}><Text style={s.memberName}>{i.email}</Text><Text style={s.muted}>{i.role} · {mode==='remote'?'En attente de validation avec le code privé':'Compte attendu sur ce téléphone'}</Text></Surface>)}
  </>:null}
  <Text style={s.muted}>{mode==='remote'?'Aucun e-mail automatique n’est envoyé. L’invité trouve son invitation sur son téléphone et utilise le code privé.':'Les données locales ne se synchronisent pas entre téléphones.'}</Text>
 </Screen>;
}
const s=StyleSheet.create({title:{fontSize:18,fontWeight:'700',color:palette.ink},muted:{color:palette.mutedDark,marginTop:5,fontSize:12},search:{marginTop:24,marginBottom:12,minHeight:51,backgroundColor:palette.subtle,borderRadius:17,padding:14,fontSize:14,color:palette.ink},label:{fontWeight:'700',color:palette.mutedDark,marginTop:26,marginBottom:8,letterSpacing:1},member:{flexDirection:'row',alignItems:'center',gap:10},memberName:{color:palette.ink,fontWeight:'700',fontSize:15},role:{color:palette.primaryDark,backgroundColor:palette.subtle,borderRadius:14,padding:8,fontSize:12}});
