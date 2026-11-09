import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { DATABASE_VERSION, SCHEMA_V1, SCHEMA_V2, SCHEMA_V3 } from '../src/db/schema.ts';

function createDb() {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(SCHEMA_V1);
  db.exec(SCHEMA_V2);
  db.exec(SCHEMA_V3);
  return db;
}
function seedMinimal(db) {
  db.prepare('INSERT INTO workspaces(id,name,owner_id) VALUES (?,?,?)').run('w','Espace','u');
  db.prepare('INSERT INTO users(id,name,email) VALUES (?,?,?)').run('u','Demo','demo@taskify.test');
  db.prepare(`INSERT INTO projects(id,workspace_id,title,description,icon,priority,created_at,updated_at)
   VALUES (?,?,?,?,?,?,?,?)`).run('p1','w','Projet 1','','📁','medium','2026','2026');
  db.prepare(`INSERT INTO projects(id,workspace_id,title,description,icon,priority,created_at,updated_at)
   VALUES (?,?,?,?,?,?,?,?)`).run('p2','w','Projet 2','','📁','medium','2026','2026');
  db.prepare('INSERT INTO statuses(id,project_id,name,color,position) VALUES (?,?,?,?,?)').run('todo','p1','À faire','#eee',0);
  db.prepare('INSERT INTO statuses(id,project_id,name,color,position) VALUES (?,?,?,?,?)').run('done','p1','Terminé','#eee',1);
  db.prepare('INSERT INTO statuses(id,project_id,name,color,position) VALUES (?,?,?,?,?)').run('foreign','p2','À faire','#eee',0);
  db.prepare(`INSERT INTO tasks(id,project_id,status_id,title,description,priority,created_at,updated_at)
   VALUES (?,?,?,?,?,?,?,?)`).run('t1','p1','todo','Préparer la maquette','','medium','2026','2026');
}

test('schéma SQLite v2 : tables et index nécessaires', () => {
  const db = createDb();
  try {
    assert.equal(DATABASE_VERSION, 4);
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(x=>x.name);
    for(const name of ['users','workspaces','projects','project_members','statuses','tasks','task_assignees','subtasks','comments','notifications','task_activity']) assert.ok(tables.includes(name), name);
    assert.equal(db.prepare('PRAGMA foreign_keys').get().foreign_keys, 1);
    assert.equal(db.prepare('PRAGMA foreign_key_check').all().length, 0);
  } finally { db.close(); }
});

test('V1 vers V2 : conserver les données et appliquer la migration une fois', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec(SCHEMA_V1);
    seedMinimal(db);
    db.exec('PRAGMA user_version = 1;');
    db.exec(SCHEMA_V2);
    db.exec('PRAGMA user_version = 2;');
    // Une migration additive relancée ne doit ni modifier ni dupliquer les données.
    db.exec(SCHEMA_V2);
    assert.equal(db.prepare('PRAGMA user_version').get().user_version, 2);
    assert.equal(db.prepare('SELECT count(*) AS n FROM tasks').get().n, 1);
  } finally { db.close(); }
});

test('une tâche ne peut pas utiliser le statut Kanban d’un autre projet', () => {
  const db = createDb();
  try {
    seedMinimal(db);
    assert.throws(()=>db.prepare('UPDATE tasks SET status_id = ? WHERE id = ?').run('foreign','t1'),/Etat Kanban hors du projet/);
    assert.equal(db.prepare('SELECT status_id FROM tasks WHERE id=?').get('t1').status_id,'todo');
  } finally { db.close(); }
});

test('déplacer une tâche crée un historique, supprimer la tâche supprime son historique', () => {
  const db = createDb();
  try {
    seedMinimal(db);
    db.prepare('UPDATE tasks SET status_id = ? WHERE id = ?').run('done','t1');
    const events = db.prepare('SELECT task_id, previous_status_id, next_status_id FROM task_activity').all();
    assert.equal(events.length,1);
    assert.deepEqual({...events[0]}, {task_id:'t1', previous_status_id:'todo',next_status_id:'done'});
    db.prepare('DELETE FROM tasks WHERE id=?').run('t1');
    assert.equal(db.prepare('SELECT count(*) AS n FROM task_activity').get().n,0);
    assert.equal(db.prepare('PRAGMA foreign_key_check').all().length,0);
  } finally { db.close(); }
});
