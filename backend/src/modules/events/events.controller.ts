import type { Request, Response } from 'express';
import { eventsService } from './events.service';

export const eventsController = {
  async listUpcoming(_req: Request, res: Response) {
    res.json({ data: await eventsService.listUpcoming() });
  },

  async getEvent(req: Request, res: Response) {
    res.json({ data: await eventsService.getEvent(req.params.eventId) });
  },

  async register(req: Request, res: Response) {
    const registration = await eventsService.register(req.params.eventId, req.auth!.userId);
    res.status(201).json({ data: registration });
  },

  async myRegistrations(req: Request, res: Response) {
    res.json({ data: await eventsService.listMyRegistrations(req.auth!.userId) });
  },
};
