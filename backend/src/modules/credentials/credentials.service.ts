import crypto from 'crypto';
import { ApiError } from '@common/ApiError';
import { credentialsRepository } from './credentials.repository';
import { createEmailProvider } from '@integrations/email/emailProviderFactory';
import { prisma } from '@database/prisma';

const emailProvider = createEmailProvider();

function generateVerificationCode() {
  return `TV-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
}

export const credentialsService = {
  // ---- Projects ----
  listMyProjects(userId: string) {
    return credentialsRepository.listProjectsForUser(userId);
  },

  createProject(
    userId: string,
    input: {
      name: string;
      description?: string;
      category?: string;
      technologies?: string[];
      githubUrl?: string;
      liveUrl?: string;
    },
  ) {
    return credentialsRepository.createProject({
      userId,
      name: input.name,
      description: input.description,
      category: input.category,
      technologies: input.technologies ?? [],
      githubUrl: input.githubUrl,
      liveUrl: input.liveUrl,
    });
  },

  async updateProject(userId: string, projectId: string, input: Record<string, unknown>) {
    const project = await credentialsRepository.findProject(userId, projectId);
    if (!project) throw ApiError.notFound('Project not found');
    return credentialsRepository.updateProject(projectId, input as any);
  },

  async markProjectCompleted(userId: string, projectId: string) {
    const project = await credentialsRepository.findProject(userId, projectId);
    if (!project) throw ApiError.notFound('Project not found');
    return credentialsRepository.updateProject(projectId, { completedAt: new Date() });
  },

  async deleteProject(userId: string, projectId: string) {
    const project = await credentialsRepository.findProject(userId, projectId);
    if (!project) throw ApiError.notFound('Project not found');
    await credentialsRepository.deleteProject(projectId);
  },

  // ---- Assessments ----
  listAssessments() {
    return credentialsRepository.listAssessments();
  },

  createAssessment(input: { title: string; type: string; passScore: number }) {
    return credentialsRepository.createAssessment(input);
  },

  async submitAttempt(userId: string, assessmentId: string, score: number) {
    const assessment = await credentialsRepository.findAssessment(assessmentId);
    if (!assessment) throw ApiError.notFound('Assessment not found');

    const passed = score >= assessment.passScore;
    const attempt = await credentialsRepository.createAttempt({ assessmentId, userId, score, passed });

    return { ...attempt, passScore: assessment.passScore };
  },

  listMyAttempts(userId: string) {
    return credentialsRepository.listAttemptsForUser(userId);
  },

  // ---- Certificates ----
  listMyCertificates(userId: string) {
    return credentialsRepository.listCertificatesForUser(userId);
  },

  async issueCertificate(userId: string, input: { programmeName: string; skills?: string[] }) {
    const certificate = await credentialsRepository.createCertificate({
      userId,
      programmeName: input.programmeName,
      skills: input.skills ?? [],
      verificationCode: generateVerificationCode(),
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await emailProvider.send({
        to: user.email,
        subject: `Congratulations — you earned the ${input.programmeName} certificate`,
        html: `<p>Hi ${user.firstName}, congratulations on completing ${input.programmeName}. Your certificate ID is ${certificate.verificationCode}.</p>`,
      });
    }

    return certificate;
  },

  listAllCertificates() {
    return credentialsRepository.listAllCertificates();
  },

  async verifyCertificate(code: string) {
    const certificate = await credentialsRepository.findByVerificationCode(code);
    if (!certificate) throw ApiError.notFound('No certificate found with this verification code');
    return {
      valid: true,
      holderName: `${certificate.user.firstName} ${certificate.user.lastName}`,
      programmeName: certificate.programmeName,
      skills: certificate.skills,
      issueDate: certificate.issueDate,
      verificationCode: certificate.verificationCode,
    };
  },
};
