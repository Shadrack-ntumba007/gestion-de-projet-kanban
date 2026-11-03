import React,{useState} from 'react';
import {Alert,Text} from 'react-native';
import {Screen} from '../../components/ui/Screen';
import {Field} from '../../components/ui/Field';
import {Button} from '../../components/ui/Button';
import {validEmail} from '../../utils/validation';
import {palette} from '../../constants/theme';
export default function ForgotPasswordScreen(){const[email,setEmail]=useState('');return <Screen title="Mot de passe oublié"><Text style={{color:palette.mutedDark,marginBottom:24}}>Un service backend sera nécessaire pour envoyer un e-mail de réinitialisation.</Text><Field label="Adresse e-mail" value={email} onChangeText={setEmail} keyboardType="email-address"/><Button title="Demander la réinitialisation" onPress={()=>Alert.alert(validEmail(email)?'Service non configuré':'Adresse incorrecte',validEmail(email)?'Aucun e-mail n’a été envoyé.':'Saisissez une adresse valide.')}/></Screen>;}
