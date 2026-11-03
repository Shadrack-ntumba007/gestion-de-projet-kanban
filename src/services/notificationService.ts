import { BackendNotConfiguredError } from './backendContracts';
/** Les notifications locales SQLite ne sont pas des push distantes. */
export async function registerForRemoteNotifications():Promise<never> {throw new BackendNotConfiguredError();}
