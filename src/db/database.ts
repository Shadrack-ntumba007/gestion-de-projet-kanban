import type { SQLiteDatabase } from 'expo-sqlite';
import {
  demoAssignees,
  demoComments,
  demoMembers,
  demoNotifications,
  demoProjects,
  demoStatuses,
  demoSubtasks,
  demoTasks,
  demoUsers,
  demoWorkspace,
} from '../data/demoData';
import { DATABASE_VERSION, SCHEMA_V1, SCHEMA_V2, SCHEMA_V3 } from './schema';

export const DATABASE_NAME = 'taskify-local.db';

/**
 * SQLiteProvider appelle cette migration avant d'afficher les écrans.
 * V0 → V1 : création des tables et insertion initiale des données de démonstration.
 * V1 → V2 : amélioration additive. V2 → V3 : comptes et invitations locaux.
 */
export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  // La vérification des clés étrangères doit être activée à chaque connexion.
  await db.execAsync('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentVersion = row?.user_version ?? 0;

  if (currentVersion > DATABASE_VERSION) {
    throw new Error(`Base de données plus récente que l'application (v${currentVersion}).`);
  }
  if (currentVersion === DATABASE_VERSION) return;

  if (currentVersion === 0) {
    await db.execAsync(SCHEMA_V1);

    // Le seed ne doit jamais écraser les projets créés par l'utilisateur.
    const count = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) AS count FROM workspaces',
    );
    if (!count?.count) {
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          'INSERT INTO workspaces(id, name, owner_id) VALUES (?, ?, ?)',
          demoWorkspace.id,
          demoWorkspace.name,
          demoWorkspace.ownerId,
        );
        for (const user of demoUsers) {
          await db.runAsync(
            'INSERT INTO users(id, name, email) VALUES (?, ?, ?)',
            user.id, user.name, user.email,
          );
        }
        for (const project of demoProjects) {
          await db.runAsync(
            'INSERT INTO projects(id, workspace_id, title, description, icon, priority, due_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            project.id, project.workspaceId, project.title, project.description,
            project.icon, project.priority, project.dueDate,
            project.createdAt, project.updatedAt,
          );
        }
        for (const member of demoMembers) {
          await db.runAsync(
            'INSERT INTO project_members(project_id, user_id, role) VALUES (?, ?, ?)',
            member.projectId, member.userId, member.role,
          );
        }
        for (const status of demoStatuses) {
          await db.runAsync(
            'INSERT INTO statuses(id, project_id, name, color, position) VALUES (?, ?, ?, ?, ?)',
            status.id, status.projectId, status.name, status.color, status.position,
          );
        }
        for (const task of demoTasks) {
          await db.runAsync(
            'INSERT INTO tasks(id, project_id, status_id, title, description, priority, start_date, due_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            task.id, task.projectId, task.statusId, task.title, task.description,
            task.priority, task.startDate, task.dueDate, task.createdAt, task.updatedAt,
          );
        }
        for (const assignee of demoAssignees) {
          await db.runAsync(
            'INSERT INTO task_assignees(task_id, user_id) VALUES (?, ?)',
            assignee.taskId, assignee.userId,
          );
        }
        for (const subtask of demoSubtasks) {
          await db.runAsync(
            'INSERT INTO subtasks(id, task_id, title, done, position) VALUES (?, ?, ?, ?, ?)',
            subtask.id, subtask.taskId, subtask.title,
            subtask.done ? 1 : 0, subtask.position,
          );
        }
        for (const comment of demoComments) {
          await db.runAsync(
            'INSERT INTO comments(id, task_id, author_id, body, created_at) VALUES (?, ?, ?, ?, ?)',
            comment.id, comment.taskId, comment.authorId,
            comment.body, comment.createdAt,
          );
        }
        for (const notification of demoNotifications) {
          await db.runAsync(
            'INSERT INTO notifications(id, user_id, title, body, created_at, read) VALUES (?, ?, ?, ?, ?, ?)',
            notification.id, notification.userId, notification.title,
            notification.body, notification.createdAt, notification.read ? 1 : 0,
          );
        }
      });
    }

    // Si la migration V2 échoue, le prochain démarrage reprendra depuis V1.
    await db.execAsync('PRAGMA user_version = 1');
    currentVersion = 1;
  }

  if (currentVersion === 1) {
    await db.execAsync(SCHEMA_V2);
    await db.execAsync('PRAGMA user_version = 2');
    currentVersion = 2;
  }

  if (currentVersion === 2) {
    await db.execAsync(SCHEMA_V3);
    await db.execAsync('PRAGMA user_version = 3');
    currentVersion = 3;
  }

  // V4 : synchronise les IDENTITES fictives de demoData.ts sur les bases deja creees.
  // N'efface aucun projet, tache, invitation ni compte local reel.
  // Un compte cree via l'inscription locale n'est jamais modifie.
  if (currentVersion === 3) {
    await db.withTransactionAsync(async () => {
      for (const user of demoUsers) {
        await db.runAsync(
          `UPDATE users SET name = ?
           WHERE id = ?
             AND NOT EXISTS (SELECT 1 FROM local_accounts WHERE user_id = users.id)`,
          user.name, user.id,
        );
        await db.runAsync(
          `UPDATE users SET email = ?
           WHERE id = ?
             AND NOT EXISTS (SELECT 1 FROM local_accounts WHERE user_id = users.id)
             AND NOT EXISTS (
               SELECT 1 FROM users AS other
               WHERE lower(other.email) = lower(?) AND other.id <> users.id
             )`,
          user.email, user.id, user.email,
        );
      }
    });
    await db.execAsync('PRAGMA user_version = 4');
  }
}
