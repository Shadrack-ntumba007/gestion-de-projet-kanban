import React,{type ReactNode} from 'react';
import {ScrollView,Text,View,Pressable,StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {palette,spacing} from '../../constants/theme';
import {useAppNavigation} from '../../hooks/useAppNavigation';
export function Screen({title,children,back=false,scroll=true}:{title?:string;children:ReactNode;back?:boolean;scroll?:boolean}){
 const nav=useAppNavigation();
 const header=title?<View style={styles.head}>{back&&<Pressable onPress={()=>nav.goBack()} accessibilityLabel="Retour"><Ionicons name="chevron-back" size={27} color={palette.ink}/></Pressable>}<Text style={styles.title}>{title}</Text></View>:null;
 return <SafeAreaView style={styles.safe} edges={['top','left','right']}>
 {header}{scroll?<ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">{children}</ScrollView>:<View style={[styles.body,{flex:1}]}>{children}</View>}
 </SafeAreaView>;
}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:palette.page},head:{flexDirection:'row',alignItems:'center',paddingHorizontal:spacing.lg,paddingTop:14,paddingBottom:17,gap:15},title:{fontSize:25,fontWeight:'700',color:palette.ink,flexShrink:1},body:{paddingHorizontal:spacing.lg,paddingBottom:64}});
