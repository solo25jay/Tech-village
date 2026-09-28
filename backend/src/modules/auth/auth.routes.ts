import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '@common/asyncHandler';
import { authController } from './auth.controller';

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

export const authRouter = Router();

authRouter.post('/register', authLimiter, asyncHandler(authController.register));
authRouter.post('/login', authLimiter, asyncHandler(authController.login));
authRouter.post('/refresh', asyncHandler(authController.refresh));
authRouter.post('/logout', asyncHandler(authController.logout));
