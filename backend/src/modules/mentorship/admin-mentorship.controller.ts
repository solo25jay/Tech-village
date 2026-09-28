import type { Request, Response } from 'express';
import { mentorshipRepository } from './mentorship.repository';
import { approvalSchema } from './mentorship.validation';
import { recordAuditLog } from '@common/audit';

export const adminMentorshipController = {
  async listAll(_req: Request, res: Response) {
    res.json({ data: await mentorshipRepository.listAllMentorProfiles() });
  },

  async setApproval(req: Request, res: Response) {
    const input = approvalSchema.parse(req.body);
    const profile = await mentorshipRepository.setApproval(req.params.id, input.isApproved);
    await recordAuditLog({
      actorId: req.auth!.userId,
      action: input.isApproved ? 'mentor.approved' : 'mentor.revoked',
      entity: 'MentorProfile',
      entityId: req.params.id,
    });
    res.json({ data: profile });
  },
};
