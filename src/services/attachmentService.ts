import { BackendNotConfiguredError } from './backendContracts';
/** Référence d'attachements visible dans la maquette, stockage distant non défini. */
export async function uploadTaskAttachment(_taskId:string,_fileUri:string):Promise<never> {throw new BackendNotConfiguredError();}
