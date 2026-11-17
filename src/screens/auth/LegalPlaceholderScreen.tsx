import React from 'react';
import {Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAppTheme} from '../../hooks/useAppTheme';
export default function LegalPlaceholderScreen({type}:{type:'terms'|'privacy'}){
 const {palette}=useAppTheme();

 return <SafeAreaView style={{flex:1,backgroundColor:palette.page,padding:25}}><Text style={{fontSize:24,fontWeight:'700',color:palette.ink}}>{type==='terms'?'Conditions générales':'Politique de confidentialité'}</Text><Text style={{color:palette.muted,marginTop:20,lineHeight:24}}>Contenu juridique à rédiger et faire valider avant toute ouverture de comptes réels. Aucun engagement juridique n’est simulé ici.</Text></SafeAreaView>;
}
