import type { Request, Response } from 'express';
import { communityService } from './community.service';
import { setQualificationSchema } from './community.validation';
import { recordAuditLog } from '@common/audit';

export const adminCommunityController = {
  async listProfessionals(_req: Request, res: Response) {
    res.json({ data: await communityService.listProfessionalProfiles() });
  },

  async setQualification(req: Request, res: Response) {
    const input = setQualificationSchema.parse(req.body);
    await communityService.setProfessionalQualification(req.params.userId, input.isQualified);
    await recordAuditLog({
      actorId: req.auth!.userId,
      action: input.isQualified ? 'professional.qualified' : 'professional.unqualified',
      entity: 'ProfessionalProfile',
      entityId: req.params.userId,
    });
    res.status(200).json({ data: { userId: req.params.userId, isQualified: input.isQualified } });
  },
};
