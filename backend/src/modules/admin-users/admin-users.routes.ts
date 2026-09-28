import { Router } from 'express';
import { asyncHandler } from '@common/asyncHandler';
import { requireAuth } from '@middleware/auth.middleware';
import { requirePermission } from '@middleware/rbac.middleware';
import { adminUsersController } from './admin-users.controller';

export const adminUsersRouter = Router();

adminUsersRouter.use(requireAuth, requirePermission('admin:users:manage'));

adminUsersRouter.get('/', asyncHandler(adminUsersController.listUsers));
adminUsersRouter.get('/roles', asyncHandler(adminUsersController.listRoles));
adminUsersRouter.get('/:userId', asyncHandler(adminUsersController.getUser));
adminUsersRouter.patch('/:userId/status', asyncHandler(adminUsersController.setStatus));
adminUsersRouter.post('/:userId/roles', asyncHandler(adminUsersController.assignRole));
adminUsersRouter.delete('/:userId/roles/:roleName', asyncHandler(adminUsersController.removeRole));
