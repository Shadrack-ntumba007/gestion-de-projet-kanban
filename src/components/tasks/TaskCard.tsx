import React from 'react';
import {Pressable,Text,View,StyleSheet} from 'react-native';
import {palette,radius} from '../../constants/theme';
import type {Task} from '../../types/models';
import {PriorityChip} from '../ui/Chips';
import {formatShortDate} from '../../utils/taskMetrics';
export function TaskCard({task,onPress}:{task:Task;onPress:()=>void}){
 return <Pressable onPress={onPress} accessibilityRole="button" style={s.card}><PriorityChip priority={task.priority}/><Text style={s.title}>{task.title}</Text><Text style={s.desc} numberOfLines={2}>{task.description||'Aucune description'}</Text><Text style={s.date}>▢ {formatShortDate(task.dueDate)}</Text></Pressable>;
}
const s=StyleSheet.create({card:{backgroundColor:palette.white,padding:14,borderRadius:radius.lg,marginVertical:7,borderWidth:1,borderColor:palette.border},title:{fontSize:17,color:palette.ink,fontWeight:'700',marginTop:11},desc:{color:palette.mutedDark,lineHeight:21,marginTop:7},date:{textAlign:'right',color:palette.muted,marginTop:14,fontSize:13}});
