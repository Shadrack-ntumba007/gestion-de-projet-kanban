import {useColorScheme} from 'react-native';
import {usePreferences} from '../context/PreferencesContext';
import {palette,darkPalette} from '../constants/theme';

export function useAppTheme(){
 const {theme}=usePreferences();
 const systemTheme=useColorScheme();

 const isDark=theme==='dark' ||
 (theme==='auto' && systemTheme==='dark');

 return {
  isDark,
  palette:isDark ? darkPalette : palette,
 };
}