import React from 'react';
import {Text,TextInput,View,StyleSheet,type KeyboardTypeOptions} from 'react-native';
import {radius,type ThemePalette} from '../../constants/theme';
import {useAppTheme} from '../../hooks/useAppTheme';
export function Field({label,value,onChangeText,placeholder,multiline=false,secureTextEntry=false,keyboardType='default'}:{label:string;value:string;onChangeText:(s:string)=>void;placeholder?:string;multiline?:boolean;secureTextEntry?:boolean;keyboardType?:KeyboardTypeOptions}){
 const {palette}=useAppTheme();
 const s=makeThemeStyles_s(palette);

 return <View style={s.wrap}><Text style={s.label}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={palette.muted} multiline={multiline} secureTextEntry={secureTextEntry} keyboardType={keyboardType} autoCapitalize={keyboardType==='email-address'?'none':'sentences'} style={[s.input,multiline&&{minHeight:105,textAlignVertical:'top'}]}/></View>;
}
const makeThemeStyles_s=(palette:ThemePalette)=>StyleSheet.create({wrap:{marginBottom:17},label:{fontSize:15,color:palette.ink,marginBottom:7,fontWeight:'500'},input:{minHeight:52,backgroundColor:palette.subtle,borderRadius:radius.md,padding:14,color:palette.ink,fontSize:16}});
