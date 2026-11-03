# Analyse croisée des sources

## Inventaire vérifié

**ZIP** : neuf images JPEG (un écran d'inscription, un écran de connexion, l'accueil, le Kanban, la gestion des états, les détails de tâche, les membres, le profil, et une modification de projet). Les fichiers de référence sont inclus dans `docs/maquettes` pour faciliter les comparaisons de l'équipe.

**Guide Word** : 61 pages, 22 étapes, structurées en préparation (Expo/TS), fondations (types, thème, SQLite, contexts), écrans, intégration et livraison (tests/EAS). Le guide décrit également des données immobilières, des favoris et de la géolocalisation qui **ne font pas partie de Taskify**.

**Lien Figma** : le lien transmis pointe vers un design « Untitled » et un nœud particulier. L'accès direct n'a pas permis d'inspecter les nœuds ni les connexions du User Flow ; aucune transition invisible n'est présentée comme vérifiée.

## Ce qui est conservé du guide Word

- `App.tsx`, le démarrage avec Expo, configuration `app.json`, `eas.json`, `babel.config.js` et TS strict.
- Écrans React Native distincts, composants UI partagés, modules typés, `SafeAreaProvider`, React Navigation.
- SQLite locale versionnée ; toute opération SQL isolée dans `src/db/repositories` ; seeding initial à l'installation, pas à chaque lancement.
- Contexts et hooks pour session, données et préférences ; tests indépendants pour logique métier ; EAS et recette Android/iOS.

## Ce qui n'est **pas** repris

- `Apartment`, `ApartmentCard`, `ApartmentMap`, annonces, carte, villes, prix, localisation/GPS, coordonnées, favoris d'appartements, itinéraires, permissions `expo-location`, clés Google Maps et `react-native-maps`.
- Authentification de démonstration à e-mail/mot de passe codés en dur : le bouton « Explorer la démo » est isolé d'une authentification réelle.

## Design system observé (approximation à valider avec Figma)

- Fond presque blanc rosé `#FBF8F8`; surfaces blanches ; panneau neutre `#F3F0F0`.
- Accent violet/indigo de référence `#5956EF`; lavande `#E5DEFF`, menthe `#D4E9E7`, rose pastel `#FFDDDA`.
- Hiérarchie typographique sombre avec labels gris violacés ; titres grands / graisse forte, sous-titres moyens.
- Cartes larges arrondies (~18-34 px selon usage), boutons pilules, champs arrondis, icônes linéaires ; espacements usuels de 8, 12, 16, 24 et 32 px.
- Navigation inférieure à quatre onglets ; tableau Kanban à colonnes horizontales ; feuilles inférieures (« bottom sheets ») pour éditions.

**Réserve importante** : ces tokens sont déduits des **captures raster**, pas exportés du fichier Figma. Les polices exactes, l'espacement au pixel, les états pressés, les animations et les effets natifs exigent la validation du design source. Le squelette favorise l'architecture et un rendu approchant, sans revendiquer une reproduction pixel-perfect.

## Constatations produit

- Le Kanban permet des états propres à chaque projet ; les tâches appartiennent à un projet et à un état.
- Une tâche peut avoir une priorité, une date d'échéance, des responsables, des sous-tâches et une activité/commentaires.
- Le projet affiche membres, pourcentage de progression, recherche, filtres, tri et création de tâche.
- Les permissions sont présentées à l'échelle du projet (propriétaire, admin, éditeur, lecteur) ; les règles précises doivent être confirmées.
- Profil : utilisateur, workspace, préférences de thème, vue de démarrage et déconnexion.

## Incohérences / ambiguïtés repérées

- Le JPEG nommé `Nouveau projet.jpg` représente en fait la feuille **« Modifier le projet »** ; l'écran « Nouveau projet » est déduit par le bouton d'ajout et la symétrie des fonctions, pas illustré en détail.
- Le texte « Espace de travail synchronisé / Chiffré de bout en bout » du login n'est **pas** une preuve qu'une infrastructure de sync ou de cryptographie existe.
- Le statut « Pro Équipe », les nombres affichés (98%, 18 tâches, 5 membres) et « Sprint actif Q3 » sont des valeurs de présentation, pas des règles de calcul spécifiées.
- Le nom et l'ordre des statuts sont personnalisables ; la maquette n'impose pas un ensemble figé ni une méthode de calcul du progrès. La démo prend un critère **temporaire** fondé sur le libellé « Terminé ».
- Le tableau montre une réorganisation par glisser-déposer ; le comportement exact du déplacement inter-colonnes, de l'archivage et des notifications reste à spécifier.
- Le prototype ne permet pas de confirmer si le projet a un « propriétaire » distinct du propriétaire du workspace, ni les droits précis sur suppression/quitter et promotion des membres.
