import { z } from 'zod';

export const createGoalSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  targetDate: z.string().datetime().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
});

export const updateGoalSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  targetDate: z.string().datetime().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'AT_RISK', 'COMPLETED', 'PAUSED']).optional(),
});

export const addMilestoneSchema = z.object({
  title: z.string().min(1),
});

export const toggleSchema = z.object({
  completed: z.boolean(),
});

export const createRoadmapSchema = z.object({
  title: z.string().min(1),
  careerPath: z.string().optional(),
});

export const addRoadmapMilestoneSchema = z.object({
  title: z.string().min(1),
  deadline: z.string().datetime().optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  deadline: z.string().datetime().optional(),
  goalId: z.string().uuid().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  deadline: z.string().datetime().nullable().optional(),
});
