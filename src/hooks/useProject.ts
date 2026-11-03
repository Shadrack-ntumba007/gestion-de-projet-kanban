import {useMemo} from 'react';
import {useData} from '../context/DataContext';
export function useProject(projectId:string){
 const {data}=useData();return useMemo(()=>({
 project:data?.projects.find(p=>p.id===projectId),
 statuses:data?.statuses.filter(s=>s.projectId===projectId)??[],
 tasks:data?.tasks.filter(t=>t.projectId===projectId)??[],
 members:data?.members.filter(m=>m.projectId===projectId)??[],
 }),[data,projectId]);
}
