import React,{useState} from 'react';
import {Alert,Text} from 'react-native';
import {Screen} from '../../components/ui/Screen';
import {Field} from '../../components/ui/Field';
import {Button} from '../../components/ui/Button';
import {Segmented} from '../../components/ui/Segmented';
import {validEmail} from '../../utils/validation';
import {palette} from '../../constants/theme';
export default function InviteMemberScreen(){const[email,setEmail]=useState(''),[role,setRole]=useState<'admin'|'editor'|'viewer'>('editor');return <Screen title="Inviter un équipier" back><Field label="Adresse e-mail" value={email} onChangeText={setEmail} placeholder="adresse@email.com" keyboardType="email-address"/><Text style={{color:palette.ink}}>Rôle proposé</Text><Segmented value={role} onChange={setRole} options={[{label:'Admin',value:'admin'},{label:'Éditeur',value:'editor'},{label:'Lecteur',value:'viewer'}]}/><Button title="Envoyer l’invitation" onPress={()=>Alert.alert(validEmail(email)?'Service non configuré':'Adresse incorrecte',validEmail(email)?'Aucune invitation n’a été envoyée. Il faut raccorder un serveur d’invitations.':'Saisissez une adresse valide.')}/></Screen>;}
