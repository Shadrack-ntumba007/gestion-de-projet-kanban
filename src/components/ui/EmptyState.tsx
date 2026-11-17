import React from 'react';
import {Text,View,StyleSheet} from 'react-native';
import {type ThemePalette} from '../../constants/theme';
import {useAppTheme} from '../../hooks/useAppTheme';
export function EmptyState({text}:{text:string}){
 const {palette}=useAppTheme();
 const s=makeThemeStyles_s(palette);
return <View style={s.view}><Text style={s.text}>{text}</Text></View>;}
const makeThemeStyles_s=(palette:ThemePalette)=>StyleSheet.create({view:{padding:26,alignItems:'center'},text:{textAlign:'center',color:palette.muted,lineHeight:22}});
