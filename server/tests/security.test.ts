import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeEmail,validEmail,validPassword,hashPassword,verifyPassword,newToken,newInviteCode,tokenHash} from '../src/security.ts';
test('normalisation de l’e-mail',()=>assert.equal(normalizeEmail(' TEST@EXEMPLE.COM '),'test@exemple.com'));
test('validation d’adresse',()=>{assert.equal(validEmail('a@b.cd'),true);assert.equal(validEmail('invalid'),false);});
test('mot de passe fort / limites',()=>{assert.equal(validPassword('12345678'),true);assert.equal(validPassword('12345'),false);});
test('hachage scrypt et comparaison',async()=>{
 const stored=await hashPassword('motdepasse123');assert.ok(stored.startsWith('scrypt$'));
 assert.equal(await verifyPassword('motdepasse123',stored),true);
 assert.equal(await verifyPassword('autre-mot-de-passe',stored),false);
});
test('jeton aléatoire et empreinte',()=>{
 const a=newToken(),b=newToken();assert.notEqual(a,b);assert.equal(tokenHash(a).length,64);assert.equal(newInviteCode().length,12);
});
