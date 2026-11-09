import type { SQLiteDatabase } from 'expo-sqlite';
import type { AppSnapshot } from '../../types/models';
import { loadSnapshot } from './snapshotRepository';
import { createId } from '../../utils/ids';

/**
 * Ordre des cartes : table additionnelle, sans modification des migrations
 * SQLite preexistantes. Aucune table ou tache n'est supprimee.
 */
async function ensureTaskOrder(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS task_kanban_order (
      task_id TEXT PRIMARY KEY REFERENCES tasks(id) ON DELETE CASCADE,
      position INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_task_kanban_order_position
      ON task_kanban_order(position);
  `);
}

type PositionRow = { task_id: string; position: number };
type TaskIdRow = { id: string };
type TaskRow = { id: string; project_id: string; status_id: string };

const key = (projectId: string, statusId: string) => `${projectId}\u0000${statusId}`;

/** Restaure l'ordre de chaque colonne en laissant les autres groupes intacts. */
export async function loadOrderedLocalSnapshot(db: SQLiteDatabase): Promise<AppSnapshot> {
  await ensureTaskOrder(db);
  const snapshot = await loadSnapshot(db);
  const rows = await db.getAllAsync<PositionRow>(
    'SELECT task_id, position FROM task_kanban_order'
  );
  const ranks = new Map(rows.map(row => [row.task_id, row.position]));
  const groups = new Map<string, typeof snapshot.tasks>();
  for (const task of snapshot.tasks) {
    const k = key(task.projectId, task.statusId);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(task);
  }
  for (const tasks of groups.values()) {
    // Un ticket cree apres la migration (sans rang) se place a la fin.
    tasks.sort((a, b) =>
      (ranks.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
      (ranks.get(b.id) ?? Number.MAX_SAFE_INTEGER)
    );
  }
  const counters = new Map<string, number>();
  snapshot.tasks = snapshot.tasks.map(task => {
    const k = key(task.projectId, task.statusId);
    const index = counters.get(k) ?? 0;
    counters.set(k, index + 1);
    return groups.get(k)![index];
  });
  return snapshot;
}

/**
 * Deplace la meme tache et son ordre dans une seule transaction locale.
 * beforeTaskId = null : insertion en fin de la colonne cible.
 */
export async function moveLocalTask(
  db: SQLiteDatabase,
  taskId: string,
  statusId: string,
  beforeTaskId: string | null,
  userId: string,
  reason?: string
): Promise<void> {
  await ensureTaskOrder(db);
  await db.withExclusiveTransactionAsync(async tx => {
    const task = await tx.getFirstAsync<TaskRow>(
      'SELECT id, project_id, status_id FROM tasks WHERE id=?', taskId
    );
    if (!task) throw new Error('Tâche introuvable.');

    const target = await tx.getFirstAsync<{ id: string; name: string }>(
      'SELECT id, name FROM statuses WHERE id=? AND project_id=?',
      statusId, task.project_id
    );
    if (!target) throw new Error('État hors de ce projet.');

    // Validation obligatoire, dans la même transaction que le déplacement.
    if (task.status_id !== statusId) {
      const from = await tx.getFirstAsync<{name:string}>(
        'SELECT name FROM statuses WHERE id=? AND project_id=?',
        task.status_id, task.project_id
      );
      const member = await tx.getFirstAsync<{role:string}>(
        'SELECT role FROM project_members WHERE project_id=? AND user_id=?',
        task.project_id, userId
      );
      if (!from) throw new Error('État source introuvable.');
      if (!member || member.role === 'viewer') {
        throw new Error('Droits insuffisants pour modifier cette tâche.');
      }
      const responsible = member.role === 'owner' || member.role === 'admin';
      const forward =
        (from.name === 'À faire' && target.name === 'En cours') ||
        (from.name === 'En cours' && target.name === 'À valider');
      if (!forward) {
        if (from.name === 'À valider' && target.name === 'Terminé') {
          if (!responsible) throw new Error('Seul un responsable peut approuver.');
        } else if (from.name === 'À valider' && target.name === 'En cours') {
          if (!responsible) throw new Error('Seul un responsable peut demander une correction.');
          const message = reason?.trim() ?? '';
          if (!message || message.length > 2500) {
            throw new Error('Justification obligatoire (1 à 2500 caractères).');
          }
          await tx.runAsync(
            'INSERT INTO comments(id,task_id,author_id,body,created_at) VALUES(?,?,?,?,?)',
            createId('comment'), taskId, userId,
            'Correction demandée : ' + message, new Date().toISOString()
          );
        } else {
          throw new Error('Transition interdite : suivez À faire → En cours → À valider → Terminé.');
        }
      }
    }
    const idsIn = async (sid: string): Promise<string[]> => {
      const rows = await tx.getAllAsync<TaskIdRow>(`
        SELECT t.id FROM tasks t
        LEFT JOIN task_kanban_order o ON o.task_id=t.id
        WHERE t.project_id=? AND t.status_id=? AND t.id<>?
        ORDER BY COALESCE(o.position, 2147483647), t.created_at, t.id
      `, task.project_id, sid, taskId);
      return rows.map(row => row.id);
    };

    const destination = await idsIn(statusId);
    const insertIndex = beforeTaskId === null
      ? destination.length
      : destination.indexOf(beforeTaskId);
    if (insertIndex < 0) throw new Error('Position de dépôt invalide.');
    destination.splice(insertIndex, 0, taskId);

    const origin = task.status_id !== statusId
      ? await idsIn(task.status_id)
      : [];

    await tx.runAsync(
      'UPDATE tasks SET status_id=?, updated_at=? WHERE id=? AND project_id=?',
      statusId, new Date().toISOString(), taskId, task.project_id
    );

    const saveRanks = async (ids: string[]): Promise<void> => {
      for (let i = 0; i < ids.length; i++) {
        await tx.runAsync(`
          INSERT INTO task_kanban_order(task_id, position) VALUES (?, ?)
          ON CONFLICT(task_id) DO UPDATE SET position=excluded.position
        `, ids[i], i);
      }
    };
    await saveRanks(destination);
    await saveRanks(origin);
  });
}
