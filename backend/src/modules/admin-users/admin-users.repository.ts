import { prisma } from '@database/prisma';

export const adminUsersRepository = {
  listUsers(searchText?: string) {
    return prisma.user.findMany({
      where: searchText
        ? {
            OR: [
              { email: { contains: searchText, mode: 'insensitive' } },
              { firstName: { contains: searchText, mode: 'insensitive' } },
              { lastName: { contains: searchText, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: { roles: { include: { role: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  },

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } }, profile: true },
    });
  },

  setStatus(id: string, status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED') {
    return prisma.user.update({ where: { id }, data: { status } });
  },

  listRoles() {
    return prisma.role.findMany({ orderBy: { name: 'asc' } });
  },

  findRoleByName(name: string) {
    return prisma.role.findUnique({ where: { name } });
  },

  hasRole(userId: string, roleId: string) {
    return prisma.userRole.findUnique({ where: { userId_roleId: { userId, roleId } } });
  },

  assignRole(userId: string, roleId: string) {
    return prisma.userRole.create({ data: { userId, roleId } });
  },

  removeRole(userId: string, roleId: string) {
    return prisma.userRole.delete({ where: { userId_roleId: { userId, roleId } } });
  },
};
