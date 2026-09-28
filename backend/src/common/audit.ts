import { prisma } from '@database/prisma';

/**
 * Central audit-write function. Call this from any service after a
 * state-changing admin action. Kept deliberately dependency-free (just
 * Prisma) so every module can import it without creating a circular
 * dependency on the audit module's own service layer.
 */
export async function recordAuditLog(input: {
  actorId: string | null;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        metadata: input.metadata as any,
      },
    });
  } catch {
    // Audit logging must never break the primary action it's recording.
    // A failed write here is a monitoring gap, not a user-facing error.
  }
}
