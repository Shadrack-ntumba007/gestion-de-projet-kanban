import React from 'react';
import {Pressable,Text,View,StyleSheet} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {palette} from '../../constants/theme';
import type {Project} from '../../types/models';
import {Surface} from '../ui/Surface';
export function ProjectCard({project,tasksCount,membersCount,onPress}:{project:Project;tasksCount:number;membersCount:number;onPress:()=>void}){
 return <Pressable onPress={onPress} accessibilityRole="button"><Surface style={s.row}><View style={s.icon}><Text style={{fontSize:23}}>{project.icon}</Text></View><View style={{flex:1}}><Text numberOfLines={1} style={s.title}>{project.title}</Text><Text style={s.muted}>{tasksCount} tâches · {membersCount} membres</Text></View><Ionicons name="chevron-forward" size={22} color={palette.muted}/></Surface></Pressable>;
}
const s=StyleSheet.create({row:{flexDirection:'row',alignItems:'center',gap:14},icon:{width:52,height:52,borderRadius:17,alignItems:'center',justifyContent:'center',backgroundColor:palette.lilac},title:{fontSize:16,fontWeight:'700',color:palette.ink},muted:{color:palette.muted,marginTop:4}});
