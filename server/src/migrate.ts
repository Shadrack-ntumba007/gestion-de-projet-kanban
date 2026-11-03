import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {pool} from './db.ts';
const migrations = [
  [1,'001_init.sql'],
  [2,'002_shared_workspace.sql'],
] as const;
const conn=await pool.connect();
try{
  await conn.query('BEGIN');
  await conn.query('SELECT pg_advisory_xact_lock(741207)');
  await conn.query('CREATE TABLE IF NOT EXISTS schema_migrations(version integer PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
  for(const [version,name] of migrations){
    const r=await conn.query('SELECT 1 FROM schema_migrations WHERE version=$1',[version]);
    if(r.rowCount)continue;
    const file=fileURLToPath(new URL(`../sql/${name}`,import.meta.url));
    await conn.query(await readFile(file,'utf8'));
    await conn.query('INSERT INTO schema_migrations(version) VALUES($1)',[version]);
    console.log(`Migration PostgreSQL V${version} appliquée.`);
  }
  await conn.query('COMMIT');
}catch(e){await conn.query('ROLLBACK');console.error(e);process.exitCode=1;}
finally{conn.release();await pool.end();}
