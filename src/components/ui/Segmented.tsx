import React from 'react';
import {Pressable,Text,View,StyleSheet} from 'react-native';
import {palette,radius} from '../../constants/theme';
export function Segmented<T extends string>({options,value,onChange}:{options:ReadonlyArray<{label:string;value:T}>;value:T;onChange:(v:T)=>void}){
 return <View style={s.row}>{options.map(o=><Pressable key={o.value} style={[s.item,value===o.value&&s.selected]} onPress={()=>onChange(o.value)} accessibilityRole="button"><Text style={[s.text,value===o.value&&s.selectedText]}>{o.label}</Text></Pressable>)}</View>;
}
const s=StyleSheet.create({row:{flexDirection:'row',backgroundColor:palette.subtle,borderRadius:radius.pill,padding:5,marginVertical:8},item:{flex:1,paddingVertical:9,alignItems:'center',borderRadius:radius.pill},selected:{backgroundColor:palette.primary},text:{color:palette.mutedDark,fontSize:13,fontWeight:'600'},selectedText:{color:palette.white}});
