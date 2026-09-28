import { Router } from 'express';
import { asyncHandler } from '@common/asyncHandler';
import { requireAuth } from '@middleware/auth.middleware';
import { requirePermission } from '@middleware/rbac.middleware';
import { emailsController } from './emails.controller';

export const emailsRouter = Router();

emailsRouter.use(requireAuth, requirePermission('admin:emails:manage'));

emailsRouter.get('/', asyncHandler(emailsController.list));
emailsRouter.post('/', asyncHandler(emailsController.createDraft));
emailsRouter.post('/:campaignId/send', asyncHandler(emailsController.send));
