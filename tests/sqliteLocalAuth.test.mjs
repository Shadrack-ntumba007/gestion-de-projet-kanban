import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {SCHEMA_V1,SCHEMA_V2,SCHEMA_V3,DATABASE_VERSION} from '../src/db/schema.ts';
const setup=()=>{const d=new DatabaseSync(':memory:');d.exec('PRAGMA foreign_keys=ON;');d.exec(SCHEMA_V1);d.exec(SCHEMA_V2);d.exec(SCHEMA_V3);return d};
function seed(d){
 d.prepare('INSERT INTO workspaces(id,name,owner_id) VALUES(?,?,?)').run('w','Demo','u');
 d.prepare('INSERT INTO users(id,name,email) VALUES(?,?,?)').run('u','Demo','demo@example.test');
 d.prepare(`INSERT INTO projects(id,workspace_id,title,description,icon,priority,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)`).run('p','w','Projet','','📁','medium','t','t');
 d.prepare(`INSERT INTO project_members(project_id,user_id,role) VALUES(?,?,?)`).run('p','u','owner');
}
test('version 4 crée comptes et invitations locaux',()=>{
 const d=setup();try{assert.equal(DATABASE_VERSION,4);const names=d.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(x=>x.name);assert.ok(names.includes('local_accounts'));assert.ok(names.includes('local_invitations'));}finally{d.close();}
});
test('une invitation en attente ne supprime pas les projets existants',()=>{
 const d=setup();try{seed(d);d.prepare('INSERT INTO local_invitations(id,project_id,email,role,created_at) VALUES(?,?,?,?,?)').run('i','p','test@example.com','editor','t');d.exec(SCHEMA_V3);assert.equal(d.prepare('SELECT count(*) n FROM projects').get().n,1);assert.equal(d.prepare('SELECT count(*) n FROM local_invitations').get().n,1);}finally{d.close();}
});
test('rôles invalides refusés et clé étrangère vérifiée',()=>{
 const d=setup();try{seed(d);assert.throws(()=>d.prepare('INSERT INTO local_invitations(id,project_id,email,role,created_at) VALUES(?,?,?,?,?)').run('i','p','x@example.com','owner','t'));assert.throws(()=>d.prepare('INSERT INTO local_invitations(id,project_id,email,role,created_at) VALUES(?,?,?,?,?)').run('i2','absent','x@example.com','editor','t'));assert.equal(d.prepare('PRAGMA foreign_key_check').all().length,0);}finally{d.close();}
});
