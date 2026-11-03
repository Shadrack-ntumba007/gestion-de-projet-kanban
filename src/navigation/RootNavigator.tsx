import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Ionicons} from '@expo/vector-icons';
import type {AppStackParamList,AuthStackParamList,MainTabsParamList} from '../types/navigation';
import {palette} from '../constants/theme';
import {useAuth} from '../context/AuthContext';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import LegalPlaceholderScreen from '../screens/auth/LegalPlaceholderScreen';
import HomeScreen from '../screens/home/HomeScreen';
import MyTasksScreen from '../screens/tasks/MyTasksScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ProjectBoardScreen from '../screens/projects/ProjectBoardScreen';
import NewProjectScreen from '../screens/projects/NewProjectScreen';
import EditProjectScreen from '../screens/projects/EditProjectScreen';
import ProjectSettingsScreen from '../screens/projects/ProjectSettingsScreen';
import StatusEditorScreen from '../screens/projects/StatusEditorScreen';
import TaskDetailsScreen from '../screens/tasks/TaskDetailsScreen';
import NewTaskScreen from '../screens/tasks/NewTaskScreen';
import EditTaskScreen from '../screens/tasks/EditTaskScreen';
import MembersPermissionsScreen from '../screens/members/MembersPermissionsScreen';
import InviteMemberScreen from '../screens/members/InviteMemberScreen';
import InvitationsInboxScreen from '../screens/members/InvitationsInboxScreen';
import WorkspaceScreen from '../screens/profile/WorkspaceScreen';
import PersonalInfoScreen from '../screens/profile/PersonalInfoScreen';
import AppearanceScreen from '../screens/profile/AppearanceScreen';
import StartupViewScreen from '../screens/profile/StartupViewScreen';
import SearchScreen from '../screens/search/SearchScreen';
import FiltersScreen from '../screens/search/FiltersScreen';
import NotificationSettingsScreen from '../screens/notifications/NotificationSettingsScreen';
const AuthStack=createNativeStackNavigator<AuthStackParamList>();
const AppStack=createNativeStackNavigator<AppStackParamList>();
const Tabs=createBottomTabNavigator<MainTabsParamList>();
const screenOptions={headerShown:false} as const;
function AuthNavigator(){return <AuthStack.Navigator screenOptions={screenOptions}>
 <AuthStack.Screen name="Login" component={LoginScreen}/>
 <AuthStack.Screen name="SignUp" component={SignUpScreen}/>
 <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen}/>
 <AuthStack.Screen name="Terms">{()=> <LegalPlaceholderScreen type="terms"/>}</AuthStack.Screen>
 <AuthStack.Screen name="Privacy">{()=> <LegalPlaceholderScreen type="privacy"/>}</AuthStack.Screen>
 </AuthStack.Navigator>;}
const tabIcons:Record<keyof MainTabsParamList,React.ComponentProps<typeof Ionicons>['name']>={Home:'home-outline',MyTasks:'checkbox-outline',Notifications:'notifications-outline',Profile:'person-outline'};
function MainTabs(){return <Tabs.Navigator screenOptions={({route})=>({headerShown:false,tabBarActiveTintColor:palette.primary,tabBarInactiveTintColor:palette.mutedDark,tabBarStyle:{height:64,paddingBottom:7,backgroundColor:palette.page,borderTopColor:palette.border},tabBarLabelStyle:{fontSize:12},tabBarIcon:({color,size})=><Ionicons name={tabIcons[route.name]} color={color} size={size}/>})}>
 <Tabs.Screen name="Home" component={HomeScreen} options={{title:'Accueil'}}/>
 <Tabs.Screen name="MyTasks" component={MyTasksScreen} options={{title:'Mes tâches'}}/>
 <Tabs.Screen name="Notifications" component={NotificationsScreen} options={{title:'Notifications'}}/>
 <Tabs.Screen name="Profile" component={ProfileScreen} options={{title:'Profil'}}/>
 </Tabs.Navigator>;}
function AppNavigator(){return <AppStack.Navigator screenOptions={screenOptions}>
 <AppStack.Screen name="MainTabs" component={MainTabs}/>
 <AppStack.Screen name="ProjectBoard" component={ProjectBoardScreen}/>
 <AppStack.Screen name="NewProject" component={NewProjectScreen}/>
 <AppStack.Screen name="EditProject" component={EditProjectScreen}/>
 <AppStack.Screen name="ProjectSettings" component={ProjectSettingsScreen}/>
 <AppStack.Screen name="StatusEditor" component={StatusEditorScreen}/>
 <AppStack.Screen name="TaskDetails" component={TaskDetailsScreen}/>
 <AppStack.Screen name="NewTask" component={NewTaskScreen}/>
 <AppStack.Screen name="EditTask" component={EditTaskScreen}/>
 <AppStack.Screen name="MembersPermissions" component={MembersPermissionsScreen}/>
 <AppStack.Screen name="InviteMember" component={InviteMemberScreen}/>
 <AppStack.Screen name="InvitationsInbox" component={InvitationsInboxScreen}/>
 <AppStack.Screen name="Workspace" component={WorkspaceScreen}/>
 <AppStack.Screen name="PersonalInfo" component={PersonalInfoScreen}/>
 <AppStack.Screen name="Appearance" component={AppearanceScreen}/>
 <AppStack.Screen name="StartupView" component={StartupViewScreen}/>
 <AppStack.Screen name="Search" component={SearchScreen}/>
 <AppStack.Screen name="Filters" component={FiltersScreen}/>
 <AppStack.Screen name="NotificationSettings" component={NotificationSettingsScreen}/>
 </AppStack.Navigator>;}
export default function RootNavigator(){const{isAuthenticated,loading}=useAuth();if(loading)return <SplashScreen/>;return <NavigationContainer>{isAuthenticated?<AppNavigator/>:<AuthNavigator/>}</NavigationContainer>;}
