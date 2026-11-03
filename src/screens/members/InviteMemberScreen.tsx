import React,{useState} from 'react';
import {Alert,Text,Share} from 'react-native';
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
import {inviteRemote} from '../../services/collaborationService';
import {palette} from '../../constants/theme';
export default function InviteMemberScreen(){
 const db=useSQLiteContext(),nav=useAppNavigation(),{params}=useRoute<RouteProp<AppStackParamList,'InviteMember'>>();
 const {user,mode}=useAuth(),{reload}=useData();
 const[email,setEmail]=useState(''),[role,setRole]=useState<'admin'|'editor'|'viewer'>('editor'),[busy,setBusy]=useState(false);
 const submit=async()=>{
  if(!user||busy)return;
  setBusy(true);
  try{
   if(mode==='remote'){
    const result=await inviteRemote(params.projectId,email,role);
    try{await Share.share({message:`Invitation Taskify pour ${email.trim()} — code privé : ${result.code}. Inscrivez-vous avec cet e-mail, puis allez dans Notifications > Invitations reçues pour accepter.`});}catch{/* Le code reste affiché ci-dessous. */}
    Alert.alert('Invitation enregistrée',`Code privé : ${result.code}\n\nConservez et transmettez ce code au destinataire. Aucun e-mail automatique n’a été envoyé.`,[{text:'OK',onPress:()=>nav.goBack()}]);
   }else{
    const result=await inviteLocal(db,params.projectId,email,role,user.id);await reload();
    Alert.alert('Invitation locale',result==='member'?'Membre ajouté sur cet appareil.':'Invitation enregistrée uniquement sur ce téléphone.',[{text:'OK',onPress:()=>nav.goBack()}]);
   }
  }catch(e){Alert.alert('Impossible',e instanceof Error?e.message:'Erreur.');}
  finally{setBusy(false);}
 };
 return <Screen title="Inviter un équipier" back>
  <Field label="Adresse e-mail" value={email} onChangeText={setEmail} placeholder="adresse@email.com" keyboardType="email-address"/>
  <Text style={{color:palette.ink}}>Rôle proposé</Text>
  <Segmented value={role} onChange={setRole} options={[{label:'Admin',value:'admin'},{label:'Éditeur',value:'editor'},{label:'Lecteur',value:'viewer'}]}/>
  <Text style={{color:palette.mutedDark,marginVertical:16}}>{mode==='remote'?'Accès à l’espace de travail : tous ses projets. Un code confidentiel sera partagé manuellement. Aucun e-mail automatique.':'Simulation locale : aucun envoi entre téléphones.'}</Text>
  <Button title={mode==='remote'?"Créer et partager l’invitation":"Enregistrer l’invitation locale"} disabled={busy} loading={busy} onPress={submit}/>
 </Screen>;
}
