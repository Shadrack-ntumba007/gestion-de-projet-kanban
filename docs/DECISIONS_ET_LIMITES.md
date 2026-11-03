# Décisions d'architecture et limites contrôlées

1. **Nom : Taskify.** Observé dans les captures. Nom technique du paquet : `gestion-de-projet-kanban` correspondant au dépôt initial.
2. **Expo + React Native + TypeScript strict.** Conforme à la demande et à la partie transférable du guide du professeur.
3. **Stockage initial : SQLite** avec repositories typés. C'est un mode démo sur un seul appareil ; les données ne se synchronisent pas.
4. **Auth** : entrée démo explicite, car aucune API ni configuration d'identité n'a été remise. Aucune validation de mot de passe côté téléphone prétendant authentifier un vrai utilisateur.
5. **Architecture modulaire** : écrans pour présentation, composants pour réutilisation, context/hooks pour l'orchestration, repositories pour SQLite, services pour les futures intégrations distantes.
6. **Navigation** : pile d'authentification, onglets principaux et pile des écrans annexes. Les feuilles Figma sont remplacées temporairement par des écrans pour stabiliser les routes.
7. **Migrations** : schéma 1 initial avec relations projets/états/tâches/membres/assignations/sous-tâches/commentaires/notifications. Augmenter `DATABASE_VERSION` et écrire des migrations idempotentes pour toute évolution.
8. **Permissions** : contrôles locaux côté UI/Context, **non sécurisants** contre un client malveillant. Un backend réel doit appliquer RBAC sur chaque requête.
9. **Maquettes** : couleur et dimensions dérivées des JPEG, pas exportées de Figma. Aucun test visuel sur téléphone fourni.
10. **Interopérabilité** : aucune dépendance, permission ou variable propre à l'immobilier ou aux cartes.
11. **Identifiants natifs et backend** : `ios.bundleIdentifier`, `android.package` et l'URL de l'API sont volontairement absents / non configurés, à fixer seulement après validation par l'équipe avant toute build publique.
12. **Tests** : logique métier testable avec le runtime Node ; compilation TypeScript/Expo à confirmer sur poste connecté après `npm install`.

## Risques / validations obligatoires avant production

| Question | Risque si non clarifiée |
|---|---|
| Qui héberge le backend et quelle API ? | Synchronisation et authentification impossibles |
| Les comptes sont-ils liés au workspace ou au projet ? | Droits et invitation incohérents |
| Quelle est la matrice exacte des droits propriétaire/admin/éditeur/lecteur ? | Fuites et suppressions non autorisées |
| Comment reconnaître un état terminé après renommage ? | Métriques erronées |
| Les tâches sont-elles multi-assignées ? | Modèles et notifications à ajuster |
| Quels événements créent notifications et historiques ? | Alertes sans fiabilité |
| Figma : liens du User Flow, interactions, bottom sheets ? | Écrans seulement approximatifs |
| Police, dark mode, appareils supportés ? | Incohérences UI iOS/Android |
| Termes, confidentialité, consentement et mot de passe ? | Inscription non publiable |
| Infrastructure pour « chiffré de bout en bout » ? | Promesse de sécurité non justifiée |

**Le système n'est pas prêt pour production.** Il ne contient ni session sûre, ni serveur, ni stockage sensible sécurisé, ni tests E2E. Aucune garantie de « temps réel » ou « chiffré de bout en bout » ne peut être faite avant implémentation et revue d'architecture.
