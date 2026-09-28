import { Router } from 'express';
import { asyncHandler } from '@common/asyncHandler';
import { requireAuth } from '@middleware/auth.middleware';
import { jobsController } from './jobs.controller';

export const jobsRouter = Router();

jobsRouter.use(requireAuth);

jobsRouter.get('/', asyncHandler(jobsController.listOpenJobs));
jobsRouter.get('/applications/mine', asyncHandler(jobsController.myApplications));
jobsRouter.get('/:jobId', asyncHandler(jobsController.getJob));
jobsRouter.post('/:jobId/apply', asyncHandler(jobsController.apply));
