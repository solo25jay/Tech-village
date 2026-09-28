import { prisma } from '@database/prisma';

const SEGMENT_TO_ROLE: Record<string, string | null> = {
  ALL_USERS: null,
  LEARNERS: 'learner',
  MENTORS: 'mentor',
  PROFESSIONALS: 'professional',
  COMPANIES: 'company',
};

export const emailsRepository = {
  listCampaigns() {
    return prisma.emailCampaign.findMany({
      include: { createdBy: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  findCampaign(id: string) {
    return prisma.emailCampaign.findUnique({ where: { id } });
  },

  createCampaign(data: { createdById: string; subject: string; body: string; segment: string }) {
    return prisma.emailCampaign.create({ data: data as any });
  },

  updateCampaignStatus(id: string, status: 'SENDING' | 'SENT' | 'FAILED', recipientCount?: number) {
    return prisma.emailCampaign.update({
      where: { id },
      data: {
        status,
        recipientCount,
        sentAt: status === 'SENT' ? new Date() : undefined,
      },
    });
  },

  /** Resolves an EmailSegment into the list of recipient users. */
  async listUsersForSegment(segment: string) {
    const roleName = SEGMENT_TO_ROLE[segment];

    if (roleName === null) {
      // ALL_USERS
      return prisma.user.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, email: true, firstName: true },
      });
    }

    return prisma.user.findMany({
      where: { status: 'ACTIVE', roles: { some: { role: { name: roleName } } } },
      select: { id: true, email: true, firstName: true },
    });
  },
};
