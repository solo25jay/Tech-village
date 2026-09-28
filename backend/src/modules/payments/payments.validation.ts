import { z } from 'zod';

export const initiatePaymentSchema = z.object({
  purpose: z.enum(['COURSE', 'MENTORSHIP', 'EVENT', 'CERTIFICATION', 'SUBSCRIPTION', 'COMPANY_SERVICE']),
  referenceId: z.string().optional(),
  amountKobo: z.number().int().positive(),
  currency: z.string().length(3).optional(),
});
