import React from 'react';
import {View,Text,ActivityIndicator,StyleSheet} from 'react-native';
import {type ThemePalette} from '../constants/theme';
import {useAppTheme} from '../hooks/useAppTheme';
export default function SplashScreen(){
 const {palette}=useAppTheme();
 const s=makeThemeStyles_s(palette);
return <View style={s.wrap}><View style={s.logo}><Text style={{fontSize:45,color:palette.white}}>✓</Text></View><Text style={s.title}>Taskify</Text><ActivityIndicator color={palette.primary} style={{marginTop:30}}/></View>;}
const makeThemeStyles_s=(palette:ThemePalette)=>StyleSheet.create({wrap:{flex:1,backgroundColor:palette.page,justifyContent:'center',alignItems:'center'},logo:{width:95,height:95,backgroundColor:palette.primary,borderRadius:27,alignItems:'center',justifyContent:'center'},title:{fontSize:32,color:palette.ink,fontWeight:'800',marginTop:22}});
