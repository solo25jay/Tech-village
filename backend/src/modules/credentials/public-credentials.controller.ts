import type { Request, Response } from 'express';
import { credentialsService } from './credentials.service';

export const publicCredentialsController = {
  async verify(req: Request, res: Response) {
    const result = await credentialsService.verifyCertificate(req.params.code);
    res.json({ data: result });
  },
};
