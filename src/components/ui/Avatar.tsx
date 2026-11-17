import React from 'react';
import {View,Text,StyleSheet} from 'react-native';
import {useAppTheme} from '../../hooks/useAppTheme';
export function Avatar({name,size=40,color}:{name:string;size?:number;color?:string}){
 const {palette}=useAppTheme();
 const initials=name.trim().split(/\s+/).slice(0,2).map(x=>x.charAt(0).toUpperCase()).join('');
 return <View style={[s.circle,{width:size,height:size,borderRadius:size/2,backgroundColor:color??palette.lilac}]}><Text style={[s.text,{fontSize:size*0.38,color:palette.primaryDark}]}>{initials}</Text></View>;
}
const s=StyleSheet.create({circle:{alignItems:'center',justifyContent:'center'},text:{fontWeight:'700'}});
