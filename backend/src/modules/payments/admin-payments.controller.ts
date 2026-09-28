import type { Request, Response } from 'express';
import { paymentsService } from './payments.service';

export const adminPaymentsController = {
  async listAll(_req: Request, res: Response) {
    res.json({ data: await paymentsService.listAll() });
  },

  async revenueSummary(_req: Request, res: Response) {
    res.json({ data: await paymentsService.getRevenueSummary() });
  },
};
