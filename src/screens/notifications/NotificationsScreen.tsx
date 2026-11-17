import {useAuth} from '../../context/AuthContext';
import React from 'react';
import {Pressable,Text,View,StyleSheet,Alert} from 'react-native';
import {Screen} from '../../components/ui/Screen';
import {Surface} from '../../components/ui/Surface';
import {Button} from '../../components/ui/Button';
import {type ThemePalette} from '../../constants/theme';
import {useAppTheme} from '../../hooks/useAppTheme';
import {runtime} from '../../config/runtime';
import {useData} from '../../context/DataContext';
import {useAppNavigation} from '../../hooks/useAppNavigation';
export default function NotificationsScreen(){
 const {palette}=useAppTheme();
 const s=makeThemeStyles_s(palette);
const {user,mode}=useAuth(),{data,readNotification}=useData(),nav=useAppNavigation(),items=data?.notifications.filter(n=>n.userId===(user?.id??runtime.demoUserId))??[];return <Screen title="Notifications"><Text style={s.label}>{items.filter(x=>!x.read).length} non lue(s) · {mode==='remote'?'Espace partagé':'Démo locale'}</Text>
 {items.map(n=><Pressable key={n.id} onPress={()=>readNotification(n.id).catch(e=>Alert.alert('Erreur',String(e)))}><Surface style={{backgroundColor:n.read?palette.surface:palette.lilac}}><View style={{flexDirection:'row',gap:10}}><Text style={{color:palette.primary}}>{n.read?'○':'●'}</Text><View style={{flex:1}}><Text style={s.title}>{n.title}</Text><Text style={s.body}>{n.body}</Text></View></View></Surface></Pressable>)}
 {mode==='remote'?<Button title="Invitations reçues" onPress={()=>nav.navigate('InvitationsInbox')}/>:null}
 <Button title="Préférences de notifications" variant="soft" onPress={()=>nav.navigate('NotificationSettings')}/></Screen>;}
const makeThemeStyles_s=(palette:ThemePalette)=>StyleSheet.create({label:{color:palette.muted,marginBottom:12},title:{fontWeight:'700',fontSize:17,color:palette.ink},body:{color:palette.mutedDark,lineHeight:23,marginTop:6}});
