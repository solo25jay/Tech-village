import { Router } from 'express';
import { asyncHandler } from '@common/asyncHandler';
import { requireAuth } from '@middleware/auth.middleware';
import { productivityController } from './productivity.controller';

export const productivityRouter = Router();

productivityRouter.use(requireAuth);

// Goals
productivityRouter.get('/goals', asyncHandler(productivityController.listGoals));
productivityRouter.post('/goals', asyncHandler(productivityController.createGoal));
productivityRouter.patch('/goals/:goalId', asyncHandler(productivityController.updateGoal));
productivityRouter.delete('/goals/:goalId', asyncHandler(productivityController.deleteGoal));
productivityRouter.post('/goals/:goalId/milestones', asyncHandler(productivityController.addMilestone));
productivityRouter.patch(
  '/goals/:goalId/milestones/:milestoneId',
  asyncHandler(productivityController.toggleMilestone),
);

// Roadmaps
productivityRouter.get('/roadmaps', asyncHandler(productivityController.listRoadmaps));
productivityRouter.get('/roadmaps/templates', asyncHandler(productivityController.listTemplates));
productivityRouter.post('/roadmaps', asyncHandler(productivityController.createRoadmap));
productivityRouter.post(
  '/roadmaps/templates/:templateId/clone',
  asyncHandler(productivityController.cloneTemplate),
);
productivityRouter.post(
  '/roadmaps/:roadmapId/milestones',
  asyncHandler(productivityController.addRoadmapMilestone),
);
productivityRouter.patch(
  '/roadmaps/:roadmapId/milestones/:milestoneId',
  asyncHandler(productivityController.toggleRoadmapMilestone),
);
productivityRouter.delete('/roadmaps/:roadmapId', asyncHandler(productivityController.deleteRoadmap));

// Tasks
productivityRouter.get('/tasks', asyncHandler(productivityController.listTasks));
productivityRouter.post('/tasks', asyncHandler(productivityController.createTask));
productivityRouter.patch('/tasks/:taskId', asyncHandler(productivityController.updateTask));
productivityRouter.patch('/tasks/:taskId/completion', asyncHandler(productivityController.setTaskCompleted));
productivityRouter.delete('/tasks/:taskId', asyncHandler(productivityController.deleteTask));
