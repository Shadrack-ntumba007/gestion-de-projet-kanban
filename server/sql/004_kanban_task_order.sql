-- KANBAN-03 : stockage additif de l'ordre des taches dans chaque colonne.
-- Ne supprime ni table, ni projet, ni tache, ni utilisateur.
CREATE TABLE IF NOT EXISTS task_kanban_order (
  task_id UUID PRIMARY KEY REFERENCES tasks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0 CHECK (position >= 0)
);
CREATE INDEX IF NOT EXISTS idx_task_kanban_order_position
  ON task_kanban_order(position);
