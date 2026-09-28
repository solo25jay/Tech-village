import { prisma } from '@database/prisma';

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
    });
  },

  findUserWithRolesById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
    });
  },

  async createUser(data: { email: string; passwordHash: string; firstName: string; lastName: string }) {
    return prisma.$transaction(async (tx) => {
      const learnerRole = await tx.role.upsert({
        where: { name: 'learner' },
        update: {},
        create: { name: 'learner', description: 'Default learner role' },
      });

      const user = await tx.user.create({
        data: {
          ...data,
          profile: { create: {} },
          roles: { create: { roleId: learnerRole.id } },
        },
        include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
      });

      return user;
    });
  },

  markEmailVerified(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { emailVerifiedAt: new Date(), status: 'ACTIVE' },
    });
  },

  updatePasswordHash(userId: string, passwordHash: string) {
    return prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  },

  storeRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
    return prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } });
  },

  revokeRefreshToken(tokenHash: string) {
    return prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },
};
