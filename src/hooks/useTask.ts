import {useData} from '../context/DataContext';
export function useTask(taskId:string){
 const {data}=useData();return {
 task:data?.tasks.find(t=>t.id===taskId),
 subtasks:data?.subtasks.filter(s=>s.taskId===taskId)??[],
 assignees:data?.assignees.filter(a=>a.taskId===taskId)??[],
 comments:data?.comments.filter(c=>c.taskId===taskId)??[],
 };
}
