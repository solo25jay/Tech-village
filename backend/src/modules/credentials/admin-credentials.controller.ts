import type { Request, Response } from 'express';
import { credentialsService } from './credentials.service';
import { createAssessmentSchema, issueCertificateSchema } from './credentials.validation';
import { recordAuditLog } from '@common/audit';

export const adminCredentialsController = {
  async createAssessment(req: Request, res: Response) {
    const input = createAssessmentSchema.parse(req.body);
    res.status(201).json({ data: await credentialsService.createAssessment(input) });
  },

  async issueCertificate(req: Request, res: Response) {
    const input = issueCertificateSchema.parse(req.body);
    const certificate = await credentialsService.issueCertificate(input.userId, {
      programmeName: input.programmeName,
      skills: input.skills,
    });
    await recordAuditLog({
      actorId: req.auth!.userId,
      action: 'certificate.issued',
      entity: 'Certificate',
      entityId: certificate.id,
      metadata: { userId: input.userId, programmeName: input.programmeName },
    });
    res.status(201).json({ data: certificate });
  },

  async listAllCertificates(_req: Request, res: Response) {
    res.json({ data: await credentialsService.listAllCertificates() });
  },
};
