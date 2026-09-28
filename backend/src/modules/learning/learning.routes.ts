import { Router } from 'express';
import { asyncHandler } from '@common/asyncHandler';
import { requireAuth } from '@middleware/auth.middleware';
import { learningController } from './learning.controller';

export const learningRouter = Router();

learningRouter.use(requireAuth);

learningRouter.get('/paths', asyncHandler(learningController.listPaths));
learningRouter.get('/paths/:slug', asyncHandler(learningController.getPath));

learningRouter.get('/courses', asyncHandler(learningController.listCourses));
learningRouter.get('/courses/:courseId', asyncHandler(learningController.getCourse));
learningRouter.post('/enrollments', asyncHandler(learningController.enroll));
learningRouter.get('/enrollments/me', asyncHandler(learningController.myEnrollments));

learningRouter.put(
  '/courses/:courseId/lessons/:lessonId/progress',
  asyncHandler(learningController.setLessonProgress),
);
