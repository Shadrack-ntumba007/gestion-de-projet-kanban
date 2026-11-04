import {apiRequest} from '../config/api';
import type {ProjectRole} from '../types/models';
export interface RemoteInvitation {id:string;role:'admin'|'editor'|'viewer';status:'pending';workspaceName:string;invitedBy:string;createdAt:string;}
export interface PendingSentInvitation{id:string;email:string;role:string;createdAt:string;}
export const inviteRemote=(projectId:string,email:string,role:ProjectRole)=>apiRequest<{id:string;status:'pending';code:string;message:string}>('/api/invitations','POST',{projectId,email,role});
export const receiveInvitations=()=>apiRequest<{invitations:RemoteInvitation[]}>('/api/invitations');
export const sentInvitations=(workspaceId:string)=>apiRequest<{invitations:PendingSentInvitation[]}>(`/api/workspaces/${encodeURIComponent(workspaceId)}/invitations`);
export const respondInvitation=(id:string,accept:boolean,code='')=>apiRequest<{ok:boolean}>(`/api/invitations/${encodeURIComponent(id)}/${accept?'accept':'reject'}`,'POST',{code});
