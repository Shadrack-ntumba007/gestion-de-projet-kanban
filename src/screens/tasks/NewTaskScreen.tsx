import React from 'react';
import {RouteProp,useRoute} from '@react-navigation/native';
import type {AppStackParamList} from '../../types/navigation';
import {TaskForm} from './TaskForm';
export default function NewTaskScreen(){const route=useRoute<RouteProp<AppStackParamList,'NewTask'>>();return <TaskForm initialProjectId={route.params?.projectId} initialStatusId={route.params?.statusId}/>;}
