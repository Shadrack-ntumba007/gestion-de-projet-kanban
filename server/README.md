# Taskify API — PostgreSQL sans Docker

API TypeScript/Node.js pour les comptes, invitations et données Kanban de plusieurs téléphones. Le téléphone n’accède **jamais directement à PostgreSQL**.

Consultez `../docs/API_POSTGRESQL_PARTAGEE.md` pour les commandes Windows, la configuration réseau et le scénario de recette. Les requêtes sont paramétrées et les autorisations vérifiées côté serveur.

Principales routes :

- `GET /health` — état de PostgreSQL
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- `GET /api/data/snapshot` — espace, projets, statuts, tâches, sous-tâches, commentaires et membres accessibles
- `POST /api/data/projects`, `PATCH /api/data/projects/:id`
- `POST /api/data/projects/:id/statuses`, `PATCH|DELETE /api/data/statuses/:id`
- `POST /api/data/tasks`, `PATCH|DELETE /api/data/tasks/:id`
- `POST /api/data/tasks/:id/subtasks`, `PATCH /api/data/subtasks/:id`
- `POST /api/data/tasks/:id/comments`, `PATCH /api/data/notifications/:id/read`
- `PATCH /api/data/projects/:id/members/:userId/role`
- `POST /api/invitations` — `{projectId,email,role}` ; `GET /api/invitations` — invitations entrantes
- `GET /api/workspaces/:id/invitations` — invitations en attente, pour responsables
- `POST /api/invitations/:id/accept` — `{code}` ; `POST /api/invitations/:id/reject`

**Limites du prototype** : les invitations donnent accès à *l’espace de travail entier*, pas seulement au projet source. Aucune invitation n’est envoyée par e-mail : un code privé est partagé manuellement. Les comptes locaux SQLite ne sont pas migrés automatiquement. Pas de pièces jointes, notifications push, récupération de mot de passe, e-mail vérifié ni synchronisation hors ligne/bidirectionnelle. L’API distante exige une connexion réseau ; SQLite reste en mode démo local distinct.

**Sécurité** : HTTPS obligatoire hors réseau local de développement ; ne jamais exposer le port PostgreSQL (5432) à Internet, ni versionner `server/.env`. Le prototype nécessite durcissement avant production (vérification des e-mails, limitation distribuée, journalisation, révocation avancée, sauvegardes, contrôles de débit plus fins). 
