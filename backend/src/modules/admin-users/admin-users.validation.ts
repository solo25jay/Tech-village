import { z } from 'zod';

export const setStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'DEACTIVATED']),
});

export const roleNameSchema = z.object({
  roleName: z.enum(['learner', 'mentor', 'professional', 'company', 'admin', 'super_admin']),
});
