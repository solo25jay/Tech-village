import type { Request, Response } from 'express';
import { credentialsService } from './credentials.service';
import { createProjectSchema, submitAttemptSchema, updateProjectSchema } from './credentials.validation';

export const credentialsController = {
  // Projects
  async listMyProjects(req: Request, res: Response) {
    res.json({ data: await credentialsService.listMyProjects(req.auth!.userId) });
  },
  async createProject(req: Request, res: Response) {
    const input = createProjectSchema.parse(req.body);
    res.status(201).json({ data: await credentialsService.createProject(req.auth!.userId, input) });
  },
  async updateProject(req: Request, res: Response) {
    const input = updateProjectSchema.parse(req.body);
    res.json({ data: await credentialsService.updateProject(req.auth!.userId, req.params.projectId, input) });
  },
  async markCompleted(req: Request, res: Response) {
    res.json({ data: await credentialsService.markProjectCompleted(req.auth!.userId, req.params.projectId) });
  },
  async deleteProject(req: Request, res: Response) {
    await credentialsService.deleteProject(req.auth!.userId, req.params.projectId);
    res.status(204).send();
  },

  // Assessments
  async listAssessments(_req: Request, res: Response) {
    res.json({ data: await credentialsService.listAssessments() });
  },
  async submitAttempt(req: Request, res: Response) {
    const input = submitAttemptSchema.parse(req.body);
    const result = await credentialsService.submitAttempt(req.auth!.userId, req.params.assessmentId, input.score);
    res.status(201).json({ data: result });
  },
  async myAttempts(req: Request, res: Response) {
    res.json({ data: await credentialsService.listMyAttempts(req.auth!.userId) });
  },

  // Certificates
  async myCertificates(req: Request, res: Response) {
    res.json({ data: await credentialsService.listMyCertificates(req.auth!.userId) });
  },
};
