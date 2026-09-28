import { Router } from 'express';
import { asyncHandler } from '@common/asyncHandler';
import { requireAuth } from '@middleware/auth.middleware';
import { requirePermission } from '@middleware/rbac.middleware';
import { companyController } from './company.controller';

export const companyRouter = Router();

companyRouter.use(requireAuth, requirePermission('jobs:manage'));

companyRouter.get('/profile', asyncHandler(companyController.getMyCompany));
companyRouter.put('/profile', asyncHandler(companyController.upsertMyCompany));

companyRouter.get('/jobs', asyncHandler(companyController.listMyJobs));
companyRouter.post('/jobs', asyncHandler(companyController.createJob));
companyRouter.patch('/jobs/:jobId/publish', asyncHandler(companyController.publishJob));
companyRouter.get('/jobs/:jobId/applications', asyncHandler(companyController.listApplications));
companyRouter.patch('/applications/:applicationId/status', asyncHandler(companyController.updateApplicationStatus));
