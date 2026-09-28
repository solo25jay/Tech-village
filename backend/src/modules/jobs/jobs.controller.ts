import type { Request, Response } from 'express';
import { jobsService } from './jobs.service';
import { applySchema } from './jobs.validation';

export const jobsController = {
  async listOpenJobs(_req: Request, res: Response) {
    res.json({ data: await jobsService.listOpenJobs() });
  },

  async getJob(req: Request, res: Response) {
    res.json({ data: await jobsService.getJob(req.params.jobId) });
  },

  async apply(req: Request, res: Response) {
    const input = applySchema.parse(req.body);
    const application = await jobsService.apply(req.auth!.userId, req.params.jobId, input.coverNote);
    res.status(201).json({ data: application });
  },

  async myApplications(req: Request, res: Response) {
    res.json({ data: await jobsService.listMyApplications(req.auth!.userId) });
  },
};
