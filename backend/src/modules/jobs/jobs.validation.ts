import { z } from 'zod';

export const upsertCompanySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  website: z.string().url().optional(),
  industry: z.string().optional(),
});

export const createJobSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'FREELANCE', 'APPRENTICESHIP', 'VOLUNTEER']),
  location: z.string().optional(),
  remote: z.boolean().optional(),
  skills: z.array(z.string()).default([]),
});

export const publishJobSchema = z.object({
  isPublished: z.boolean(),
});

export const applySchema = z.object({
  coverNote: z.string().optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['SUBMITTED', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'HIRED']),
});
