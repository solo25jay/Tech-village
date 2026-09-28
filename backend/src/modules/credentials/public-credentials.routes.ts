import { Router } from 'express';
import { asyncHandler } from '@common/asyncHandler';
import { publicCredentialsController } from './public-credentials.controller';

export const publicCredentialsRouter = Router();

publicCredentialsRouter.get('/certificates/:code', asyncHandler(publicCredentialsController.verify));
