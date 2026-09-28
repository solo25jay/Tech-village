import { prisma } from '@database/prisma';

export const reportsRepository = {
  countUsers() {
    return prisma.user.count();
  },

  countActiveUsers() {
    return prisma.user.count({ where: { status: 'ACTIVE' } });
  },

  countUsersWithRole(roleName: string) {
    return prisma.user.count({ where: { roles: { some: { role: { name: roleName } } } } });
  },

  countEnrollments() {
    return prisma.enrollment.count();
  },

  countCompletedEnrollments() {
    return prisma.enrollment.count({ where: { completedAt: { not: null } } });
  },

  countCertificates() {
    return prisma.certificate.count();
  },

  countActiveMentorships() {
    return prisma.mentorship.count({ where: { status: 'ACTIVE' } });
  },

  countUpcomingEvents() {
    return prisma.event.count({
      where: { status: { not: 'CANCELLED' }, startTime: { gte: new Date() } },
    });
  },

  countOpenJobs() {
    return prisma.job.count({ where: { isPublished: true } });
  },

  countApplications() {
    return prisma.application.count();
  },

  applicationsByStatus() {
    return prisma.application.groupBy({ by: ['status'], _count: { _all: true } });
  },

  countQualifiedProfessionals() {
    return prisma.professionalProfile.count({ where: { isQualified: true } });
  },

  sumRevenueKobo() {
    return prisma.payment.aggregate({ where: { status: 'SUCCESS' }, _sum: { amountKobo: true } });
  },

  /** Registration timestamps in a window, bucketed into days by the service. */
  listRegistrationDates(since: Date) {
    return prisma.user.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    });
  },
};
