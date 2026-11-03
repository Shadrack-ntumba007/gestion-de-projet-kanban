import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {AppStackParamList,AuthStackParamList} from '../types/navigation';
export const useAppNavigation=()=>useNavigation<NativeStackNavigationProp<AppStackParamList>>();
export const useAuthNavigation=()=>useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
