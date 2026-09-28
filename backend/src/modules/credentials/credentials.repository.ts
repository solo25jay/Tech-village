import { prisma } from '@database/prisma';

export const credentialsRepository = {
  // ---- Projects (portfolio) ----
  listProjectsForUser(userId: string) {
    return prisma.project.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  },

  findProject(userId: string, projectId: string) {
    return prisma.project.findFirst({ where: { id: projectId, userId } });
  },

  createProject(data: {
    userId: string;
    name: string;
    description?: string;
    category?: string;
    technologies: string[];
    githubUrl?: string;
    liveUrl?: string;
  }) {
    return prisma.project.create({ data });
  },

  updateProject(
    projectId: string,
    data: Partial<{
      name: string;
      description: string;
      category: string;
      technologies: string[];
      githubUrl: string;
      liveUrl: string;
      completedAt: Date | null;
    }>,
  ) {
    return prisma.project.update({ where: { id: projectId }, data });
  },

  deleteProject(projectId: string) {
    return prisma.project.delete({ where: { id: projectId } });
  },

  // ---- Assessments ----
  listAssessments() {
    return prisma.assessment.findMany({ orderBy: { createdAt: 'desc' } });
  },

  findAssessment(id: string) {
    return prisma.assessment.findUnique({ where: { id } });
  },

  createAssessment(data: { title: string; type: string; passScore: number }) {
    return prisma.assessment.create({ data });
  },

  // ---- Attempts ----
  createAttempt(data: { assessmentId: string; userId: string; score: number; passed: boolean }) {
    return prisma.assessmentAttempt.create({ data });
  },

  listAttemptsForUser(userId: string) {
    return prisma.assessmentAttempt.findMany({
      where: { userId },
      include: { assessment: true },
      orderBy: { attemptedAt: 'desc' },
    });
  },

  // ---- Certificates ----
  listCertificatesForUser(userId: string) {
    return prisma.certificate.findMany({ where: { userId }, orderBy: { issueDate: 'desc' } });
  },

  createCertificate(data: {
    userId: string;
    programmeName: string;
    skills: string[];
    verificationCode: string;
  }) {
    return prisma.certificate.create({ data });
  },

  findByVerificationCode(code: string) {
    return prisma.certificate.findUnique({
      where: { verificationCode: code },
      include: { user: { select: { firstName: true, lastName: true } } },
    });
  },

  listAllCertificates() {
    return prisma.certificate.findMany({
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { issueDate: 'desc' },
    });
  },
};
