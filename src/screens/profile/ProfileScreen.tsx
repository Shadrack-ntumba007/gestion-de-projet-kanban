import React from 'react';
import {Text,View,Pressable,StyleSheet,Alert} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {Screen} from '../../components/ui/Screen';
import {Surface} from '../../components/ui/Surface';
import {Avatar} from '../../components/ui/Avatar';
import {Button} from '../../components/ui/Button';
import {palette} from '../../constants/theme';
import {useAuth} from '../../context/AuthContext';
import {useData} from '../../context/DataContext';
import {useAppNavigation} from '../../hooks/useAppNavigation';
import {runtime} from '../../config/runtime';
export default function ProfileScreen(){
 const nav=useAppNavigation(),{logout,user}=useAuth(),{data}=useData();
 const completed=data?.tasks.filter(t=>data.statuses.some(st=>st.id===t.statusId&&/termin|done/i.test(st.name))).length??0;
 const item=(label:string,meta:string,go:()=>void)=><Pressable style={s.item} onPress={go}><View style={{flex:1}}><Text style={s.itemText}>{label}</Text><Text style={s.muted}>{meta}</Text></View><Ionicons name="chevron-forward" size={22} color={palette.muted}/></Pressable>;
 return <Screen title="Accueil"><Text style={s.kicker}>ESPACE PERSONNEL</Text><Text style={s.heading}>Profil & Préférences</Text><Surface><View style={s.profile}><Avatar name={user?.name??'AM'} size={76} color={palette.primary}/><View style={{flex:1}}><Text style={s.name}>{user?.name}</Text><Text style={s.muted}>{user?.email}</Text><Text style={s.muted}>Compte local · Démonstration</Text></View></View><View style={s.stats}><View><Text style={s.stat}>{completed}</Text><Text style={s.muted}>Terminées</Text></View><View><Text style={s.stat}>{data?.projects.length??0}</Text><Text style={s.muted}>Projets</Text></View><View><Text style={s.stat}>—</Text><Text style={s.muted}>Succès</Text></View></View></Surface>
 <Text style={s.kicker}>ESPACE DE TRAVAIL & COMPTE</Text><Surface>{item('Informations personnelles','Nom, e-mail, mot de passe',()=>nav.navigate('PersonalInfo'))}{item('Espace de travail',data?.workspace.name??'',()=>nav.navigate('Workspace'))}</Surface>
 <Text style={s.kicker}>PRÉFÉRENCES</Text><Surface>{item('Thème d’affichage','Clair / sombre / automatique',()=>nav.navigate('Appearance'))}</Surface>
 <Text style={s.kicker}>PRODUCTIVITÉ & KANBAN</Text><Surface>{item('Vue de démarrage','Tableau Kanban',()=>nav.navigate('StartupView'))}</Surface>
 <Button title="↪ Se déconnecter" variant="danger" onPress={()=>Alert.alert('Quitter la démo ?', 'La base locale reste disponible pour la prochaine visite.',[{text:'Annuler'},{text:'Se déconnecter',onPress:()=>logout().catch(()=>{})}])}/><Text style={[s.muted,{textAlign:'center',marginTop:18}]}>Taskify • version locale de développement</Text>
 </Screen>;
}
const s=StyleSheet.create({kicker:{fontSize:14,color:palette.mutedDark,letterSpacing:1,marginTop:17,marginBottom:9},heading:{fontSize:26,fontWeight:'800',color:palette.ink,marginBottom:13},profile:{flexDirection:'row',alignItems:'center',gap:12},name:{fontSize:17,fontWeight:'700',color:palette.ink},muted:{color:palette.muted,fontSize:13,marginTop:4},stats:{flexDirection:'row',justifyContent:'space-around',backgroundColor:palette.subtle,borderRadius:18,padding:18,marginTop:23},stat:{textAlign:'center',fontWeight:'800',fontSize:23,color:palette.primary},item:{flexDirection:'row',alignItems:'center',paddingVertical:16,borderBottomWidth:0.5,borderColor:palette.border},itemText:{fontSize:16,fontWeight:'600',color:palette.ink}});
