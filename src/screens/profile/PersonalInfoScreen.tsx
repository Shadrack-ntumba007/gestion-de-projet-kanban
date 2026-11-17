import {useAuth} from '../../context/AuthContext';
import React from 'react';
import {Text} from 'react-native';
import {Screen} from '../../components/ui/Screen';
import {Surface} from '../../components/ui/Surface';
import {useAppTheme} from '../../hooks/useAppTheme';
import {runtime} from '../../config/runtime';
import {useData} from '../../context/DataContext';
export default function PersonalInfoScreen(){
 const {palette}=useAppTheme();
const{user,mode}=useAuth();return <Screen title="Informations personnelles" back><Surface><Text style={{color:palette.ink,fontWeight:'700'}}>{user?.name}</Text><Text style={{color:palette.muted,marginTop:8}}>{user?.email}</Text></Surface><Text style={{color:palette.mutedDark,lineHeight:24,marginTop:15}}>{mode==='remote'?'Compte enregistré sur le serveur partagé. La récupération du mot de passe et la vérification de l’e-mail restent à implémenter.':'Compte local sur cet appareil. La récupération du mot de passe reste à implémenter.'}</Text></Screen>;}
