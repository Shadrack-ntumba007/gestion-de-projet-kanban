# User Flow reconstruit à partir des captures (non vérifié dans le prototype Figma)

```text
Démarrage → Connexion ───→ [Démo locale] → Accueil
                ├─→ Inscription → Conditions / Confidentialité
                └─→ Mot de passe oublié (serveur à définir)

Accueil → Projet → Tableau Kanban
   │                   ├─→ Carte tâche → Détail tâche → Modifier / sous-tâches / activité
   │                   ├─→ Nouvelle tâche
   │                   ├─→ Ajouter / modifier / supprimer un état
   │                   ├─→ Membres & permissions → Inviter un membre (non connecté)
   │                   └─→ Paramètres projet → Modifier le projet
   ├─→ Nouveau projet
   └─→ Recherche / Filtres

Barre d'onglets : Accueil | Mes tâches | Notifications | Profil
Mes tâches → Détail tâche
Notifications → Éléments locaux (lien vers détails si applicable)
Profil → Informations personnelles / Espace de travail / Thème / Vue de démarrage / Déconnexion
```

## Interactions visibles, comportement local

- Ouvrir un projet, faire défiler les colonnes horizontalement, ouvrir la fiche d'une tâche.
- Créer, renommer et supprimer un état si aucune tâche n'y est attachée ; couleur et aperçu.
- Ajouter une tâche à un état ; modifier le statut, la priorité, le texte et l'échéance.
- Cocher les sous-tâches, constater la progression calculée ; commenter en mode local.
- Accéder aux membres, aux rôles et aux invitations (envoi réel désactivé).

## Interactions non démontrées ou restant à confirmer

- Tri précis, filtres multi-critères, choix de vue Kanban vs autres, réordonnancement tactile, glisser entre colonnes, pièces jointes, mentions, avatars, partage système, push, authentification et synchronisation.
- Attribution et retrait des responsables à une tâche ; politique RBAC complète ; autorisation de « quitter le projet » pour le propriétaire.
- Modèle multi-workspaces, abonnement « Pro Équipe », financement, badges et métrique de succès.
