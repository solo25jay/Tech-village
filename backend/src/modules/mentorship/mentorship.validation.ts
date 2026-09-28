import { z } from 'zod';

export const applyMentorSchema = z.object({
  title: z.string().optional(),
  bio: z.string().optional(),
  expertise: z.array(z.string()).default([]),
  hourlyRate: z.number().nonnegative().optional(),
});

export const requestMentorshipSchema = z.object({
  mentorProfileId: z.string().uuid(),
});

export const respondSchema = z.object({
  accept: z.boolean(),
});

export const noteSchema = z.object({
  note: z.string(),
});

export const scheduleSessionSchema = z.object({
  scheduledAt: z.string().datetime(),
  durationMins: z.number().int().positive(),
  meetingUrl: z.string().url().optional(),
});

export const approvalSchema = z.object({
  isApproved: z.boolean(),
});
