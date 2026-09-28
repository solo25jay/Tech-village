import { Router } from 'express';
import { asyncHandler } from '@common/asyncHandler';
import { requireAuth } from '@middleware/auth.middleware';
import { credentialsController } from './credentials.controller';

export const credentialsRouter = Router();

credentialsRouter.use(requireAuth);

// Projects
credentialsRouter.get('/projects', asyncHandler(credentialsController.listMyProjects));
credentialsRouter.post('/projects', asyncHandler(credentialsController.createProject));
credentialsRouter.patch('/projects/:projectId', asyncHandler(credentialsController.updateProject));
credentialsRouter.patch('/projects/:projectId/complete', asyncHandler(credentialsController.markCompleted));
credentialsRouter.delete('/projects/:projectId', asyncHandler(credentialsController.deleteProject));

// Assessments
credentialsRouter.get('/assessments', asyncHandler(credentialsController.listAssessments));
credentialsRouter.post('/assessments/:assessmentId/attempts', asyncHandler(credentialsController.submitAttempt));
credentialsRouter.get('/assessments/attempts/mine', asyncHandler(credentialsController.myAttempts));

// Certificates
credentialsRouter.get('/certificates/mine', asyncHandler(credentialsController.myCertificates));
