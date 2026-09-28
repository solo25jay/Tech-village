import { prisma } from '@database/prisma';

export const usersRepository = {
  findById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        roles: { include: { role: true } },
      },
    });
  },
};
