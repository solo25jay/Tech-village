import { Router } from 'express';
import { asyncHandler } from '@common/asyncHandler';
import { requireAuth } from '@middleware/auth.middleware';
import { mentorshipController } from './mentorship.controller';

export const mentorshipRouter = Router();

mentorshipRouter.use(requireAuth);

mentorshipRouter.post('/apply', asyncHandler(mentorshipController.applyAsMentor));

mentorshipRouter.get('/mentors', asyncHandler(mentorshipController.listMentors));
mentorshipRouter.get('/mentors/:mentorProfileId', asyncHandler(mentorshipController.getMentor));

mentorshipRouter.post('/requests', asyncHandler(mentorshipController.requestMentorship));
mentorshipRouter.get('/mine', asyncHandler(mentorshipController.myMentorships));
mentorshipRouter.get('/sessions/upcoming', asyncHandler(mentorshipController.myUpcomingSessions));
