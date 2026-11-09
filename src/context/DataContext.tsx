
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useSQLiteContext } from 'expo-sqlite';

import type {
  AppSnapshot,
  NewProject,
  NewTask,
  ProjectRole,
} from '../types/models';

import { loadOrderedLocalSnapshot, moveLocalTask } from '../db/repositories/taskOrderRepository';

import {
  insertProject,
  updateProject,
  updateProjectRole,
} from '../db/repositories/projectRepository';

import {
  insertTask,
  updateTask,
  deleteTask,
  toggleSubtask,
  createSubtask,
  createComment,
} from '../db/repositories/taskRepository';

import {
  addStatus,
  editStatus,
  removeStatus,
} from '../db/repositories/statusRepository';

import {
  markNotificationRead,
} from '../db/repositories/notificationRepository';

import * as remote from '../services/remoteDataService';

import { runtime } from '../config/runtime';
import { useAuth } from './AuthContext';

import {
  canEdit,
  canManageMembers,
} from '../utils/permissions';

// ===================================================
// TYPES DU CONTEXTE
// ===================================================

type DataValue = {
  data: AppSnapshot | null;
  loading: boolean;
  syncError: string | null;

  reload: () => Promise<void>;

  createProject: (p: NewProject) => Promise<string>;
  saveProject: (
    id: string,
    p: NewProject
  ) => Promise<void>;

  createTask: (t: NewTask) => Promise<string>;
  saveTask: (
    id: string,
    t: NewTask
  ) => Promise<void>;

  // KANBAN-02 :
  // Déplacer une tâche existante vers un autre état.
  moveTask:(taskId:string,statusId:string,beforeTaskId?:string|null)=>Promise<void>;

  removeTask: (id: string) => Promise<void>;

  createStatus: (
    projectId: string,
    name: string,
    color: string
  ) => Promise<void>;

  saveStatus: (
    id: string,
    name: string,
    color: string
  ) => Promise<void>;

  deleteStatus: (id: string) => Promise<void>;

  setSubtask: (
    id: string,
    done: boolean
  ) => Promise<void>;

  addSubtask: (
    taskId: string,
    title: string
  ) => Promise<void>;

  addComment: (
    taskId: string,
    body: string
  ) => Promise<void>;

  readNotification: (
    id: string
  ) => Promise<void>;

  setMemberRole: (
    projectId: string,
    userId: string,
    role: ProjectRole
  ) => Promise<void>;

  roleFor: (
    projectId: string
  ) => ProjectRole | undefined;
};

const Context = createContext<DataValue | null>(null);

// ===================================================
// DATA PROVIDER
// ===================================================

export function DataProvider({
  children,
}: {
  children: ReactNode;
}) {
  const db = useSQLiteContext();

  const { user, mode } = useAuth();

  const remoteMode = mode === 'remote';

  const userId = user?.id ?? runtime.demoUserId;

  const [data, setData] =
    useState<AppSnapshot | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [syncError, setSyncError] =
    useState<string | null>(null);

  // =================================================
  // RECHARGEMENT DES DONNÉES
  // =================================================

  const reload = useCallback(async () => {
    try {
      const next = remoteMode
        ? await remote.fetchRemoteData()
        : await loadOrderedLocalSnapshot(db);

      setData(next);
      setSyncError(null);
    } catch (error) {
      setSyncError(
        error instanceof Error
          ? error.message
          : 'Synchronisation impossible.'
      );

      throw error;
    } finally {
      setLoading(false);
    }
  }, [db, remoteMode, userId]);

  useEffect(() => {
    setLoading(true);
    setData(null);

    reload().catch(() => {});
  }, [reload]);

  // Actualisation des modifications faites
  // depuis d'autres téléphones.
  useEffect(() => {
    if (!remoteMode) return;

    const timer = setInterval(() => {
      reload().catch(() => {});
    }, 20000);

    return () => clearInterval(timer);
  }, [remoteMode, reload]);

  // =================================================
  // PERMISSIONS
  // =================================================

  const roleFor = useCallback(
    (projectId: string) =>
      data?.members.find(
        member =>
          member.projectId === projectId &&
          member.userId === userId
      )?.role,
    [data, userId]
  );

  const requireEdit = (projectId: string) => {
    if (!canEdit(roleFor(projectId))) {
      throw new Error(
        'Droits insuffisants pour modifier ce projet.'
      );
    }
  };

  // Exécuter une modification puis recharger
  // les données depuis la source active.
  const changed = async (
    action: () => Promise<unknown>
  ) => {
    await action();
    await reload();
  };

  // =================================================
  // ACTIONS DU CONTEXTE
  // =================================================

  const value = useMemo<DataValue>(
    () => ({
      data,
      loading,
      syncError,
      reload,
      roleFor,

      // ---------------------------------------------
      // PROJETS
      // ---------------------------------------------

      createProject: async project => {
        if (!project.title.trim()) {
          throw new Error('Titre requis.');
        }

        const id = remoteMode
          ? await remote.createRemoteProject(project)
          : await insertProject(db, project, userId);

        await reload();
        return id;
      },

      saveProject: async (id, project) => {
        requireEdit(id);

        await changed(() =>
          remoteMode
            ? remote.saveRemoteProject(id, project)
            : updateProject(db, id, project)
        );
      },

      // ---------------------------------------------
      // TÂCHES
      // ---------------------------------------------

      createTask: async task => {
        requireEdit(task.projectId);

        if (!task.title.trim()) {
          throw new Error('Titre requis.');
        }

        const id = remoteMode
          ? await remote.createRemoteTask(task)
          : await insertTask(db, task);

        await reload();
        return id;
      },

      saveTask: async (id, task) => {
        requireEdit(task.projectId);

        await changed(() =>
          remoteMode
            ? remote.saveRemoteTask(id, task)
            : updateTask(db, id, task)
        );
      },

      // =============================================
      // KANBAN-02 : DÉPLACEMENT D'UNE TÂCHE
      // =============================================

      moveTask: async (taskId: string, statusId: string, beforeTaskId: string | null = null) => {
        const task = data?.tasks.find(item => item.id === taskId);
        if (!task) throw new Error('Tâche introuvable.');
        requireEdit(task.projectId);
        const target = data?.statuses.find(st => st.id === statusId && st.projectId === task.projectId);
        if (!target) throw new Error('État de destination invalide.');
        if (beforeTaskId !== null && beforeTaskId === taskId) throw new Error('Position invalide.');
        await changed(() => remoteMode
          ? remote.moveRemoteTask(taskId, statusId, beforeTaskId)
          : moveLocalTask(db, taskId, statusId, beforeTaskId)
        );
      },

      
      removeTask: async id => {
        const task = data?.tasks.find(
          item => item.id === id
        );

        if (!task) {
          throw new Error('Tâche absente.');
        }

        requireEdit(task.projectId);

        await changed(() =>
          remoteMode
            ? remote.deleteRemoteTask(id)
            : deleteTask(db, id)
        );
      },

  
      createStatus: async (
        projectId,
        name,
        color
      ) => {
        requireEdit(projectId);

        if (!name.trim()) {
          throw new Error('Nom requis.');
        }

        await changed(() =>
          remoteMode
            ? remote.createRemoteStatus(
                projectId,
                name,
                color
              )
            : addStatus(
                db,
                projectId,
                name,
                color
              )
        );
      },

      saveStatus: async (
        id,
        name,
        color
      ) => {
        const status = data?.statuses.find(
          item => item.id === id
        );

        if (!status) {
          throw new Error('État absent.');
        }

        requireEdit(status.projectId);

        await changed(() =>
          remoteMode
            ? remote.saveRemoteStatus(
                id,
                name,
                color
              )
            : editStatus(
                db,
                id,
                name,
                color
              )
        );
      },

      deleteStatus: async id => {
        const status = data?.statuses.find(
          item => item.id === id
        );

        if (!status) {
          throw new Error('État absent.');
        }

        requireEdit(status.projectId);

        await changed(() =>
          remoteMode
            ? remote.deleteRemoteStatus(id)
            : removeStatus(db, id)
        );
      },


      setSubtask: async (id, done) => {
        const subtask = data?.subtasks.find(
          item => item.id === id
        );

        const task = data?.tasks.find(
          item => item.id === subtask?.taskId
        );

        if (!task) {
          throw new Error('Sous-tâche absente.');
        }

        requireEdit(task.projectId);

        await changed(() =>
          remoteMode
            ? remote.saveRemoteSubtask(id, done)
            : toggleSubtask(db, id, done)
        );
      },

      addSubtask: async (
        taskId,
        title
      ) => {
        const task = data?.tasks.find(
          item => item.id === taskId
        );

        if (!task) {
          throw new Error('Tâche absente.');
        }

        requireEdit(task.projectId);

        if (!title.trim()) {
          return;
        }

        await changed(() =>
          remoteMode
            ? remote.createRemoteSubtask(
                taskId,
                title
              )
            : createSubtask(
                db,
                taskId,
                title
              )
        );
      },

      addComment: async (
        taskId,
        body
      ) => {
        if (!body.trim()) {
          return;
        }

        const task = data?.tasks.find(
          item => item.id === taskId
        );

        if (!task) {
          throw new Error('Tâche absente.');
        }

        requireEdit(task.projectId);

        await changed(() =>
          remoteMode
            ? remote.createRemoteComment(
                taskId,
                body
              )
            : createComment(
                db,
                taskId,
                userId,
                body
              )
        );
      },


      readNotification: async id => {
        await changed(() =>
          remoteMode
            ? remote.readRemoteNotification(id)
            : markNotificationRead(db, id)
        );
      },


      setMemberRole: async (
        projectId,
        targetUserId,
        role
      ) => {
        if (!canManageMembers(roleFor(projectId))) {
          throw new Error(
            'Droits insuffisants.'
          );
        }

        await changed(() =>
          remoteMode
            ? remote.saveRemoteMemberRole(
                projectId,
                targetUserId,
                role
              )
            : updateProjectRole(
                db,
                projectId,
                targetUserId,
                role
              )
        );
      },
    }),
    [
      db,
      data,
      loading,
      syncError,
      reload,
      roleFor,
      userId,
      remoteMode,
    ]
  );

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
}

export function useData() {
  const ctx = useContext(Context);

  if (!ctx) {
    throw new Error('DataProvider manquant');
  }

  return ctx;
}
