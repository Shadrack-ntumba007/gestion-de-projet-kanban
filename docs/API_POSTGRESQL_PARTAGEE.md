# Taskify — API partagée PostgreSQL + SQLite locale (sans Docker ni Supabase)

## Ce qui change et ce qui ne change pas

- **Mode démo local** : SQLite (`expo-sqlite`) reste en place. Les utilisateurs/projets fictifs précédents, y compris les données du Dashboard ajoutées par Blessing, ne sont ni écrasés ni transférés.
- **Mode collaboratif** : une API Node.js/TypeScript dialogue avec PostgreSQL. En vous inscrivant/identifiant via l'API configurée, vous obtenez des projets, tâches, commentaires, états et membres **partagés entre appareils**.
- **Invitations** : le responsable choisit e-mail et rôle, l'API enregistre l'invitation. L'expéditeur transmet **manuellement un code privé** (WhatsApp, échange direct...). Le destinataire, connecté avec l'adresse invitée, voit « Invitations reçues » puis saisit le code pour accepter. Aucun e-mail automatique.
- **Périmètre des rôles** : les droits `owner`, `admin`, `editor`, `viewer` s'appliquent pour le moment **à tout l'espace de travail** (tous ses projets), pas uniquement au projet depuis lequel on invite.
- **Pas de synchronisation SQLite ↔ PostgreSQL** : les projets déjà enregistrés dans SQLite ne deviennent pas automatiquement visibles sur d'autres téléphones. Les nouveaux projets créés depuis une **session distante** sont enregistrés dans PostgreSQL.

## Installation Windows sans Docker

### 1. Brancher le correctif dans le bon dépôt

Examinez `git status -sb`. Débutez depuis la branche qui contient déjà la mise à jour SQLite locale v3 et le Dashboard de Blessing. Si SQLite v3 est fusionnée dans `main`, utilisez :

```powershell
cd "C:\Users\HP\Desktop\gestion-de-projet-kanban"
git status
git switch main
git pull --ff-only origin main
git switch -c feature/api-postgresql-partagee
```

Sinon, ne revenez pas sur une `main` trop ancienne : créez une nouvelle branche à partir de la branche qui contient SQLite v3, après avoir vérifié que le dossier est propre. Décompressez le correctif dans la racine du dépôt, sans écraser `.git`.

### 2. PostgreSQL 16 natif sur le PC serveur

Installez PostgreSQL 16 et pgAdmin ou `psql` depuis https://www.postgresql.org/download/windows/ . PostgreSQL est le seul service de base requis : **aucun Docker**.

Dans `psql` en tant que superutilisateur `postgres`, exécutez (remplacez la valeur par un mot de passe local suffisamment long ; ne la publiez pas) :

```sql
CREATE ROLE taskify_app LOGIN PASSWORD 'CHANGER_MOT_DE_PASSE';
CREATE DATABASE taskify OWNER taskify_app;
```

Le port PostgreSQL par défaut est **5432**. Le téléphone ne doit jamais se connecter à ce port.

### 3. Démarrer l’API

Dans PowerShell (depuis le dépôt) :

```powershell
cd server
Copy-Item .env.example .env
notepad .env
npm install
npm run db:migrate
npm test
npm run typecheck
npm run dev
```

Dans `server/.env`, adaptez ce qui suit :

```dotenv
DATABASE_URL=postgresql://taskify_app:CHANGER_MOT_DE_PASSE@127.0.0.1:5432/taskify
PORT=3005
HOST=0.0.0.0
NODE_ENV=development
```

Si le mot de passe contient `@`, `#`, `:`, `/`, ou `?`, encodez-le dans l'URL. Le service API doit rester en cours d'exécution. Vérifiez depuis le PC serveur dans un second terminal :

```powershell
Invoke-RestMethod http://127.0.0.1:3005/health
```

Résultat attendu : `status: ok` et `backend: postgresql`. Les migrations sont *idempotentes* et enregistrées dans `schema_migrations` (V1 et V2).

### 4. Relier le téléphone Android à l’API

Obtenez l'adresse IP du PC serveur avec `ipconfig`, dans la section de la carte **Wi-Fi** connectée. Exemple **fictif** : `192.168.1.10`. Depuis la racine du dépôt Taskify :

```powershell
cd "C:\Users\HP\Desktop\gestion-de-projet-kanban"
npx expo install expo-secure-store
notepad .env
```

Créez le `.env` racine s'il est absent, avec l'adresse réelle du PC serveur :

```dotenv
EXPO_PUBLIC_TASKIFY_API_URL=http://192.168.1.10:3005
```

Puis :

```powershell
npm run typecheck
npm test
npx expo start -c
```

**Attention** : sur le téléphone, `localhost` pointe vers le téléphone, pas vers Windows. Pour des tests locaux, mettez PC et téléphone sur le même Wi-Fi. Si le navigateur du téléphone ne peut pas ouvrir `http://IP_DU_PC:3005/health`, vérifiez le pare-feu Windows et autorisez **seulement le port API 3005**, sur le profil réseau privé. **N'ouvrez pas le port PostgreSQL 5432**.

### 5. Tester la collaboration avec Blessing et Schadrack

1. Sur ton téléphone, configure l’URL de l'API et crée un **compte distant**, puis un nouveau projet. Le projet est neuf ; le jeu de démonstration SQLite n'est pas importé.
2. Dans le projet, ouvre **Membres et permissions → Créer une invitation**. Saisis l'e-mail de Blessing et son rôle, puis partage le code privé qui apparaît.
3. Blessing configure **la même URL API** sur son appareil, s'inscrit avec **l'e-mail exact**, ouvre **Profil / Notifications → Invitations reçues**, saisit le code et accepte.
4. Le projet apparaît alors chez Blessing. Il peut créer une tâche s'il est Éditeur. Tu verras la tâche après actualisation (automatique toutes les ~20 secondes en mode connecté).
5. Recommence avec Schadrack. Vérifie également qu'un membre Lecteur ne peut ni modifier ni supprimer de tâches.

Les invitations reçues ne sont pas des notifications push : il faut ouvrir l'écran prévu et être connecté au serveur. Le code d'invitation ne peut pas être retrouvé après sa première création ; en cas de perte il faudra gérer/recréer une invitation dans une version ultérieure.

## Plusieurs villes ou réseaux distincts

Avec l'API installée sur un simple PC Windows, les appareils ne se voient **que si l'API est joignable**. Pour partager depuis des réseaux distants, il faut héberger **la même API** sur un serveur accessible publiquement avec **HTTPS**, et y héberger PostgreSQL sur un réseau privé. Il ne faut pas créer trois PostgreSQL indépendants sur trois ordinateurs : ils ne partageraient aucune donnée.

La configuration en HTTP sur le Wi-Fi est exclusivement destinée aux tests locaux. Avant toute publication, HTTPS, vérification des e-mails, récupération de mot de passe, durcissement des jetons/limites de connexion et sauvegardes doivent être finalisés.

## Contrat de données et limites

- `src/config/api.ts` — URL et jeton dans `expo-secure-store`.
- `src/context/AuthContext.tsx` — sélection du mode distant si l'URL est configurée ; bouton « Explorer la démo locale » toujours possible.
- `src/context/DataContext.tsx` — source distante dans le mode collaboratif, SQLite en mode local ; aucune fusion silencieuse.
- `src/services/remoteDataService.ts` — opérations Kanban distantes.
- `src/screens/members/InvitationsInboxScreen.tsx` — réception/validation des invitations.
- `server/sql/001_init.sql`, `server/sql/002_shared_workspace.sql` — schéma et évolution additive.

Fonctions **non comprises** : pièces jointes, affectation manuelle des tâches, push notifications, envoi d'e-mail, mot de passe oublié, vérification d'adresse e-mail, synchronisation des changements hors ligne et transfert des projets SQLite antérieurs. La création de tâche assigne actuellement son créateur par défaut.

## GitLab

Après les vérifications : `git add src server docs/API_POSTGRESQL_PARTAGEE.md`, `git diff --cached --check`, `git commit -m "feat: api collaborative PostgreSQL sans Docker"`, puis `git push -u origin feature/api-postgresql-partagee`. Créez une Merge Request vers la branche contenant déjà SQLite v3 ; si SQLite v3 est dans `main`, ciblez `main`.
