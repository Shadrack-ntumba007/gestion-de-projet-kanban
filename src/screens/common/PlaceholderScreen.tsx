import React from 'react';
import {Text,View} from 'react-native';
import {Screen} from '../../components/ui/Screen';
import {Surface} from '../../components/ui/Surface';
import {useAppTheme} from '../../hooks/useAppTheme';
export function PlaceholderScreen({title,description}:{title:string;description:string}){
 const {palette}=useAppTheme();
return <Screen title={title} back><Surface><Text style={{fontSize:17,fontWeight:'700',color:palette.ink}}>Écran préparé</Text><Text style={{color:palette.mutedDark,lineHeight:23,marginTop:12}}>{description}</Text><View style={{height:9}}/></Surface></Screen>;}
