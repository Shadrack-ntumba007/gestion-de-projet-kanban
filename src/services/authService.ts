import {apiRequest,clearSessionToken,type LoginResult,type RemoteUser} from '../config/api';
export const remoteRegister=(name:string,email:string,password:string)=>apiRequest<LoginResult>('/api/auth/register','POST',{name,email,password},false);
export const remoteLogin=(email:string,password:string)=>apiRequest<LoginResult>('/api/auth/login','POST',{email,password},false);
export const remoteMe=()=>apiRequest<{user:RemoteUser}>('/api/auth/me');
export async function remoteLogout(){try{await apiRequest<{ok:boolean}>('/api/auth/logout','POST',{});}finally{await clearSessionToken();}}
