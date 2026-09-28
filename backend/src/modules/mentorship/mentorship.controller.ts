import type { Request, Response } from 'express';
import { mentorshipService, sanitizeForMentee } from './mentorship.service';
import { applyMentorSchema, requestMentorshipSchema } from './mentorship.validation';

export const mentorshipController = {
  async applyAsMentor(req: Request, res: Response) {
    const input = applyMentorSchema.parse(req.body);
    const profile = await mentorshipService.applyAsMentor(req.auth!.userId, input);
    res.status(201).json({ data: profile });
  },

  async listMentors(_req: Request, res: Response) {
    res.json({ data: await mentorshipService.listApprovedMentors() });
  },

  async getMentor(req: Request, res: Response) {
    res.json({ data: await mentorshipService.getMentorProfile(req.params.mentorProfileId) });
  },

  async requestMentorship(req: Request, res: Response) {
    const input = requestMentorshipSchema.parse(req.body);
    const mentorship = await mentorshipService.requestMentorship(req.auth!.userId, input.mentorProfileId);
    res.status(201).json({ data: mentorship });
  },

  async myMentorships(req: Request, res: Response) {
    const rows = await mentorshipService.listMyMentorshipsAsMentee(req.auth!.userId);
    // Learner-facing: strip the mentor's private note from every row.
    res.json({ data: rows.map(sanitizeForMentee) });
  },

  async myUpcomingSessions(req: Request, res: Response) {
    res.json({ data: await mentorshipService.listMyUpcomingSessionsAsMentee(req.auth!.userId) });
  },
};
