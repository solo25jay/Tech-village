import type { Request, Response } from 'express';
import { jobsService } from './jobs.service';
import { createJobSchema, publishJobSchema, updateApplicationStatusSchema, upsertCompanySchema } from './jobs.validation';

export const companyController = {
  async getMyCompany(req: Request, res: Response) {
    res.json({ data: await jobsService.getMyCompany(req.auth!.userId) });
  },

  async upsertMyCompany(req: Request, res: Response) {
    const input = upsertCompanySchema.parse(req.body);
    res.status(200).json({ data: await jobsService.upsertMyCompany(req.auth!.userId, input) });
  },

  async listMyJobs(req: Request, res: Response) {
    res.json({ data: await jobsService.listMyJobs(req.auth!.userId) });
  },

  async createJob(req: Request, res: Response) {
    const input = createJobSchema.parse(req.body);
    res.status(201).json({ data: await jobsService.createJob(req.auth!.userId, input) });
  },

  async publishJob(req: Request, res: Response) {
    const input = publishJobSchema.parse(req.body);
    res.json({ data: await jobsService.setJobPublished(req.auth!.userId, req.params.jobId, input.isPublished) });
  },

  async listApplications(req: Request, res: Response) {
    res.json({ data: await jobsService.listApplicationsForJob(req.auth!.userId, req.params.jobId) });
  },

  async updateApplicationStatus(req: Request, res: Response) {
    const input = updateApplicationStatusSchema.parse(req.body);
    res.json({
      data: await jobsService.updateApplicationStatus(req.auth!.userId, req.params.applicationId, input.status),
    });
  },
};
