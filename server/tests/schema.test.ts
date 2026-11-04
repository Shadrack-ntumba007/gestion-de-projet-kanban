import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const v1=readFileSync(new URL('../sql/001_init.sql',import.meta.url),'utf8');
const v2=readFileSync(new URL('../sql/002_shared_workspace.sql',import.meta.url),'utf8');
test('PostgreSQL: modèles comptes, équipes, Kanban et invitations',()=>{
 for(const t of ['app_users','auth_sessions','workspaces','workspace_members','projects','kanban_statuses','tasks','task_assignees','subtasks','task_comments','notifications','workspace_invitations']){
  assert.match(v1,new RegExp(`CREATE TABLE IF NOT EXISTS ${t}\\s*\\(`));
 }
});
test('PostgreSQL: contraintes de sécurité d’accès',()=>{
 assert.match(v1,/token_hash TEXT NOT NULL UNIQUE/);
 assert.match(v1,/task_status_same_project/);
 assert.match(v1,/invitations_one_pending_idx/);
 assert.match(v2,/ALTER TABLE projects ADD COLUMN IF NOT EXISTS icon/);
});
