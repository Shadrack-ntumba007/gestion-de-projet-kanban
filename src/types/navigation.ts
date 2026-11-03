import type { NavigatorScreenParams } from '@react-navigation/native';
export type AuthStackParamList = {
  Login:undefined; SignUp:undefined; ForgotPassword:undefined; Terms:undefined; Privacy:undefined;
};
export type MainTabsParamList = {
  Home:undefined; MyTasks:undefined; Notifications:undefined; Profile:undefined;
};
export type AppStackParamList = {
  MainTabs:NavigatorScreenParams<MainTabsParamList> | undefined;
  ProjectBoard:{projectId:string}; NewProject:undefined; EditProject:{projectId:string};
  ProjectSettings:{projectId:string}; StatusEditor:{projectId:string};
  TaskDetails:{taskId:string}; NewTask:{projectId?:string; statusId?:string}|undefined;
  EditTask:{taskId:string}; MembersPermissions:{projectId:string}; InviteMember:{projectId:string};
  Workspace:undefined; PersonalInfo:undefined; Appearance:undefined; StartupView:undefined;
  Search:undefined; Filters:undefined; NotificationSettings:undefined;
};
