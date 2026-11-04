import React from 'react';
import {Text,StyleSheet} from 'react-native';
import {Screen} from '../../components/ui/Screen';
import {Surface} from '../../components/ui/Surface';
import {palette} from '../../constants/theme';
import {useData} from '../../context/DataContext';
import {useAuth} from '../../context/AuthContext';
export default function WorkspaceScreen(){const {data}=useData();const {mode}=useAuth();return <Screen title="Espace de travail" back><Text style={s.heading}>{data?.workspace.name}</Text><Text style={s.muted}>{mode==='remote'?'Données communes accessibles aux membres invités dans cet espace.':'Données de démonstration locales à cet appareil.'}</Text><Text style={s.heading}>Collaborateurs de démonstration</Text>{data?.users.map(u=><Surface key={u.id}><Text style={{fontWeight:'700',color:palette.ink}}>{u.name}</Text><Text style={s.muted}>{u.email}</Text></Surface>)}</Screen>;}
const s=StyleSheet.create({heading:{color:palette.ink,fontSize:19,fontWeight:'700',marginTop:20,marginBottom:8},muted:{color:palette.mutedDark,lineHeight:22}});
