import type { Request, Response } from 'express';
import { emailsService } from './emails.service';
import { createCampaignSchema } from './emails.validation';

export const emailsController = {
  async list(_req: Request, res: Response) {
    res.json({ data: await emailsService.listCampaigns() });
  },

  async createDraft(req: Request, res: Response) {
    const input = createCampaignSchema.parse(req.body);
    res.status(201).json({ data: await emailsService.createDraft(req.auth!.userId, input) });
  },

  async send(req: Request, res: Response) {
    res.json({ data: await emailsService.send(req.params.campaignId) });
  },
};
