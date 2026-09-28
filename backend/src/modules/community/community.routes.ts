import { Router } from 'express';
import { asyncHandler } from '@common/asyncHandler';
import { requireAuth } from '@middleware/auth.middleware';
import { communityController } from './community.controller';

export const communityRouter = Router();

communityRouter.use(requireAuth);

communityRouter.get('/me', asyncHandler(communityController.me));
