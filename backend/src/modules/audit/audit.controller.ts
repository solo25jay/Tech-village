import type { Request, Response } from 'express';
import { auditRepository } from './audit.repository';

export const auditController = {
  async list(req: Request, res: Response) {
    const entity = typeof req.query.entity === 'string' ? req.query.entity : undefined;
    const actorId = typeof req.query.actorId === 'string' ? req.query.actorId : undefined;
    res.json({ data: await auditRepository.list({ entity, actorId }) });
  },
};
