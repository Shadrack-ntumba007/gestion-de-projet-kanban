import React,{useState} from 'react';
import {Alert,Text} from 'react-native';
import {RouteProp,useRoute} from '@react-navigation/native';
import {useSQLiteContext} from 'expo-sqlite';
import {Screen} from '../../components/ui/Screen';
import {Field} from '../../components/ui/Field';
import {Button} from '../../components/ui/Button';
import {Segmented} from '../../components/ui/Segmented';
import {useAuth} from '../../context/AuthContext';
import {useData} from '../../context/DataContext';
import {useAppNavigation} from '../../hooks/useAppNavigation';
import type {AppStackParamList} from '../../types/navigation';
import {inviteLocal} from '../../db/repositories/localInvitationRepository';
import {palette} from '../../constants/theme';
export default function InviteMemberScreen(){
 const db=useSQLiteContext(),nav=useAppNavigation(),{params}=useRoute<RouteProp<AppStackParamList,'InviteMember'>>();
 const{user}=useAuth(),{reload}=useData();
 const[email,setEmail]=useState(''),[role,setRole]=useState<'admin'|'editor'|'viewer'>('editor'),[busy,setBusy]=useState(false);
 const submit=async()=>{if(!user)return;setBusy(true);try{
  const result=await inviteLocal(db,params.projectId,email,role,user.id);await reload();
  Alert.alert('Enregistré sur cet appareil',result==='member'?'Ce membre possède désormais un accès local à ce projet.':'Invitation en attente. Aucun email envoyé : le compte doit être créé sur ce même téléphone.',[{text:'OK',onPress:()=>nav.goBack()}]);
 }catch(e){Alert.alert('Impossible',e instanceof Error?e.message:'Erreur');}finally{setBusy(false);}};
 return <Screen title="Inviter un équipier" back><Field label="Adresse e-mail" value={email} onChangeText={setEmail} placeholder="adresse@email.com" keyboardType="email-address"/>
 <Text style={{color:palette.ink}}>Rôle proposé</Text><Segmented value={role} onChange={setRole} options={[{label:'Admin',value:'admin'},{label:'Éditeur',value:'editor'},{label:'Lecteur',value:'viewer'}]}/>
 <Text style={{color:palette.mutedDark,marginVertical:15}}>Simulation locale : l'invitation sera enregistrée dans SQLite. Aucun e-mail n'est envoyé.</Text>
 <Button title="Enregistrer l’invitation locale" loading={busy} disabled={busy} onPress={submit}/></Screen>;
}
