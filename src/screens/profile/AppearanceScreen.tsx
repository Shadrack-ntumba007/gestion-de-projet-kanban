import React from 'react';
import {Text} from 'react-native';
import {Screen} from '../../components/ui/Screen';
import {Segmented} from '../../components/ui/Segmented';
import {usePreferences} from '../../context/PreferencesContext';
import {useAppTheme} from '../../hooks/useAppTheme';
export default function AppearanceScreen(){
 const {palette}=useAppTheme();
const{theme,setTheme}=usePreferences();return <Screen title="Thème d’affichage" back><Segmented value={theme} onChange={setTheme} options={[{label:'Clair',value:'light'},{label:'Sombre',value:'dark'},{label:'Auto',value:'auto'}]}/><Text style={{color:palette.mutedDark,lineHeight:23,marginTop:20}}>Choisissez votre thème préféré. Le mode automatique suit les paramètres de votre téléphone.</Text></Screen>;}
