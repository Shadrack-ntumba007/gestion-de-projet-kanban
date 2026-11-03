import React from 'react';
import {RouteProp,useRoute} from '@react-navigation/native';
import type {AppStackParamList} from '../../types/navigation';
import {ProjectForm} from './ProjectForm';
export default function EditProjectScreen(){const {params}=useRoute<RouteProp<AppStackParamList,'EditProject'>>();return <ProjectForm projectId={params.projectId}/>;}
