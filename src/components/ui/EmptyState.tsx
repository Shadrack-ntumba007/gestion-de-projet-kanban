import React from 'react';
import {Text,View,StyleSheet} from 'react-native';
import {palette} from '../../constants/theme';
export function EmptyState({text}:{text:string}){return <View style={s.view}><Text style={s.text}>{text}</Text></View>;}
const s=StyleSheet.create({view:{padding:26,alignItems:'center'},text:{textAlign:'center',color:palette.muted,lineHeight:22}});
