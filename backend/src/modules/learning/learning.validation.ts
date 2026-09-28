import { z } from 'zod';

export const enrollSchema = z.object({
  courseId: z.string().uuid(),
});

export const lessonProgressSchema = z.object({
  completed: z.boolean(),
});

export const createPathSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(1),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  durationWeeks: z.number().int().positive().optional(),
  skills: z.array(z.string()).default([]),
});

export const publishSchema = z.object({
  isPublished: z.boolean(),
});

export const createCourseSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(1),
  thumbnailUrl: z.string().url().optional(),
  instructorId: z.string().uuid().optional(),
  learningPathId: z.string().uuid().optional(),
});

export const createModuleSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().min(1),
  order: z.number().int().nonnegative(),
});

export const createLessonSchema = z.object({
  moduleId: z.string().uuid(),
  title: z.string().min(1),
  contentType: z.enum(['VIDEO', 'TEXT', 'RESOURCE']),
  contentUrl: z.string().url().optional(),
  contentBody: z.string().optional(),
  order: z.number().int().nonnegative(),
});
