import { Router } from 'express';
import { asyncHandler } from '@common/asyncHandler';
import { requireAuth } from '@middleware/auth.middleware';
import { requirePermission } from '@middleware/rbac.middleware';
import { adminPaymentsController } from './admin-payments.controller';

export const adminPaymentsRouter = Router();

adminPaymentsRouter.use(requireAuth, requirePermission('admin:payments:manage'));

adminPaymentsRouter.get('/', asyncHandler(adminPaymentsController.listAll));
adminPaymentsRouter.get('/revenue', asyncHandler(adminPaymentsController.revenueSummary));
