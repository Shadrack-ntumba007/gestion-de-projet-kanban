import { BackendNotConfiguredError } from './backendContracts';
/** Ne pas prétendre à une synchronisation multi-appareils sans infrastructure distante. */
export async function syncChanges():Promise<never> {throw new BackendNotConfiguredError();}
