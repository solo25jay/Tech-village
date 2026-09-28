import { Router } from 'express';
import type { Request, Response } from 'express';
import { asyncHandler } from '@common/asyncHandler';
import { requireAuth } from '@middleware/auth.middleware';
import { requirePermission } from '@middleware/rbac.middleware';
import { reportsService } from './reports.service';

export const reportsRouter = Router();

reportsRouter.use(requireAuth, requirePermission('admin:reports:view'));

reportsRouter.get(
  '/summary',
  asyncHandler(async (_req: Request, res: Response) => {
    res.json({ data: await reportsService.getSummary() });
  }),
);
