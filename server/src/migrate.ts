
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { pool } from './db.ts';

// Migrations PostgreSQL de Taskify
const migrations = [
  [1, '001_init.sql'],
  [2, '002_shared_workspace.sql'],
  [4, '004_kanban_task_order.sql'],
  [5, '005_email_invitations.sql'],
] as const;

const conn = await pool.connect();

try {
  await conn.query('BEGIN');

  // Empêche deux instances de lancer
  // simultanément les mêmes migrations.
  await conn.query(
    'SELECT pg_advisory_xact_lock(741207)'
  );

  await conn.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW()
    )
  `);

  for (const [version, name] of migrations) {
    const alreadyApplied = await conn.query(
      `SELECT 1
       FROM schema_migrations
       WHERE version = $1`,
      [version]
    );

    if (alreadyApplied.rowCount) {
      console.log(
        `Migration V${version} déjà appliquée.`
      );
      continue;
    }

    const file = fileURLToPath(
      new URL(`../sql/${name}`, import.meta.url)
    );

    const sql = await readFile(file, 'utf8');

    await conn.query(sql);

    await conn.query(
      `INSERT INTO schema_migrations(version)
       VALUES ($1)`,
      [version]
    );

    console.log(
      `Migration PostgreSQL V${version} appliquée.`
    );
  }

  await conn.query('COMMIT');

  console.log(
    'Toutes les migrations PostgreSQL sont à jour.'
  );

} catch (error) {
  await conn.query('ROLLBACK');

  console.error(
    'Erreur pendant les migrations :',
    error
  );

  process.exitCode = 1;

} finally {
  conn.release();
  await pool.end();
}