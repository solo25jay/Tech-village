import { Router } from 'express';
import { asyncHandler } from '@common/asyncHandler';
import { requireAuth } from '@middleware/auth.middleware';
import { eventsController } from './events.controller';

export const eventsRouter = Router();

eventsRouter.use(requireAuth);

eventsRouter.get('/', asyncHandler(eventsController.listUpcoming));
eventsRouter.get('/mine', asyncHandler(eventsController.myRegistrations));
eventsRouter.get('/:eventId', asyncHandler(eventsController.getEvent));
eventsRouter.post('/:eventId/register', asyncHandler(eventsController.register));
