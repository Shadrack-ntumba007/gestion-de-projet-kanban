
import type { KanbanStatus } from '../types/models';

export type WorkflowResult = {
  allowed: boolean;
  message?: string;
};

export function validateKanbanTransition(
  statuses: KanbanStatus[],
  fromStatusId: string,
  toStatusId: string
): WorkflowResult {
  const ordered = [...statuses].sort(
    (a, b) => a.position - b.position
  );

  const fromIndex = ordered.findIndex(
    status => status.id === fromStatusId
  );

  const toIndex = ordered.findIndex(
    status => status.id === toStatusId
  );

  if (fromIndex < 0 || toIndex < 0) {
    return {
      allowed: false,
      message: 'État Kanban introuvable.',
    };
  }

  // Réorganiser une carte dans la même colonne
  // ne constitue pas un changement d'état.
  if (fromIndex === toIndex) {
    return { allowed: true };
  }

  // Une seule étape à la fois, en avant ou en arrière.
  if (Math.abs(toIndex - fromIndex) === 1) {
    return { allowed: true };
  }

  const nextStatus =
    ordered[fromIndex + (toIndex > fromIndex ? 1 : -1)];

  return {
    allowed: false,
    message:
      `Transition interdite. Vous devez d'abord ` +
      `passer par « ${nextStatus.name} ».`,
  };
}
