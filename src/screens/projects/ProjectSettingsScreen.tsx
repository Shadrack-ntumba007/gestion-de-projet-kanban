import React from 'react';
import {RouteProp,useRoute} from '@react-navigation/native';
import {Screen} from '../../components/ui/Screen';
import {Button} from '../../components/ui/Button';
import {useProject} from '../../hooks/useProject';
import {useAppNavigation} from '../../hooks/useAppNavigation';
import type {AppStackParamList} from '../../types/navigation';
export default function ProjectSettingsScreen(){const {params}=useRoute<RouteProp<AppStackParamList,'ProjectSettings'>>(),nav=useAppNavigation(),{project}=useProject(params.projectId);return <Screen title="Paramètres du projet" back><Button title={`Modifier ${project?.title??'le projet'}`} onPress={()=>nav.navigate('EditProject',{projectId:params.projectId})}/><Button title="Gérer les états Kanban" variant="soft" onPress={()=>nav.navigate('StatusEditor',{projectId:params.projectId})}/><Button title="Membres et permissions" variant="soft" onPress={()=>nav.navigate('MembersPermissions',{projectId:params.projectId})}/></Screen>;}
