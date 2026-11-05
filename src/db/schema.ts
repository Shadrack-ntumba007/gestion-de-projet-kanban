/**
 * Définition SQL versionnée de Taskify.
 * V1 reprend les tables utilisées dès l'initialisation du projet.
 * V2 étend le modèle sans recréer ni supprimer les données des téléphones déjà initialisés.
 * Ne jamais modifier V1 après publication : créer V3, V4… pour toute évolution.
 */
export const DATABASE_VERSION = 4;

export const SCHEMA_V1 = String.raw`
 CREATE TABLE IF NOT EXISTS workspaces(id TEXT PRIMARY KEY,name TEXT NOT NULL,owner_id TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL UNIQUE);
 CREATE TABLE IF NOT EXISTS projects(id TEXT PRIMARY KEY,workspace_id TEXT NOT NULL REFERENCES workspaces(id),title TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',icon TEXT NOT NULL DEFAULT '💻',priority TEXT NOT NULL DEFAULT 'medium',due_date TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS project_members(project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,user_id TEXT NOT NULL REFERENCES users(id),role TEXT NOT NULL,PRIMARY KEY(project_id,user_id));
 CREATE TABLE IF NOT EXISTS statuses(id TEXT PRIMARY KEY,project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,name TEXT NOT NULL,color TEXT NOT NULL,position INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS tasks(id TEXT PRIMARY KEY,project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,status_id TEXT NOT NULL REFERENCES statuses(id) ON DELETE RESTRICT,title TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',priority TEXT NOT NULL DEFAULT 'medium',start_date TEXT,due_date TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS task_assignees(task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,user_id TEXT NOT NULL REFERENCES users(id),PRIMARY KEY(task_id,user_id));
 CREATE TABLE IF NOT EXISTS subtasks(id TEXT PRIMARY KEY,task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,title TEXT NOT NULL,done INTEGER NOT NULL DEFAULT 0,position INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS comments(id TEXT PRIMARY KEY,task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,author_id TEXT NOT NULL REFERENCES users(id),body TEXT NOT NULL,created_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS notifications(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),title TEXT NOT NULL,body TEXT NOT NULL,created_at TEXT NOT NULL,read INTEGER NOT NULL DEFAULT 0);
 CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON tasks(project_id,status_id);
 CREATE INDEX IF NOT EXISTS idx_statuses_project_position ON statuses(project_id,position);
 CREATE INDEX IF NOT EXISTS idx_assignees_user ON task_assignees(user_id);
`;

export const SCHEMA_V2 = String.raw`
-- V2 : amélioration additive, aucune suppression de données V1.
CREATE TABLE IF NOT EXISTS task_activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('status_changed')),
  previous_status_id TEXT NOT NULL,
  next_status_id TEXT NOT NULL,
  occurred_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_activity_task_date ON task_activity(task_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_comments_task_date ON comments(task_id, created_at);
CREATE INDEX IF NOT EXISTS idx_subtasks_task_position ON subtasks(task_id, position);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read, created_at);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_workspace ON projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Garantit qu'une tâche n'utilise jamais la colonne Kanban d'un autre projet.
CREATE TRIGGER IF NOT EXISTS trg_tasks_status_same_project_insert
BEFORE INSERT ON tasks
BEGIN
  SELECT RAISE(ABORT, 'Etat Kanban hors du projet')
  WHERE NOT EXISTS (
    SELECT 1 FROM statuses WHERE id = NEW.status_id AND project_id = NEW.project_id
  );
END;
CREATE TRIGGER IF NOT EXISTS trg_tasks_status_same_project_update
BEFORE UPDATE OF status_id, project_id ON tasks
BEGIN
  SELECT RAISE(ABORT, 'Etat Kanban hors du projet')
  WHERE NOT EXISTS (
    SELECT 1 FROM statuses WHERE id = NEW.status_id AND project_id = NEW.project_id
  );
END;

-- Historise automatiquement les changements de colonne.
CREATE TRIGGER IF NOT EXISTS trg_tasks_status_activity
AFTER UPDATE OF status_id ON tasks
WHEN NEW.status_id <> OLD.status_id
BEGIN
  INSERT INTO task_activity
    (task_id, kind, previous_status_id, next_status_id, occurred_at)
  VALUES (
    NEW.id, 'status_changed', OLD.status_id, NEW.status_id,
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  );
END;
`;


/**
 * V3 : authentification de démonstration et invitations LOCALES seulement.
 * Le téléphone n'envoie aucun e-mail et ne synchronise pas les utilisateurs.
 * Les mots de passe des comptes locaux sont stockés en bcrypt (jamais en clair).
 */
export const SCHEMA_V3 = String.raw`
CREATE TABLE IF NOT EXISTS local_accounts (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS local_invitations (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  email TEXT NOT NULL COLLATE NOCASE,
  role TEXT NOT NULL CHECK (role IN ('admin','editor','viewer')),
  created_at TEXT NOT NULL,
  accepted_at TEXT,
  UNIQUE(project_id,email)
);
CREATE INDEX IF NOT EXISTS idx_local_invitations_email ON local_invitations(email,accepted_at);
CREATE INDEX IF NOT EXISTS idx_local_invitations_project ON local_invitations(project_id,accepted_at);
`;
