import { BackendNotConfiguredError } from './backendContracts';
/** API de comptes réelle à intégrer. Ne jamais valider les mots de passe uniquement côté client. */
export async function signIn(_email:string, _password:string):Promise<never> { throw new BackendNotConfiguredError(); }
export async function signUp(_name:string, _email:string, _password:string):Promise<never> { throw new BackendNotConfiguredError(); }
export async function requestPasswordReset(_email:string):Promise<never> { throw new BackendNotConfiguredError(); }
