import { Router } from 'express';
import { asyncHandler } from '@common/asyncHandler';
import { requireAuth } from '@middleware/auth.middleware';
import { requirePermission } from '@middleware/rbac.middleware';
import { adminLearningController } from './admin-learning.controller';

export const adminLearningRouter = Router();

adminLearningRouter.use(requireAuth);

adminLearningRouter.get(
  '/paths',
  requirePermission('admin:courses:manage'),
  asyncHandler(adminLearningController.listPaths),
);
adminLearningRouter.post(
  '/paths',
  requirePermission('admin:courses:manage'),
  asyncHandler(adminLearningController.createPath),
);
adminLearningRouter.patch(
  '/paths/:id/publish',
  requirePermission('courses:publish'),
  asyncHandler(adminLearningController.publishPath),
);

adminLearningRouter.get(
  '/courses',
  requirePermission('admin:courses:manage'),
  asyncHandler(adminLearningController.listCourses),
);
adminLearningRouter.post(
  '/courses',
  requirePermission('courses:create'),
  asyncHandler(adminLearningController.createCourse),
);
adminLearningRouter.get(
  '/courses/:id',
  requirePermission('admin:courses:manage'),
  asyncHandler(adminLearningController.getCourse),
);
adminLearningRouter.patch(
  '/courses/:id/publish',
  requirePermission('courses:publish'),
  asyncHandler(adminLearningController.publishCourse),
);

adminLearningRouter.post(
  '/modules',
  requirePermission('admin:courses:manage'),
  asyncHandler(adminLearningController.createModule),
);
adminLearningRouter.post(
  '/lessons',
  requirePermission('admin:courses:manage'),
  asyncHandler(adminLearningController.createLesson),
);
