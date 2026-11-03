import React from 'react';
import {Text} from 'react-native';
import {Screen} from '../../components/ui/Screen';
import {Surface} from '../../components/ui/Surface';
import {palette} from '../../constants/theme';
import {runtime} from '../../config/runtime';
import {useData} from '../../context/DataContext';
export default function PersonalInfoScreen(){const{data}=useData(),user=data?.users.find(u=>u.id===runtime.demoUserId);return <Screen title="Informations personnelles" back><Surface><Text style={{color:palette.ink,fontWeight:'700'}}>{user?.name}</Text><Text style={{color:palette.muted,marginTop:8}}>{user?.email}</Text></Surface><Text style={{color:palette.mutedDark,lineHeight:24,marginTop:15}}>Les données sont fictives. La modification du nom, du mot de passe et de l’adresse e-mail nécessitera un service de comptes sécurisé.</Text></Screen>;}
