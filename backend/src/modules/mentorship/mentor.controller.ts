import type { Request, Response } from 'express';
import { mentorshipService } from './mentorship.service';
import { noteSchema, respondSchema, scheduleSessionSchema } from './mentorship.validation';

export const mentorController = {
  async listMentorships(req: Request, res: Response) {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    res.json({ data: await mentorshipService.listMyMentorships(req.auth!.userId, status) });
  },

  async respondToRequest(req: Request, res: Response) {
    const input = respondSchema.parse(req.body);
    const mentorship = await mentorshipService.respondToRequest(
      req.auth!.userId,
      req.params.mentorshipId,
      input.accept,
    );
    res.json({ data: mentorship });
  },

  async setNote(req: Request, res: Response) {
    const input = noteSchema.parse(req.body);
    const mentorship = await mentorshipService.setPrivateNote(req.auth!.userId, req.params.mentorshipId, input.note);
    res.json({ data: mentorship });
  },

  async scheduleSession(req: Request, res: Response) {
    const input = scheduleSessionSchema.parse(req.body);
    const session = await mentorshipService.scheduleSession(req.auth!.userId, req.params.mentorshipId, input);
    res.status(201).json({ data: session });
  },

  async upcomingSessions(req: Request, res: Response) {
    res.json({ data: await mentorshipService.listMyUpcomingSessionsAsMentor(req.auth!.userId) });
  },
};
