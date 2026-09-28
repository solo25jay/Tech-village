import { z } from 'zod';

export const setQualificationSchema = z.object({
  isQualified: z.boolean(),
});
