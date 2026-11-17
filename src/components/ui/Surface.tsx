import React,{type ReactNode} from 'react';
import {View,StyleSheet,type ViewStyle} from 'react-native';
import {radius,elevation,type ThemePalette} from '../../constants/theme';
import {useAppTheme} from '../../hooks/useAppTheme';
export function Surface({children,style}:{children:ReactNode;style?:ViewStyle}){
 const {palette}=useAppTheme();
 const s=makeThemeStyles_s(palette);
return <View style={[s.base,style]}>{children}</View>;}
const makeThemeStyles_s=(palette:ThemePalette)=>StyleSheet.create({base:{backgroundColor:palette.surface,borderRadius:radius.lg,padding:16,marginVertical:7,...elevation}});
