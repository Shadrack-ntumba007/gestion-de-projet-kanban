# Plan de validation de la base

## Contrôles automatiques

```bash
npm install
npx expo install --check
npm run typecheck
npm test
npx expo start
```

> Les étapes d'installation, compilation TypeScript et exécution native nécessitent un environnement connecté. À la génération, l'installation npm n'a pas abouti : **aucune réussite Expo/typecheck sur appareil n'est revendiquée.**

## Contrôles manuels à consigner (Android puis iOS)

| ID | Action | Résultat attendu | État initial |
|---|---|---|---|
| M01 | Ouvrir l'application | Connexion et bouton « Explorer la démo » visibles | À vérifier |
| M02 | Entrer dans la démo | Quatre onglets visibles, liste de projets | À vérifier |
| M03 | Ouvrir un projet | Colonnes Kanban défilantes horizontalement | À vérifier |
| M04 | Créer un projet | Apparaît dans l'accueil et possède trois états | À vérifier |
| M05 | Créer une tâche | Apparaît dans le statut choisi | À vérifier |
| M06 | Ouvrir et changer son état | Déplacement logique de colonne après retour | À vérifier |
| M07 | Ajouter / cocher une sous-tâche | Progression mise à jour | À vérifier |
| M08 | Ajouter un commentaire | Historique local mis à jour | À vérifier |
| M09 | Ajouter / modifier / supprimer un état vide | État reflété dans le tableau | À vérifier |
| M10 | Tenter de supprimer un état avec tâches | Refus explicite | À vérifier |
| M11 | Inviter un membre | Avertissement clair : aucun e-mail envoyé | À vérifier |
| M12 | Quitter et relancer l'app | Données SQLite préservées | À vérifier |
| M13 | Comparer avec les neuf maquettes | Écarts visuels documentés | À vérifier |
| M14 | Tester iOS | Documenter support/safe areas et différences | À vérifier |
| M15 | Exécuter un build EAS preview | Aucune erreur de configuration | À vérifier |

Pour chaque contrôle, enregistrer date, modèle de téléphone, version Android/iOS, résultat, capture et anomalies. Une vérification TypeScript seule ne valide pas le rendu ni les interactions sur appareil.
