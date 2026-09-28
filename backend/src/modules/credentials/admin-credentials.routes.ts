import { Router } from 'express';
import { asyncHandler } from '@common/asyncHandler';
import { requireAuth } from '@middleware/auth.middleware';
import { requirePermission } from '@middleware/rbac.middleware';
import { adminCredentialsController } from './admin-credentials.controller';

export const adminCredentialsRouter = Router();

adminCredentialsRouter.use(requireAuth, requirePermission('admin:credentials:manage'));

adminCredentialsRouter.post('/assessments', asyncHandler(adminCredentialsController.createAssessment));
adminCredentialsRouter.post('/certificates', asyncHandler(adminCredentialsController.issueCertificate));
adminCredentialsRouter.get('/certificates', asyncHandler(adminCredentialsController.listAllCertificates));
