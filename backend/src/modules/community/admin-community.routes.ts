import { Router } from 'express';
import { asyncHandler } from '@common/asyncHandler';
import { requireAuth } from '@middleware/auth.middleware';
import { requirePermission } from '@middleware/rbac.middleware';
import { adminCommunityController } from './admin-community.controller';

export const adminCommunityRouter = Router();

adminCommunityRouter.use(requireAuth, requirePermission('admin:community:manage'));

adminCommunityRouter.get('/professionals', asyncHandler(adminCommunityController.listProfessionals));
adminCommunityRouter.patch(
  '/professionals/:userId/qualification',
  asyncHandler(adminCommunityController.setQualification),
);
