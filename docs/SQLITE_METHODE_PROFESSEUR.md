# Taskify — Base SQLite locale (méthode du professeur)

## Référence et limites
Adaptation de la Partie B / étapes 6 et 7 du guide Word Appart Finder. Le document d'origine : `expo-sqlite`, `SQLiteProvider`, `PRAGMA user_version`, tables SQL, seed, opérations de lecture/écriture, contexte React et session simulée.

Cette version s'applique à **Taskify**, sans code immobilier, sans Postgres, Docker ou Supabase.

- Schéma V1 : workspaces, users, projects, members, statuses, tasks, subtasks, comments, notifications.
- V2 : index, garde-fous Kanban et historique des mouvements.
- V3 : `local_accounts` et `local_invitations`. Elle est **additive** : aucune table V1/V2 supprimée.
- SQLite se trouve sur chaque téléphone. Aucune donnée ni invitation n'est partagée entre appareils.
- Les mots de passe des *comptes locaux de démonstration* sont hachés avec bcryptjs, mais **ce n'est pas une authentification distante ni une architecture de sécurité de production**.
- Le compte de démonstration `demo@taskify.local / 12345678` est volontairement public et non sécurisé. Il ouvre l'utilisateur fictif déjà présent dans la base. Ne jamais utiliser ce compte pour de vraies données.
- Une invitation à un utilisateur déjà connu de **la même base** ajoute son rôle au projet. Si l'utilisateur n'existe pas encore, une invitation locale en attente est créée : elle sera appliquée quand cet e-mail créera un compte *sur le même téléphone*.
- La récupération du mot de passe, les notifications e-mail, les invitations cross-device, le SSO Google/Apple et la synchronisation restent hors de portée de SQLite seul.

## Dépendances supplémentaires

Depuis la racine du dépôt :

```powershell
npx expo install expo-crypto
npm install bcryptjs
npm run typecheck
npm test
npx expo start -c
```

Ne copiez **pas** un `package-lock.json` venant d'une autre machine : les installations mettent à jour le manifeste et le lockfile de votre dépôt.

## Migration et vérifications

Le démarrage via `SQLiteProvider` appelle `migrateDbIfNeeded` dans `src/db/database.ts`. La version du schéma doit devenir 3 :

```sql
PRAGMA user_version;
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
SELECT id, name, email FROM users;
SELECT id, project_id, email, role, accepted_at FROM local_invitations;
```

Ne désinstallez pas Expo Go pour vérifier la migration : elle préserve les données existantes. Ne supprimez pas la base. Pour tester l'inscription, créez une adresse fictive que vous contrôlez (aucun e-mail n'est envoyé).

## Scénario manuel

1. Se connecter en mode démo et consulter les projets du Dashboard.
2. Se déconnecter, créer un compte local avec une adresse de test et un mot de passe de test ; vérifier le nom affiché.
3. Se déconnecter et se reconnecter avec ce compte.
4. Revenir en mode démo, ouvrir un projet, inviter l'adresse du compte local : elle devient membre sur le même appareil.
5. Inviter une adresse non inscrite : elle figure dans les invitations en attente ; après inscription locale avec cette adresse, le rôle est attribué.
6. Relancer l'application et vérifier que les données restent présentes.

Note : un compte local nouvellement inscrit n'a pas automatiquement accès en écriture aux projets de démonstration tant qu'il n'y est pas membre. Il peut créer ses propres projets.

## Git et contribution de Blessing

La mise à jour ne contient pas `src/data/demoData.ts` : le contenu apporté par Blessing reste intact. Appliquez-la sur une branche créée **après récupération de `main`**.
