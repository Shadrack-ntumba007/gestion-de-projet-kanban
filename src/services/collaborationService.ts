import { BackendNotConfiguredError } from './backendContracts';
import type { ProjectRole } from '../types/models';
/** L'envoi d'invitations, la révocation et l'application réelle des droits sont côté serveur. */
export async function inviteMember(_projectId:string, _email:string, _role:ProjectRole):Promise<never> {throw new BackendNotConfiguredError();}
export async function revokeMember(_projectId:string, _userId:string):Promise<never> {throw new BackendNotConfiguredError();}
