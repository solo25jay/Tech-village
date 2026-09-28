import { Router } from 'express';
import { asyncHandler } from '@common/asyncHandler';
import { requireAuth } from '@middleware/auth.middleware';
import { requirePermission } from '@middleware/rbac.middleware';
import { auditController } from './audit.controller';

export const auditRouter = Router();

// Reuses admin:reports:view — audit visibility is a reporting/oversight
// concern, not a separate permission, to avoid over-fragmenting RBAC.
auditRouter.use(requireAuth, requirePermission('admin:reports:view'));

auditRouter.get('/', asyncHandler(auditController.list));
