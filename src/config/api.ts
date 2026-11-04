import * as SecureStore from 'expo-secure-store';
const apiUrl=process.env.EXPO_PUBLIC_TASKIFY_API_URL?.trim()??'';
export const apiConfigured=apiUrl.startsWith('http://')||apiUrl.startsWith('https://');
const root=apiUrl.replace(/\/+$/,'');
const TOKEN_KEY='taskify.remote.session.v1';
export interface RemoteUser{id:string;name:string;email:string;workspaceId:string|null;}
export interface LoginResult{token:string;user:RemoteUser;}
export const getSessionToken=()=>SecureStore.getItemAsync(TOKEN_KEY);
export const saveSessionToken=(token:string)=>SecureStore.setItemAsync(TOKEN_KEY,token);
export const clearSessionToken=()=>SecureStore.deleteItemAsync(TOKEN_KEY);
export async function apiRequest<T>(endpoint:string,method:'GET'|'POST'|'PATCH'|'DELETE'='GET',payload?:unknown,authenticated=true):Promise<T>{
 if(!apiConfigured)throw new Error('API non configurée : ajoutez EXPO_PUBLIC_TASKIFY_API_URL dans le fichier .env de l’application.');
 const token=authenticated?await getSessionToken():null;
 if(authenticated&&!token)throw new Error('Session absente. Reconnectez-vous.');
 const ctrl=new AbortController();
 const timeout=setTimeout(()=>ctrl.abort(),12000);
 let result:Response;
 try{
  result=await fetch(`${root}${endpoint}`,{
   method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},
   ...(payload===undefined?{}:{body:JSON.stringify(payload)}),signal:ctrl.signal,
  });
 }catch{throw new Error('API inaccessible. Vérifiez le serveur, le réseau Wi-Fi, l’adresse IP et le port 3005.');}
 finally{clearTimeout(timeout);}
 const data:unknown=await result.json().catch(()=>({}));
 if(!result.ok){
  const message=typeof data==='object'&&data!==null&&'error' in data&&typeof data.error==='string'?data.error:'Erreur du serveur.';
  throw new Error(message);
 }
 return data as T;
}
