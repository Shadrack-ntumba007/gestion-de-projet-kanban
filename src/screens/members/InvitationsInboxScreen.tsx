import React,{useCallback,useState} from 'react';
import {Alert,Text,View,TextInput,StyleSheet} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {Screen} from '../../components/ui/Screen';
import {Surface} from '../../components/ui/Surface';
import {Button} from '../../components/ui/Button';
import {type ThemePalette} from '../../constants/theme';
import {useAppTheme} from '../../hooks/useAppTheme';
import {useAuth} from '../../context/AuthContext';
import {useData} from '../../context/DataContext';
import {receiveInvitations,respondInvitation,type RemoteInvitation} from '../../services/collaborationService';
export default function InvitationsInboxScreen(){
 const {palette}=useAppTheme();
 const s=makeThemeStyles_s(palette);

 const {mode}=useAuth(),{reload}=useData();
 const [items,setItems]=useState<RemoteInvitation[]>([]),[codes,setCodes]=useState<Record<string,string>>({}),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const refresh=useCallback(async()=>{try{setItems((await receiveInvitations()).invitations);setError('');}catch(e){setError(e instanceof Error?e.message:'Erreur réseau.');}},[]);
 useFocusEffect(useCallback(()=>{if(mode==='remote')refresh();},[mode,refresh]));
 const decide=async(i:RemoteInvitation,accept:boolean)=>{
  setBusy(true);
  try{await respondInvitation(i.id,accept,codes[i.id]??'');await Promise.all([refresh(),reload()]);
    Alert.alert(accept?'Invitation acceptée':'Invitation refusée',accept?'Tu peux maintenant voir les projets partagés dans l’accueil.':'Invitation supprimée de la liste.');
  }catch(e){Alert.alert('Action impossible',e instanceof Error?e.message:'Erreur.');}
  finally{setBusy(false);}
 };
 return <Screen title="Invitations reçues" back>
  {mode!=='remote'?<Text style={s.info}>Connectez-vous à un compte partagé pour recevoir des invitations depuis un autre téléphone.</Text>:<>
   <Text style={s.info}>Invitations liées à votre adresse e-mail. Demandez le code privé à la personne qui vous a invité.</Text>
   {error?<Text style={s.error}>{error}</Text>:null}
   {items.length===0?<Text style={s.info}>Aucune invitation en attente.</Text>:null}
   {items.map(i=><Surface key={i.id}>
    <Text style={s.heading}>{i.workspaceName}</Text>
    <Text style={s.info}>Invité par {i.invitedBy} · {i.role}</Text>
    <TextInput style={s.input} value={codes[i.id]??''} autoCapitalize="none" autoCorrect={false} placeholder="Code d’invitation privé" onChangeText={v=>setCodes(p=>({...p,[i.id]:v}))}/>
    <View style={{gap:8}}><Button title="Accepter" disabled={busy} onPress={()=>decide(i,true)}/><Button title="Refuser" variant="soft" disabled={busy} onPress={()=>decide(i,false)}/></View>
   </Surface>)}
   <Button title="Actualiser" variant="soft" disabled={busy} onPress={()=>refresh()}/>
  </>}
 </Screen>;
}
const makeThemeStyles_s=(palette:ThemePalette)=>StyleSheet.create({heading:{fontSize:18,fontWeight:'700',color:palette.ink},info:{color:palette.mutedDark,marginVertical:12,lineHeight:22},error:{color:palette.danger,marginVertical:8},input:{backgroundColor:palette.subtle,borderRadius:12,padding:15,color:palette.ink,marginVertical:12}});
