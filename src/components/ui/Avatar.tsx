import React from 'react';
import {View,Text,StyleSheet} from 'react-native';
import {palette} from '../../constants/theme';
export function Avatar({name,size=40,color=palette.lilac}:{name:string;size?:number;color?:string}){
 const initials=name.trim().split(/\s+/).slice(0,2).map(x=>x.charAt(0).toUpperCase()).join('');
 return <View style={[s.circle,{width:size,height:size,borderRadius:size/2,backgroundColor:color}]}><Text style={[s.text,{fontSize:size*0.38}]}>{initials}</Text></View>;
}
const s=StyleSheet.create({circle:{alignItems:'center',justifyContent:'center'},text:{color:palette.primaryDark,fontWeight:'700'}});
