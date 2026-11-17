import React,{useState} from 'react';
import {Alert,Text,Share,View} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import {RouteProp,useRoute} from '@react-navigation/native';
import {useSQLiteContext} from 'expo-sqlite';
import {Screen} from '../../components/ui/Screen';
import {Field} from '../../components/ui/Field';
import {Button} from '../../components/ui/Button';
import {Segmented} from '../../components/ui/Segmented';
import {useAuth} from '../../context/AuthContext';
import {useData} from '../../context/DataContext';
import {useAppNavigation} from '../../hooks/useAppNavigation';
import {useAppTheme} from '../../hooks/useAppTheme';
import type {AppStackParamList} from '../../types/navigation';
import {inviteLocal} from '../../db/repositories/localInvitationRepository';
import {inviteRemote} from '../../services/collaborationService';

export default function InviteMemberScreen(){
 const {palette}=useAppTheme();
 const db=useSQLiteContext(),nav=useAppNavigation(),{params}=useRoute<RouteProp<AppStackParamList,'InviteMember'>>();
 const {user,mode}=useAuth(),{reload}=useData();
 const [email,setEmail]=useState('');
 const [role,setRole]=useState<'admin'|'editor'|'viewer'>('editor');
 const [busy,setBusy]=useState(false);
 const [code,setCode]=useState('');

 const submit=async()=>{
  if(!user||busy||!email.trim())return;
  setBusy(true);
  try{
   if(mode==='remote'){
    const result=await inviteRemote(params.projectId,email.trim(),role);
    setCode(result.code);
   }else{
    const result=await inviteLocal(db,params.projectId,email,role,user.id);
    await reload();
    Alert.alert('Invitation locale',result==='member'?'Membre ajouté.':'Invitation enregistrée sur cet appareil.',[{text:'OK',onPress:()=>nav.goBack()}]);
   }
  }catch(e){
   Alert.alert('Impossible',e instanceof Error?e.message:'Erreur.');
  }finally{
   setBusy(false);
  }
 };

 const copyCode=async()=>{
  try{
   const copied=await Clipboard.setStringAsync(code);
   if(!copied)throw new Error();
   Alert.alert('Code copié','Vous pouvez maintenant transmettre le code.');
  }catch{
   Alert.alert('Erreur','Impossible de copier le code.');
  }
 };

 const shareCode=async()=>{
  try{
   await Share.share({message:`Invitation Taskify

Votre code privé :

${code}

Inscrivez-vous avec votre adresse e-mail, puis accédez à Notifications > Invitations reçues.

https://taskifyapp.tech`});
  }catch{
   Alert.alert('Erreur','Impossible de partager.');
  }
 };

 return <Screen title="Inviter un équipier" back>
 {code ? <>
  <Text style={{fontSize:26,fontWeight:'800',color:palette.ink,textAlign:'center'}}>Invitation créée !</Text>
  <Text style={{color:palette.muted,marginVertical:20,textAlign:'center'}}>{email}</Text>
  <View style={{backgroundColor:palette.surface,borderColor:palette.border,borderWidth:1,borderRadius:20,padding:24,marginBottom:20}}>
   <Text style={{color:palette.muted,textAlign:'center'}}>Code privé</Text>
   <Text selectable style={{fontSize:26,fontWeight:'800',color:palette.primaryDark,textAlign:'center',marginTop:15}}>{code}</Text>
  </View>
  <View style={{gap:12}}>
   <Button title="Copier le code" onPress={copyCode}/>
   <Button title="Partager l’invitation" variant="soft" onPress={shareCode}/>
   <Button title="Terminer" variant="soft" onPress={()=>nav.goBack()}/>
  </View>
 </>:<>
  <Field label="Adresse e-mail" value={email} onChangeText={setEmail} placeholder="adresse@email.com" keyboardType="email-address"/>
  <Text style={{color:palette.ink}}>Rôle proposé</Text>
  <Segmented value={role} onChange={setRole} options={[{label:'Admin',value:'admin'},{label:'Éditeur',value:'editor'},{label:'Lecteur',value:'viewer'}]}/>
  <Text style={{color:palette.mutedDark,marginVertical:16}}>{mode==='remote'?'Un code privé sera généré pour inviter cet utilisateur. Aucun e-mail automatique.':'Simulation locale.'}</Text>
  <Button title="Créer l’invitation" disabled={busy||!email.trim()} loading={busy} onPress={submit}/>
 </>}
 </Screen>;
}