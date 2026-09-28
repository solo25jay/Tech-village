import { ApiError } from '@common/ApiError';
import { jobsRepository } from './jobs.repository';
import { createEmailProvider } from '@integrations/email/emailProviderFactory';
import { prisma } from '@database/prisma';

const emailProvider = createEmailProvider();

export const jobsService = {
  // ---- Company ----
  getMyCompany(userId: string) {
    return jobsRepository.findCompanyByUserId(userId);
  },

  upsertMyCompany(userId: string, input: { name: string; description?: string; website?: string; industry?: string }) {
    return jobsRepository.upsertCompany(userId, input);
  },

  listAllCompanies() {
    return jobsRepository.listAllCompanies();
  },

  // ---- Jobs (company side) ----
  async listMyJobs(userId: string) {
    const company = await jobsRepository.findCompanyByUserId(userId);
    if (!company) throw ApiError.badRequest('Create a company profile before posting jobs');
    return jobsRepository.listJobsForCompany(company.id);
  },

  async createJob(
    userId: string,
    input: { title: string; description: string; type: string; location?: string; remote?: boolean; skills?: string[] },
  ) {
    const company = await jobsRepository.findCompanyByUserId(userId);
    if (!company) throw ApiError.badRequest('Create a company profile before posting jobs');

    return jobsRepository.createJob({
      companyId: company.id,
      title: input.title,
      description: input.description,
      type: input.type,
      location: input.location,
      remote: input.remote ?? false,
      skills: input.skills ?? [],
    });
  },

  async setJobPublished(userId: string, jobId: string, isPublished: boolean) {
    const job = await jobsRepository.findJobById(jobId);
    if (!job) throw ApiError.notFound('Job not found');

    const company = await jobsRepository.findCompanyByUserId(userId);
    if (!company || job.companyId !== company.id) throw ApiError.forbidden('Not authorized for this job');

    return jobsRepository.setJobPublished(jobId, isPublished);
  },

  async listApplicationsForJob(userId: string, jobId: string) {
    const job = await jobsRepository.findJobById(jobId);
    if (!job) throw ApiError.notFound('Job not found');

    const company = await jobsRepository.findCompanyByUserId(userId);
    if (!company || job.companyId !== company.id) throw ApiError.forbidden('Not authorized for this job');

    return jobsRepository.listApplicationsForJob(jobId);
  },

  async updateApplicationStatus(userId: string, applicationId: string, status: string) {
    const application = await jobsRepository.findApplicationById(applicationId);
    if (!application) throw ApiError.notFound('Application not found');

    const company = await jobsRepository.findCompanyByUserId(userId);
    if (!company || application.job.companyId !== company.id) {
      throw ApiError.forbidden('Not authorized for this application');
    }

    const updated = await jobsRepository.updateApplicationStatus(applicationId, status);

    const applicant = await prisma.user.findUnique({ where: { id: application.applicantId } });
    if (applicant) {
      await emailProvider.send({
        to: applicant.email,
        subject: `Application update: ${application.job.title}`,
        html: `<p>Hi ${applicant.firstName}, your application status for ${application.job.title} is now: ${status}.</p>`,
      });
    }

    return updated;
  },

  // ---- Jobs (applicant side) ----
  listOpenJobs() {
    return jobsRepository.listPublishedJobs();
  },

  async getJob(jobId: string) {
    const job = await jobsRepository.findJobById(jobId);
    if (!job || !job.isPublished) throw ApiError.notFound('Job not found');
    return job;
  },

  async apply(applicantId: string, jobId: string, coverNote?: string) {
    const job = await jobsRepository.findJobById(jobId);
    if (!job || !job.isPublished) throw ApiError.notFound('Job not found');

    const existing = await jobsRepository.findApplication(jobId, applicantId);
    if (existing) throw ApiError.conflict('You have already applied to this job');

    const application = await jobsRepository.createApplication(jobId, applicantId, coverNote);

    const applicant = await prisma.user.findUnique({ where: { id: applicantId } });
    if (applicant) {
      await emailProvider.send({
        to: applicant.email,
        subject: `Application received: ${job.title}`,
        html: `<p>Hi ${applicant.firstName}, we've received your application for ${job.title}.</p>`,
      });
    }

    return application;
  },

  listMyApplications(applicantId: string) {
    return jobsRepository.listMyApplications(applicantId);
  },
};
