import { Router } from 'express';
import { asyncHandler } from '@common/asyncHandler';
import { requireAuth } from '@middleware/auth.middleware';
import { requirePermission } from '@middleware/rbac.middleware';
import { mentorController } from './mentor.controller';

export const mentorRouter = Router();

mentorRouter.use(requireAuth, requirePermission('mentees:manage'));

mentorRouter.get('/mentorships', asyncHandler(mentorController.listMentorships));
mentorRouter.patch('/mentorships/:mentorshipId/respond', asyncHandler(mentorController.respondToRequest));
mentorRouter.patch('/mentorships/:mentorshipId/note', asyncHandler(mentorController.setNote));
mentorRouter.post('/mentorships/:mentorshipId/sessions', asyncHandler(mentorController.scheduleSession));
mentorRouter.get('/sessions/upcoming', asyncHandler(mentorController.upcomingSessions));
