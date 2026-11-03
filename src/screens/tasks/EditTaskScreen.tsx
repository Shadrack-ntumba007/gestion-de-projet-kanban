import React from 'react';
import {RouteProp,useRoute} from '@react-navigation/native';
import type {AppStackParamList} from '../../types/navigation';
import {TaskForm} from './TaskForm';
export default function EditTaskScreen(){const{params}=useRoute<RouteProp<AppStackParamList,'EditTask'>>();return <TaskForm taskId={params.taskId}/>;}
