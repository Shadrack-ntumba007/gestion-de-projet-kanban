import {useAuth} from '../../context/AuthContext';
import React from 'react';
import {Text} from 'react-native';
import {Screen} from '../../components/ui/Screen';
import {Surface} from '../../components/ui/Surface';
import {palette} from '../../constants/theme';
import {runtime} from '../../config/runtime';
import {useData} from '../../context/DataContext';
export default function PersonalInfoScreen(){const{user}=useAuth();return <Screen title="Informations personnelles" back><Surface><Text style={{color:palette.ink,fontWeight:'700'}}>{user?.name}</Text><Text style={{color:palette.muted,marginTop:8}}>{user?.email}</Text></Surface><Text style={{color:palette.mutedDark,lineHeight:24,marginTop:15}}>Compte local à cet appareil uniquement. La modification des informations personnelles et la récupération du mot de passe ne sont pas disponibles dans cette démo.</Text></Screen>;}
