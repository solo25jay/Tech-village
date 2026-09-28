import { Router } from 'express';
import { asyncHandler } from '@common/asyncHandler';
import { requireAuth } from '@middleware/auth.middleware';
import { paymentsController } from './payments.controller';

export const paymentsRouter = Router();

paymentsRouter.use(requireAuth);

paymentsRouter.post('/initiate', asyncHandler(paymentsController.initiate));
paymentsRouter.get('/verify/:reference', asyncHandler(paymentsController.verify));
paymentsRouter.get('/mine', asyncHandler(paymentsController.myPayments));
