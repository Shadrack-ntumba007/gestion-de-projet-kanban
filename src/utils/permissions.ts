import type { ProjectRole } from '../types/models';
export function canEdit(role:ProjectRole|undefined):boolean {return role==='owner'||role==='admin'||role==='editor';}
export function canManageMembers(role:ProjectRole|undefined):boolean {return role==='owner'||role==='admin';}
export function canDeleteProject(role:ProjectRole|undefined):boolean {return role==='owner';}
