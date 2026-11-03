# Taskify — Base Expo + TypeScript (gestion de projet Kanban)

> **Version initiale 0.1.0 — démonstration locale, destinée au travail en équipe.**
>
> Les neuf maquettes et le document de cours Appart Finder ont été analysés. Le parcours Figma connecté **n'a pas pu être consulté** : les points non vérifiables sont distingués dans `docs/DECISIONS_ET_LIMITES.md`.

## Installation (Windows / PowerShell)

Prérequis : Node.js compatible avec Expo SDK 58 (le guide remis recommande Node.js 26), npm, Git, Expo Go sur Android/iPhone.

```powershell
cd "C:/Users/HP/Desktop/gestion-de-projet-kanban"
npm install
npx expo install --check
npm run typecheck
npm test
npx expo start -c
```

Vous pouvez remplacer le chemin par le dossier où vous avez extrait le ZIP. Pour tester Android, scannez le QR avec Expo Go, ou utilisez `npm run android` si un émulateur est configuré. Pour iOS sous Windows, testez sur un **iPhone physique** équipé d'Expo Go ; le simulateur iOS nécessite macOS.

**Attention Expo SDK 58 :** un écart de version `react-native` dans `expo-doctor` a été signalé autour de SDK 58.0.21. Vérifiez les dépendances avec `npx expo install --check` ; n’exécutez `npx expo install --fix` qu’après avoir examiné les modifications proposées et validé leur compatibilité.

**Important :** `node_modules` et `package-lock.json` ne sont pas fournis dans ce ZIP : ils doivent être générés lors de la première installation. Le fonctionnement sur un téléphone n'a pas été validé dans l'environnement de génération.

## Démarrer la démo

1. Au lancement, l'écran Connexion affiche les champs de la maquette.
2. Touchez **« Explorer la démo locale »** : aucun compte réel, mot de passe ni serveur n'est nécessaire.
3. Depuis Accueil, ouvrez un projet, modifiez les états, créez une tâche et ajoutez des sous-tâches ou des commentaires.
4. Quittez puis relancez l'application : les modifications de la base SQLite devraient être conservées.

Les données de démonstration (noms et projets provenant des captures) sont **fictives et locales**. Elles sont initialisées une seule fois sur un stockage neuf. Ce projet ne stocke aucun mot de passe utilisateur.

## Organisation

- `App.tsx` : providers (Safe Area, SQLite, session démo, préférences, données) et navigation.
- `src/navigation` : navigation authentification / application / onglets et paramètres typés.
- `src/screens` : une entrée par écran identifié ou nécessaire au parcours (voir `docs/CARTOGRAPHIE_ECRANS.md`).
- `src/components` : boutons, champs, cartes de projets, cartes de tâches, badges, avatars.
- `src/context` et `src/hooks` : état partagé et accès ergonomique aux données.
- `src/db` : migration SQLite + repositories séparés des vues.
- `src/types` : modèles métiers, rôles, contrats de navigation.
- `src/constants` : identité visuelle / tokens.
- `src/config` : configuration locale.
- `src/services` : frontières vers les futurs services distants (non opérationnels).
- `src/utils` : validation, dates, métriques, permissions locales.
- `src/assets` : emplacements pour les ressources UI ; `assets/` contient les visuels nécessaires à Expo.
- `docs` : maquettes source, analyse, parcours, décisions, plan de répartition et recette.
- `tests` : tests de logique métier sans dépendances React Native.

## Ce qui fonctionne dans la base locale

- Navigation : connexion démo → onglets Accueil / Mes tâches / Notifications / Profil → pages détaillées.
- SQLite : projets, états, tâches, sous-tâches, commentaires et notifications de démonstration.
- Création/modification de projets ; création/modification/suppression de tâches ; ajout/modification/suppression d'états **sans tâches associées**.
- Changement du statut d'une tâche, suivi de sous-tâches, ajout de commentaires locaux.
- Recherche locale projets/tâches ; indication de progression et filtre Mes tâches.
- Affichage des membres de démonstration et modification locale de leur rôle par le propriétaire.
- Préférence de thème stockée localement (le thème sombre appliqué à toute l'interface n'est pas encore développé).

## Ce qui ne fonctionne **pas** encore

Aucune inscription/connexion réelle, OAuth Google/Apple, récupération de mot de passe, invitation e-mail, collaboration multicomptes, synchronisation serveur, push, chiffrement de bout en bout, pièces jointes ni glisser-déposer Kanban. Ces capacités nécessitent des décisions et/ou un backend. Les écrans correspondants sont présents lorsque nécessaires, avec des avertissements explicites. **Ne pas considérer cette démo comme prête pour la production.**

## Ordre de travail et discipline Git

Lire `docs/REPARTITION_ET_GIT.md` avant toute contribution. Une branche par fonction, modification strictement limitée à son module, vérifications TypeScript + tests + recette Android et revue de Merge Request. Ne pas intégrer de bibliothèque de cartes/GPS ou de code Appart Finder.

## Sources prises en compte

- Neuf images dans `docs/maquettes` : photos de l'interface Taskify transmises par l'équipe.
- Document Word « Programmation mobile — Appart Finder — Guide pas à pas » (61 pages), **adapté structurellement**, jamais copié comme logique métier.
- Lien Figma partagé dans la discussion : `https://www.figma.com/design/wEokrdnV3m3GOHgaKIX184/Untitled?node-id=1-2059` (lecture du prototype non vérifiée, accès restreint ou impossible via l'outil de consultation).
