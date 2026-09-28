import { prisma } from '@database/prisma';

export const auditRepository = {
  list(filters: { entity?: string; actorId?: string }) {
    return prisma.auditLog.findMany({
      where: {
        entity: filters.entity,
        actorId: filters.actorId,
      },
      include: { actor: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  },
};
