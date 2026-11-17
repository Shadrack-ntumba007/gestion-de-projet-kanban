import React,{type ReactNode} from 'react';
import {KeyboardAvoidingView,Platform,ScrollView,Text,View,Pressable,StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {spacing,type ThemePalette} from '../../constants/theme';
import {useAppTheme} from '../../hooks/useAppTheme';
import {useAppNavigation} from '../../hooks/useAppNavigation';
export function Screen({title,children,back=false,scroll=true}:{title?:string;children:ReactNode;back?:boolean;scroll?:boolean}){
 const {palette}=useAppTheme();
 const styles=makeThemeStyles_styles(palette);

 const nav=useAppNavigation();
 const header=title?<View style={styles.head}>{back&&<Pressable onPress={()=>nav.goBack()} accessibilityLabel="Retour"><Ionicons name="chevron-back" size={27} color={palette.ink}/></Pressable>}<Text style={styles.title}>{title}</Text></View>:null;
 return <SafeAreaView style={styles.safe} edges={['top','left','right']}><KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
 {header}{scroll?<ScrollView style={{flex:1}} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">{children}</ScrollView>:<View style={[styles.body,{flex:1}]}>{children}</View>}
 </KeyboardAvoidingView></SafeAreaView>;
}
const makeThemeStyles_styles=(palette:ThemePalette)=>StyleSheet.create({safe:{flex:1,backgroundColor:palette.page},head:{flexDirection:'row',alignItems:'center',paddingHorizontal:spacing.lg,paddingTop:14,paddingBottom:17,gap:15},title:{fontSize:25,fontWeight:'700',color:palette.ink,flexShrink:1},body:{paddingHorizontal:spacing.lg,paddingBottom:64}});
