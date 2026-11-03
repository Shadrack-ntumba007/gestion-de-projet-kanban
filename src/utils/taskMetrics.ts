import type { Task, Subtask } from '../types/models';
export function taskCompletionPercent(subtasks:ReadonlyArray<Pick<Subtask,'done'>>):number {
 return subtasks.length === 0 ? 0 : Math.round(100 * subtasks.filter(s=>s.done).length / subtasks.length);
}
export function projectProgress(tasks:ReadonlyArray<Pick<Task,'statusId'>>, completedStatusIds:ReadonlyArray<string>):number {
 return tasks.length === 0 ? 0 : Math.round(100 * tasks.filter(t=>completedStatusIds.includes(t.statusId)).length / tasks.length);
}
export function tasksForProject<T extends Pick<Task,'projectId'>>(tasks:ReadonlyArray<T>, projectId:string):T[] {
 return tasks.filter(t=>t.projectId===projectId);
}
export function formatShortDate(iso:string|null):string {
 if(!iso) return 'Sans échéance';
 const parsed = new Date(iso);
 return Number.isNaN(parsed.getTime()) ? 'Date invalide' : parsed.toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'});
}
