import type { Request, Response } from 'express';
import { usersService } from './users.service';

export const usersController = {
  async me(req: Request, res: Response) {
    const user = await usersService.getCurrentUser(req.auth!.userId);
    res.status(200).json({ data: user });
  },
};
