import React,{type ReactNode} from 'react';
import {View,StyleSheet,type ViewStyle} from 'react-native';
import {palette,radius,elevation} from '../../constants/theme';
export function Surface({children,style}:{children:ReactNode;style?:ViewStyle}){return <View style={[s.base,style]}>{children}</View>;}
const s=StyleSheet.create({base:{backgroundColor:palette.surface,borderRadius:radius.lg,padding:16,marginVertical:7,...elevation}});
