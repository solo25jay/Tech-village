import { Router } from 'express';
import { asyncHandler } from '@common/asyncHandler';
import { requireAuth } from '@middleware/auth.middleware';
import { requirePermission } from '@middleware/rbac.middleware';
import { hostEventsController } from './host-events.controller';

export const hostEventsRouter = Router();

hostEventsRouter.use(requireAuth, requirePermission('events:create', 'admin:events:manage'));

hostEventsRouter.get('/', asyncHandler(hostEventsController.listMine));
hostEventsRouter.post('/', asyncHandler(hostEventsController.create));
hostEventsRouter.patch('/:eventId/cancel', asyncHandler(hostEventsController.cancel));
hostEventsRouter.get('/:eventId/attendees', asyncHandler(hostEventsController.attendees));
