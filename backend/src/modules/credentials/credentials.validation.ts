import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  technologies: z.array(z.string()).default([]),
  githubUrl: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  githubUrl: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
});

export const createAssessmentSchema = z.object({
  title: z.string().min(1),
  type: z.enum(['quiz', 'technical_test', 'practical', 'project', 'career']),
  passScore: z.number().int().min(0).max(100),
});

export const submitAttemptSchema = z.object({
  score: z.number().int().min(0).max(100),
});

export const issueCertificateSchema = z.object({
  userId: z.string().uuid(),
  programmeName: z.string().min(1),
  skills: z.array(z.string()).default([]),
});
