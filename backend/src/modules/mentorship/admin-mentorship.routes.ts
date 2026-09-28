import { Router } from 'express';
import { asyncHandler } from '@common/asyncHandler';
import { requireAuth } from '@middleware/auth.middleware';
import { requirePermission } from '@middleware/rbac.middleware';
import { adminMentorshipController } from './admin-mentorship.controller';

export const adminMentorshipRouter = Router();

adminMentorshipRouter.use(requireAuth, requirePermission('admin:mentors:manage'));

adminMentorshipRouter.get('/', asyncHandler(adminMentorshipController.listAll));
adminMentorshipRouter.patch('/:id/approval', asyncHandler(adminMentorshipController.setApproval));
