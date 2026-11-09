
import { apiRequest } from '../config/api';

import type {
  AppSnapshot,
  NewProject,
  NewTask,
  ProjectRole,
} from '../types/models';

type Ok = {
  ok: boolean;
};

const enc = encodeURIComponent;

// =============================================
// SNAPSHOT COLLABORATIF
// =============================================

export const fetchRemoteData = async () =>
  (
    await apiRequest<{ data: AppSnapshot }>(
      '/api/data/snapshot'
    )
  ).data;

// =============================================
// GESTION DES PROJETS
// =============================================

export const createRemoteProject = async (p: NewProject) =>
  (
    await apiRequest<{ id: string }>(
      '/api/data/projects',
      'POST',
      p
    )
  ).id;

export const saveRemoteProject = (
  id: string,
  p: NewProject
) =>
  apiRequest<Ok>(
    `/api/data/projects/${enc(id)}`,
    'PATCH',
    p
  );

// =============================================
// GESTION DES TÂCHES
// =============================================

export const createRemoteTask = async (t: NewTask) =>
  (
    await apiRequest<{ id: string }>(
      '/api/data/tasks',
      'POST',
      t
    )
  ).id;

// Modification complète d'une tâche.
export const saveRemoteTask = (
  id: string,
  t: NewTask
) =>
  apiRequest<Ok>(
    `/api/data/tasks/${enc(id)}`,
    'PATCH',
    t
  );

// KANBAN-02 : déplacement d'une tâche.
// Ne modifie que son statusId.
export const moveRemoteTask = (taskId: string, statusId: string, beforeTaskId: string | null = null) =>
  apiRequest<Ok>(`/api/data/tasks/${enc(taskId)}/status`, 'PATCH', { statusId, beforeTaskId });
export const deleteRemoteTask = (id: string) =>
  apiRequest<Ok>(
    `/api/data/tasks/${enc(id)}`,
    'DELETE'
  );

// =============================================
// GESTION DES ÉTATS KANBAN
// =============================================

export const createRemoteStatus = (
  projectId: string,
  name: string,
  color: string
) =>
  apiRequest<{ id: string }>(
    `/api/data/projects/${enc(projectId)}/statuses`,
    'POST',
    { name, color }
  );

export const saveRemoteStatus = (
  id: string,
  name: string,
  color: string
) =>
  apiRequest<Ok>(
    `/api/data/statuses/${enc(id)}`,
    'PATCH',
    { name, color }
  );

export const deleteRemoteStatus = (id: string) =>
  apiRequest<Ok>(
    `/api/data/statuses/${enc(id)}`,
    'DELETE'
  );

// =============================================
// GESTION DES SOUS-TÂCHES
// =============================================

export const saveRemoteSubtask = (
  id: string,
  done: boolean
) =>
  apiRequest<Ok>(
    `/api/data/subtasks/${enc(id)}`,
    'PATCH',
    { done }
  );

export const createRemoteSubtask = (
  taskId: string,
  title: string
) =>
  apiRequest<Ok>(
    `/api/data/tasks/${enc(taskId)}/subtasks`,
    'POST',
    { title }
  );

// =============================================
// COMMENTAIRES
// =============================================

export const createRemoteComment = (
  taskId: string,
  body: string
) =>
  apiRequest<Ok>(
    `/api/data/tasks/${enc(taskId)}/comments`,
    'POST',
    { body }
  );

// =============================================
// NOTIFICATIONS
// =============================================

export const readRemoteNotification = (id: string) =>
  apiRequest<Ok>(
    `/api/data/notifications/${enc(id)}/read`,
    'PATCH'
  );

// =============================================
// RÔLES ET PERMISSIONS
// =============================================

export const saveRemoteMemberRole = (
  pid: string,
  uid: string,
  role: ProjectRole
) =>
  apiRequest<Ok>(
    `/api/data/projects/${enc(pid)}/members/${enc(uid)}/role`,
    'PATCH',
    { role }
  );
