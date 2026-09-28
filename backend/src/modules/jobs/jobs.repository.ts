import { prisma } from '@database/prisma';

export const jobsRepository = {
  // ---- Company ----
  findCompanyByUserId(userId: string) {
    return prisma.company.findUnique({ where: { userId } });
  },

  upsertCompany(userId: string, data: { name: string; description?: string; website?: string; industry?: string }) {
    return prisma.company.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  },

  findCompanyById(id: string) {
    return prisma.company.findUnique({ where: { id } });
  },

  listAllCompanies() {
    return prisma.company.findMany({
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  // ---- Jobs ----
  listPublishedJobs() {
    return prisma.job.findMany({
      where: { isPublished: true },
      include: { company: { select: { id: true, name: true, logoUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  findJobById(id: string) {
    return prisma.job.findUnique({
      where: { id },
      include: { company: { select: { id: true, name: true, logoUrl: true, userId: true } } },
    });
  },

  listJobsForCompany(companyId: string) {
    return prisma.job.findMany({
      where: { companyId },
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  createJob(data: {
    companyId: string;
    title: string;
    description: string;
    type: string;
    location?: string;
    remote?: boolean;
    skills: string[];
  }) {
    return prisma.job.create({ data: data as any });
  },

  setJobPublished(id: string, isPublished: boolean) {
    return prisma.job.update({ where: { id }, data: { isPublished } });
  },

  // ---- Applications ----
  findApplication(jobId: string, applicantId: string) {
    return prisma.application.findUnique({ where: { jobId_applicantId: { jobId, applicantId } } });
  },

  createApplication(jobId: string, applicantId: string, coverNote?: string) {
    return prisma.application.create({ data: { jobId, applicantId, coverNote } });
  },

  listMyApplications(applicantId: string) {
    return prisma.application.findMany({
      where: { applicantId },
      include: { job: { include: { company: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  listApplicationsForJob(jobId: string) {
    return prisma.application.findMany({
      where: { jobId },
      include: { applicant: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  updateApplicationStatus(id: string, status: string) {
    return prisma.application.update({ where: { id }, data: { status: status as any } });
  },

  findApplicationById(id: string) {
    return prisma.application.findUnique({ where: { id }, include: { job: true } });
  },
};
