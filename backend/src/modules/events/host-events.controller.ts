import type { Request, Response } from 'express';
import { eventsService } from './events.service';
import { createEventSchema } from './events.validation';

function isAdmin(req: Request) {
  return req.auth!.roles.includes('admin') || req.auth!.roles.includes('super_admin');
}

export const hostEventsController = {
  async listMine(req: Request, res: Response) {
    const events = isAdmin(req) ? await eventsService.listAll() : await eventsService.listHostedBy(req.auth!.userId);
    res.json({ data: events });
  },

  async create(req: Request, res: Response) {
    const input = createEventSchema.parse(req.body);
    const event = await eventsService.create(req.auth!.userId, input);
    res.status(201).json({ data: event });
  },

  async cancel(req: Request, res: Response) {
    const event = await eventsService.cancel(req.auth!.userId, req.params.eventId, isAdmin(req));
    res.json({ data: event });
  },

  async attendees(req: Request, res: Response) {
    const attendees = await eventsService.listAttendees(req.auth!.userId, req.params.eventId, isAdmin(req));
    res.json({ data: attendees });
  },
};
