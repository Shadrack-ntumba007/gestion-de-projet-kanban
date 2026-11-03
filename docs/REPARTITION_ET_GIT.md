# Répartition de l'équipe et règles GitLab

## Périmètres suggérés (répartition à valider par les membres)

| Lot | Dossiers principaux | Écrans principaux | Dépendance |
|---|---|---|---|
| Authentification & profil | `screens/auth`, `screens/profile`, `context/AuthContext`, `services/authService` | Connexion, inscription, profil, préférences | Contrat API |
| Accueil & projets | `screens/home`, `screens/projects`, `components/projects` | Accueil, création / modification, Kanban | Modèles Project/Status |
| Tâches & collaboration | `screens/tasks`, `screens/members`, `screens/notifications`, `components/tasks` | Fiches tâches, sous-tâches, membres, notifications | Modèles Task/Member |
| Intégration & qualité (rotatif) | `navigation`, `types`, `db`, tests, CI et docs | Enchaînement général | Revue collective |

**Attention** : les fichiers partagés `App.tsx`, `src/types`, `src/navigation`, `src/db/database.ts`, `package.json` ne doivent pas être modifiés en parallèle sans coordination ; une MR transversale peut être confiée à une personne.

## Procédure Git (PowerShell)

```powershell
git switch main
git pull --ff-only origin main
git switch -c feature/projets-ecran-kanban
# Modifier seulement votre lot
npm run typecheck
npm test
git add .
git commit -m "feat(kanban): implementer les colonnes du tableau"
git push -u origin feature/projets-ecran-kanban
```

Créer ensuite une **Merge Request** vers `main`, demander une revue, joindre captures Android/iOS et renseigner `.gitlab/merge_request_templates/Fonctionnalite.md`. Ne jamais copier directement une branche personnelle sur `main` sans revue. Exiger au minimum les contrôles automatisés, puis une vérification manuelle du rendu.

## Convention recommandée

`feature/`, `fix/`, `test/`, `docs/`, `chore/`. Commits `feat(module): ...`, `fix(module): ...`, `test(module): ...`. Une MR = un sujet cohérent. En cas de conflit, réintégrer `main` dans sa branche puis rejouer les tests. Exclure toujours `node_modules`, secrets, `.env`, captures privées non validées et caches Expo.

## Séquence de réalisation

1. Valider source Figma, la maquette complète et le contrat des données.
2. Finaliser les fonctionnalités locales et la recette visuelle Android/iOS ; décider des modules réellement inclus dans le MVP.
3. Spécifier et intégrer backend (auth, droits, projets et tâches partagés), tests serveur et notifications.
4. Confirmer l'identité native, développer le dark mode, les bottom sheets et les interactions de déplacement.
5. Exécuter la recette de bout en bout avant EAS Build.
