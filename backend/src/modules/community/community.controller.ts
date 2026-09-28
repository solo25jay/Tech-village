import type { Request, Response } from 'express';
import { communityService } from './community.service';

export const communityController = {
  async me(req: Request, res: Response) {
    res.json({ data: await communityService.getMyAccess(req.auth!.userId) });
  },
};
