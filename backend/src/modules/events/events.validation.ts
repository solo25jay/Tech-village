import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  eventType: z.enum(['webinar', 'live_class', 'workshop', 'group_mentorship', 'orientation']),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  maxAttendees: z.number().int().positive().optional(),
  meetingUrl: z.string().url().optional(),
});
