# Taskify — Base de données locale SQLite (v2)

## Référence pédagogique
Le guide Appart Finder du professeur (étape 6, pages 15–17) recommande de séparer le SQL des écrans, de versionner les migrations avec `PRAGMA user_version`, d'amorcer une base vide une seule fois, puis d'exposer des fonctions typées. Taskify conserve cette démarche, sans les données immobilières.

## Démarrage automatique

- `App.tsx` instancie `SQLiteProvider` avec `databaseName={DATABASE_NAME}` et `onInit={migrateDbIfNeeded}`.
- `src/db/database.ts` ouvre et fait évoluer la base `taskify-local.db` lors du démarrage ; aucune commande SQL manuelle n'est requise sur Android ou iOS.
- `src/db/schema.ts` contient les DDL V1 et V2 ; il ne faut **jamais modifier rétroactivement V1** une fois diffusée.
- `src/data/demoData.ts` contient les données locales insérées **uniquement lors de l'initialisation V1 d'une base vide**.
- `src/db/repositories/` isole la lecture et les modifications métier. `src/context/DataContext.tsx` recharge les données après chaque opération.

## Tables et relations

| Table | Relation clé |
|---|---|
| `workspaces` | espace de travail et identifiant du propriétaire |
| `users` | utilisateurs de démonstration |
| `projects` | `workspace_id` → `workspaces.id` |
| `project_members` | `project_id` → `projects.id`, `user_id` → `users.id` |
| `statuses` | `project_id` → `projects.id` |
| `tasks` | `project_id` → `projects.id`, `status_id` → `statuses.id` |
| `task_assignees` | `task_id` → `tasks.id`, `user_id` → `users.id` |
| `subtasks` | `task_id` → `tasks.id` |
| `comments` | `task_id` → `tasks.id`, `author_id` → `users.id` |
| `notifications` | `user_id` → `users.id` |
| `task_activity` (v2) | `task_id` → `tasks.id`; journal local des transitions de statut |

### V2 — migration additive

1. Création de `task_activity` pour mémoriser les passages d'un état à un autre.
2. Index pour recherche par projet, ordre des sous-tâches, commentaires et notifications.
3. Triggers empêchant l'assignation d'une tâche à un état d'un autre projet.
4. Trigger consignant les changements de statut dans `task_activity`.

**Les tables et données de V1 restent intactes.** Sur une installation existante, seule V2 est appliquée. Sur un téléphone neuf, V1 crée et peuple la base, puis V2 s'applique. `PRAGMA user_version` vaut alors `2`.

## Vérifier sur Android/iOS avec Expo Go

1. Dans PowerShell : `npm ci`, puis `npm run typecheck` et `npm test`.
2. Démarrer `npx expo start -c`, lancer l'app via Expo Go.
3. Dans l'application : créer un projet, ajouter une tâche, la déplacer vers une autre colonne.
4. Fermer totalement l'app et la rouvrir : les modifications doivent être conservées.
5. En développement, utiliser l'inspecteur SQLite des outils Expo/Metro si disponible pour lire les données.

Requêtes SQL utiles dans l'inspecteur :

```sql
PRAGMA user_version;
PRAGMA foreign_key_check;
SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;
SELECT id, title FROM projects ORDER BY created_at;
SELECT id, title, project_id, status_id FROM tasks ORDER BY created_at;
SELECT task_id, previous_status_id, next_status_id, occurred_at
FROM task_activity ORDER BY id DESC;
```

## Précautions

- **Ne pas désinstaller l'app pour tester les migrations :** cela pourrait effacer les données SQLite locales. Faire une sauvegarde de la base de test avant toute manipulation destructive.
- Les données sont **sur un téléphone uniquement**. `git pull` télécharge le code, **pas les tâches** déjà saisies sur un autre appareil.
- Ne jamais enregistrer de mot de passe en clair dans SQLite. L'authentification, la synchronisation distante, les invitations et les permissions sécurisées restent à développer côté backend.
- Les triggers V2 suivent uniquement les changements d'état ; l'affichage de cet historique dans les écrans et l'identification de l'auteur ne sont pas encore réalisés.
- `npm test` vérifie le schéma avec le module Node `node:sqlite` ; ce n'est pas un test Android/iOS et ne remplace pas les essais Expo Go.

## Prochaine évolution

Ajouter une migration `SCHEMA_V3`, l'exécuter uniquement si `currentVersion === 2`, puis augmenter `DATABASE_VERSION` à `3`. Ne pas effacer ni renommer les tables existantes.
