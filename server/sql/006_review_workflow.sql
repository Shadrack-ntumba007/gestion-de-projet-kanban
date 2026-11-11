-- Taskify KANBAN-05 : insérer l'étape "À valider" avant "Terminé".
-- Migration additive, idempotente, compatible avec les projets existants.
-- Exécution par server/src/migrate.ts dans une transaction PostgreSQL.

DO $$
DECLARE
  v_project RECORD;
  v_done_position INTEGER;
  v_shift RECORD;
BEGIN
  FOR v_project IN SELECT id FROM projects ORDER BY id LOOP
    -- Ne jamais créer deux colonnes "À valider" dans le même projet.
    IF EXISTS (
      SELECT 1
      FROM kanban_statuses
      WHERE project_id = v_project.id
        AND lower(btrim(name)) IN ('à valider', 'a valider')
    ) THEN
      CONTINUE;
    END IF;

    -- Ne pas modifier les projets dont les états ont été personnalisés
    -- au point de ne plus posséder les étapes attendues.
    IF NOT EXISTS (
      SELECT 1
      FROM kanban_statuses
      WHERE project_id = v_project.id
        AND lower(btrim(name)) = 'en cours'
    ) THEN
      RAISE NOTICE 'Projet % ignoré : état En cours absent', v_project.id;
      CONTINUE;
    END IF;

    SELECT position INTO v_done_position
    FROM kanban_statuses
    WHERE project_id = v_project.id
      AND lower(btrim(name)) IN ('terminé', 'termine')
    ORDER BY position ASC, id ASC
    LIMIT 1;

    IF v_done_position IS NULL THEN
      RAISE NOTICE 'Projet % ignoré : état Terminé absent', v_project.id;
      CONTINUE;
    END IF;

    -- Décaler de la droite vers la gauche pour éviter les conflits
    -- sur une éventuelle contrainte UNIQUE(project_id, position).
    FOR v_shift IN
      SELECT id
      FROM kanban_statuses
      WHERE project_id = v_project.id
        AND position >= v_done_position
      ORDER BY position DESC, id DESC
    LOOP
      UPDATE kanban_statuses
      SET position = position + 1
      WHERE id = v_shift.id;
    END LOOP;

    INSERT INTO kanban_statuses(project_id, name, color, position)
    VALUES (v_project.id, 'À valider', '#FDE68A', v_done_position);

    RAISE NOTICE 'Projet % : À valider ajouté avant Terminé', v_project.id;
  END LOOP;
END $$;
