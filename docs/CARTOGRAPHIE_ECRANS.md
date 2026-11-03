# Écrans, routes et correspondances maquettes

| Route | Fichier | Justification | Statut |
|---|---|---|---|
| `Login` | `screens/auth/LoginScreen.tsx` | Connexion.jpg | Démo locale + service réel à créer |
| `SignUp` | `screens/auth/SignUpScreen.tsx` | Inscription.jpg | Formulaire / inscription réelle non configurée |
| `ForgotPassword` | `screens/auth/ForgotPasswordScreen.tsx` | Lien de connexion | Emplacement prêt, serveur requis |
| `Terms`, `Privacy` | `screens/auth/LegalPlaceholderScreen.tsx` | Liens d'inscription | Textes juridiques à fournir |
| `Home` | `screens/home/HomeScreen.tsx` | Accueil.jpg | Vue locale initiale |
| `ProjectBoard` | `screens/projects/ProjectBoardScreen.tsx` | Tableau Kanban.jpg | Colonnes + cartes, pas de drag-and-drop |
| `NewProject` | `screens/projects/NewProjectScreen.tsx` | Bouton « + » / déduction | Formulaire local |
| `EditProject` | `screens/projects/EditProjectScreen.tsx` | Nouveau projet.jpg (mal nommé) | Formulaire local |
| `ProjectSettings` | `screens/projects/ProjectSettingsScreen.tsx` | Options de projet | Navigation locale |
| `StatusEditor` | `screens/projects/StatusEditorScreen.tsx` | Ajouter un état.jpg | CRUD statuts (pas de réordonnancement) |
| `MyTasks` | `screens/tasks/MyTasksScreen.tsx` | Onglet bas visible | Liste locale |
| `TaskDetails` | `screens/tasks/TaskDetailsScreen.tsx` | Détails de la tâche.jpg | Sous-tâches, commentaires, état |
| `NewTask`, `EditTask` | `screens/tasks/{NewTask,EditTask}Screen.tsx` | Boutons nouvelle tâche / modifier | Formulaires locaux |
| `MembersPermissions` | `screens/members/MembersPermissionsScreen.tsx` | Membres et permissions.jpg | Consultation + rôles locaux |
| `InviteMember` | `screens/members/InviteMemberScreen.tsx` | Bloc inviter | Aucun e-mail réellement envoyé |
| `Notifications` | `screens/notifications/NotificationsScreen.tsx` | Onglet bas visible | Liste notifications locales |
| `Profile` | `screens/profile/ProfileScreen.tsx` | Profil et préférences.jpg | Vue locale |
| `PersonalInfo` | `screens/profile/PersonalInfoScreen.tsx` | Ligne informations personnelles | Emplacement à finaliser |
| `Workspace` | `screens/profile/WorkspaceScreen.tsx` | Ligne espace de travail | Vue / emplacement |
| `Appearance` | `screens/profile/AppearanceScreen.tsx` | Choix Clair / Auto | Préférence enregistrée, rendu sombre incomplet |
| `StartupView` | `screens/profile/StartupViewScreen.tsx` | Vue de démarrage | À spécifier |
| `Search`, `Filters` | `screens/search/{Search,Filters}Screen.tsx` | Boutons loupe / filtres | Recherche locale + filtres à spécifier |
| `NotificationSettings` | `screens/notifications/NotificationSettingsScreen.tsx` | Paramétrage secondaire déduit | Non spécifié |

**Splash** : `screens/SplashScreen.tsx` s'affiche lors du chargement initial, selon l'approche du guide Word. Aucun splash animé précis n'était fourni parmi les neuf captures.

Les **feuilles inférieures** de modification vues dans les maquettes sont **des écrans dédiés** dans la version initiale pour conserver une navigation stable et testable. Une étape UI ultérieure pourra les afficher en modal/bottom sheet sans modifier les services ni les modèles métier.
