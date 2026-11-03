import React from 'react';
import {StatusBar} from 'expo-status-bar';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {SQLiteProvider} from 'expo-sqlite';
import {AuthProvider} from './src/context/AuthContext';
import {PreferencesProvider} from './src/context/PreferencesContext';
import {DataProvider} from './src/context/DataContext';
import {DATABASE_NAME,migrateDbIfNeeded} from './src/db/database';
import RootNavigator from './src/navigation/RootNavigator';
export default function App(){return <SafeAreaProvider><SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDbIfNeeded}>
 <AuthProvider><PreferencesProvider><DataProvider><StatusBar style="dark"/><RootNavigator/></DataProvider></PreferencesProvider></AuthProvider>
 </SQLiteProvider></SafeAreaProvider>;}
