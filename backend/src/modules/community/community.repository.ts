import { prisma } from '@database/prisma';

export const communityRepository = {
  listForUser(userId: string) {
    return prisma.communityAccess.findMany({ where: { userId } });
  },

  upsertAccess(data: {
    userId: string;
    communityType: 'GENERAL' | 'PROFESSIONAL';
    communityPlatform: 'DISCORD' | 'TELEGRAM';
    accessUrl: string;
    status: 'ELIGIBLE' | 'GRANTED' | 'REVOKED';
  }) {
    return prisma.communityAccess.upsert({
      where: {
        userId_communityType_communityPlatform: {
          userId: data.userId,
          communityType: data.communityType,
          communityPlatform: data.communityPlatform,
        },
      },
      update: {
        accessUrl: data.accessUrl,
        status: data.status,
        grantedAt: data.status === 'GRANTED' ? new Date() : undefined,
        revokedAt: data.status === 'REVOKED' ? new Date() : undefined,
      },
      create: {
        userId: data.userId,
        communityType: data.communityType,
        communityPlatform: data.communityPlatform,
        accessUrl: data.accessUrl,
        status: data.status,
        grantedAt: data.status === 'GRANTED' ? new Date() : undefined,
      },
    });
  },

  findOrCreateProfessionalProfile(userId: string) {
    return prisma.professionalProfile.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  },

  setQualified(userId: string, isQualified: boolean) {
    return prisma.professionalProfile.upsert({
      where: { userId },
      update: { isQualified, qualifiedAt: isQualified ? new Date() : null },
      create: { userId, isQualified, qualifiedAt: isQualified ? new Date() : null },
    });
  },

  listProfessionalProfiles() {
    return prisma.professionalProfile.findMany({
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { id: 'desc' },
    });
  },
};
