import React from 'react';
import {ActivityIndicator,Pressable,Text,StyleSheet,type ViewStyle} from 'react-native';
import {palette,radius} from '../../constants/theme';
export function Button({title,onPress,variant='primary',disabled=false,loading=false,style}:{title:string;onPress:()=>void;variant?:'primary'|'soft'|'danger'|'outline';disabled?:boolean;loading?:boolean;style?:ViewStyle}){
 const bg=variant==='primary'?palette.primary:variant==='danger'?palette.rose:variant==='soft'?palette.subtle:palette.surface;
 const fg=variant==='primary'?palette.white:variant==='danger'?palette.danger:palette.primaryDark;
 return <Pressable accessibilityRole="button" disabled={disabled||loading} onPress={onPress} style={[styles.button,{backgroundColor:bg,opacity:disabled?0.55:1},style]}>
 {loading?<ActivityIndicator color={fg}/>:<Text style={[styles.title,{color:fg}]}>{title}</Text>}</Pressable>;
}
const styles=StyleSheet.create({button:{minHeight:52,borderRadius:radius.pill,justifyContent:'center',alignItems:'center',paddingHorizontal:18,marginVertical:5},title:{fontSize:16,fontWeight:'700',textAlign:'center'}});
