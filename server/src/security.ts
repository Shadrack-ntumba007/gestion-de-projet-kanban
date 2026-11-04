import {randomBytes,createHash,scrypt as scryptCallback,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(scryptCallback);
export function normalizeEmail(email:string):string {return email.trim().toLowerCase();}
export function validEmail(email:string):boolean {return /^\S+@\S+\.\S+$/.test(email) && email.length<=254;}
export function validPassword(pwd:string):boolean{return pwd.length>=8&&pwd.length<=128;}
export async function hashPassword(pwd:string):Promise<string>{
  const salt=randomBytes(16).toString('hex');
  const key=await scrypt(pwd,salt,64) as Buffer;
  return `scrypt$${salt}$${key.toString('hex')}`;
}
export async function verifyPassword(pwd:string,stored:string):Promise<boolean>{
  const [kind,salt,hex]=stored.split('$');
  if(kind!=='scrypt'||!salt||!hex||!/^[a-f\d]{128}$/.test(hex))return false;
  const given=await scrypt(pwd,salt,64) as Buffer;
  return timingSafeEqual(given,Buffer.from(hex,'hex'));
}
export function newToken():string{return randomBytes(32).toString('base64url');}
/** Code à transmettre hors bande (72 bits aléatoires, 12 caractères). */
export function newInviteCode():string{return randomBytes(9).toString('base64url');}
export function tokenHash(token:string):string{return createHash('sha256').update(token).digest('hex');}
