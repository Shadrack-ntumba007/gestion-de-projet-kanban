-- PostgreSQL 16 : modèle relationnel Taskify (authentification, équipe, Kanban).
-- Exécuté en transaction par src/migrate.ts. Ne pas lancer ce fichier dans SQLite.
CREATE TABLE IF NOT EXISTS app_users (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 full_name TEXT NOT NULL CHECK (char_length(btrim(full_name)) BETWEEN 2 AND 120),
 email TEXT NOT NULL,
 password_hash TEXT NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_ci ON app_users (lower(email));

CREATE TABLE IF NOT EXISTS auth_sessions (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
 token_hash TEXT NOT NULL UNIQUE,
 expires_at TIMESTAMPTZ NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS auth_sessions_user_idx ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS auth_sessions_exp_idx ON auth_sessions(expires_at);

CREATE TABLE IF NOT EXISTS workspaces (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 name TEXT NOT NULL CHECK (char_length(btrim(name)) BETWEEN 2 AND 160),
 owner_id UUID NOT NULL REFERENCES app_users(id),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS workspace_members (
 workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
 user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
 role TEXT NOT NULL CHECK (role IN ('owner','admin','editor','viewer')),
 joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY (workspace_id, user_id)
);
CREATE INDEX IF NOT EXISTS workspace_members_user_idx ON workspace_members(user_id);

CREATE TABLE IF NOT EXISTS projects (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
 title TEXT NOT NULL,
 description TEXT NOT NULL DEFAULT '',
 priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
 due_date DATE,
 created_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS projects_workspace_idx ON projects(workspace_id);
CREATE TABLE IF NOT EXISTS kanban_statuses (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 name TEXT NOT NULL,
 color TEXT NOT NULL DEFAULT '#D4E9E7',
 position INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS statuses_project_id_idx ON kanban_statuses(project_id,id);
CREATE TABLE IF NOT EXISTS tasks (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 status_id UUID NOT NULL,
 title TEXT NOT NULL,
 description TEXT NOT NULL DEFAULT '',
 priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
 start_date DATE,
 due_date DATE,
 created_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 CONSTRAINT task_status_same_project FOREIGN KEY (project_id,status_id) REFERENCES kanban_statuses(project_id,id)
);
CREATE INDEX IF NOT EXISTS tasks_project_idx ON tasks(project_id);
CREATE TABLE IF NOT EXISTS task_assignees (
 task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
 user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
 PRIMARY KEY (task_id,user_id)
);
CREATE TABLE IF NOT EXISTS subtasks (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
 title TEXT NOT NULL,
 done BOOLEAN NOT NULL DEFAULT false,
 position INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS task_comments (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
 author_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
 body TEXT NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS notifications (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
 title TEXT NOT NULL,
 body TEXT NOT NULL,
 is_read BOOLEAN NOT NULL DEFAULT false,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invitation au workspace. Pas d'e-mail sortant : réception dans Taskify après connexion.
CREATE TABLE IF NOT EXISTS workspace_invitations (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
 invited_email TEXT NOT NULL,
 role TEXT NOT NULL CHECK (role IN ('admin','editor','viewer')),
 invited_by UUID NOT NULL REFERENCES app_users(id),
 invite_code_hash TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','cancelled')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 answered_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS invitations_one_pending_idx
 ON workspace_invitations(workspace_id,lower(invited_email)) WHERE status='pending';
CREATE INDEX IF NOT EXISTS invitations_recipient_idx ON workspace_invitations(lower(invited_email),status);
