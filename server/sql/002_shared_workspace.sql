-- Migration additive. Le rôle d'espace de travail s'applique à tous ses projets.
ALTER TABLE projects ADD COLUMN IF NOT EXISTS icon TEXT NOT NULL DEFAULT '💻';
CREATE INDEX IF NOT EXISTS statuses_project_position_idx ON kanban_statuses(project_id,position);
CREATE INDEX IF NOT EXISTS subtasks_task_position_idx ON subtasks(task_id,position);
CREATE INDEX IF NOT EXISTS comments_task_date_idx ON task_comments(task_id,created_at);
