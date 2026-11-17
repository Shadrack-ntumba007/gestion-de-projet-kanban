import React from 'react';
import {Text,View,StyleSheet} from 'react-native';
import {priorityMeta,radius} from '../../constants/theme';
import type {Priority} from '../../types/models';
export function PriorityChip({priority}:{priority:Priority}){const item=priorityMeta[priority];return <View style={[s.chip,{backgroundColor:item.color}]}><Text style={[s.text,{color:item.text}]}>Priorité {item.label}</Text></View>;}
export function StatusChip({name,color}:{name:string;color:string}){return <View style={[s.chip,{backgroundColor:color}]}><Text style={[s.text,{color:'#171717'}]}>● {name}</Text></View>;}
const s=StyleSheet.create({chip:{alignSelf:'flex-start',borderRadius:radius.pill,paddingHorizontal:11,paddingVertical:5},text:{fontSize:12,fontWeight:'600'}});
