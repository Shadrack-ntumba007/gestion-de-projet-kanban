import type { SQLiteDatabase } from 'expo-sqlite';

export interface TaskStatusEvent {
  id: number;
  taskId: string;
  kind: 'status_changed';
  previousStatusId: string;
  nextStatusId: string;
  occurredAt: string;
}

type ActivityRow = {
  id: number; task_id: string; kind: 'status_changed';
  previous_status_id: string; next_status_id: string; occurred_at: string;
};

/** Les changements d'état sont insérés par un trigger SQLite (pas par l'écran). */
export async function getTaskStatusHistory(
  db: SQLiteDatabase,
  taskId: string,
): Promise<TaskStatusEvent[]> {
  const rows = await db.getAllAsync<ActivityRow>(
    `SELECT id, task_id, kind, previous_status_id, next_status_id, occurred_at
     FROM task_activity WHERE task_id = ? ORDER BY id DESC`,
    taskId,
  );
  return rows.map((row) => ({
    id: row.id,
    taskId: row.task_id,
    kind: row.kind,
    previousStatusId: row.previous_status_id,
    nextStatusId: row.next_status_id,
    occurredAt: row.occurred_at,
  }));
}
