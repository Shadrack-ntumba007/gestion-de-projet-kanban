-- Empêche une modification concurrente des colonnes pendant la migration.
LOCK TABLE kanban_statuses IN SHARE ROW EXCLUSIVE MODE;

WITH standard_projects AS (
    SELECT project_id
    FROM kanban_statuses
    GROUP BY project_id
    HAVING COUNT(*) = 3
       AND COUNT(*) FILTER (WHERE position = 0 AND name = 'À faire') = 1
       AND COUNT(*) FILTER (WHERE position = 1 AND name = 'En cours') = 1
       AND COUNT(*) FILTER (WHERE position = 2 AND name = 'Terminé') = 1
),
shifted AS (
    UPDATE kanban_statuses AS s
    SET position = 3
    FROM standard_projects AS p
    WHERE s.project_id = p.project_id
      AND s.position = 2
      AND s.name = 'Terminé'
    RETURNING s.project_id
)
INSERT INTO kanban_statuses (project_id, name, color, position)
SELECT project_id, 'À valider', '#FFF0C2', 2
FROM shifted;
