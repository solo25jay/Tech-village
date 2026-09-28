import type { Request, Response } from 'express';
import { paymentsService } from './payments.service';
import { initiatePaymentSchema } from './payments.validation';

export const paymentsController = {
  async initiate(req: Request, res: Response) {
    const input = initiatePaymentSchema.parse(req.body);
    const result = await paymentsService.initiate(req.auth!.userId, input);
    res.status(201).json({ data: result });
  },

  async verify(req: Request, res: Response) {
    const result = await paymentsService.verify(req.params.reference);
    res.json({ data: result });
  },

  async myPayments(req: Request, res: Response) {
    res.json({ data: await paymentsService.listMyPayments(req.auth!.userId) });
  },
};
