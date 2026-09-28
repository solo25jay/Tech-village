import { Router } from 'express';
import { asyncHandler } from '@common/asyncHandler';
import { requireAuth } from '@middleware/auth.middleware';
import { usersController } from './users.controller';

export const usersRouter = Router();

usersRouter.get('/me', requireAuth, asyncHandler(usersController.me));
