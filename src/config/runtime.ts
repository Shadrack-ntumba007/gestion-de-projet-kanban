/** Démarrage local explicite. Le mode distant n'est pas implémenté dans ce squelette. */
export const runtime = {
  appName: 'Taskify',
  mode: 'local-demo' as const,
  demoUserId: 'u-owner',
  workspaceId: 'w-demo',
} as const;
