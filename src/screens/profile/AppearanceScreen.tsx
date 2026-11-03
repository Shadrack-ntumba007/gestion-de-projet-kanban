import React from 'react';
import {Text} from 'react-native';
import {Screen} from '../../components/ui/Screen';
import {Segmented} from '../../components/ui/Segmented';
import {usePreferences} from '../../context/PreferencesContext';
import {palette} from '../../constants/theme';
export default function AppearanceScreen(){const{theme,setTheme}=usePreferences();return <Screen title="Thème d’affichage" back><Segmented value={theme} onChange={setTheme} options={[{label:'Clair',value:'light'},{label:'Sombre',value:'dark'},{label:'Auto',value:'auto'}]}/><Text style={{color:palette.mutedDark,lineHeight:23,marginTop:20}}>La préférence est enregistrée localement. L’adaptation de tous les composants au mode sombre doit être finalisée lors de l’intégration graphique.</Text></Screen>;}
