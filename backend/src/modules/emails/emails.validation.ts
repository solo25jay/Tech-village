import { z } from 'zod';

export const createCampaignSchema = z.object({
  subject: z.string().min(1),
  body: z.string().min(1),
  segment: z.enum(['ALL_USERS', 'LEARNERS', 'MENTORS', 'PROFESSIONALS', 'COMPANIES']),
});
