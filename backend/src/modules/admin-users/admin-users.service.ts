import { ApiError } from '@common/ApiError';
import { recordAuditLog } from '@common/audit';
import { adminUsersRepository } from './admin-users.repository';

const PROTECTED_ROLES = ['admin', 'super_admin'];

export const adminUsersService = {
  listUsers(searchText?: string) {
    return adminUsersRepository.listUsers(searchText);
  },

  async getUser(id: string) {
    const user = await adminUsersRepository.findById(id);
    if (!user) throw ApiError.notFound('User not found');
    return user;
  },

  async setStatus(actingAdminId: string, userId: string, status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED') {
    if (userId === actingAdminId && status !== 'ACTIVE') {
      throw ApiError.badRequest('You cannot suspend or deactivate your own account');
    }
    const user = await adminUsersRepository.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    const updated = await adminUsersRepository.setStatus(userId, status);
    await recordAuditLog({
      actorId: actingAdminId,
      action: `user.status.${status.toLowerCase()}`,
      entity: 'User',
      entityId: userId,
    });
    return updated;
  },

  listRoles() {
    return adminUsersRepository.listRoles();
  },

  async assignRole(actingAdminId: string, userId: string, roleName: string) {
    const role = await adminUsersRepository.findRoleByName(roleName);
    if (!role) throw ApiError.notFound('Role not found');

    const existing = await adminUsersRepository.hasRole(userId, role.id);
    if (existing) throw ApiError.conflict('User already has this role');

    await adminUsersRepository.assignRole(userId, role.id);
    await recordAuditLog({
      actorId: actingAdminId,
      action: 'user.role.assigned',
      entity: 'User',
      entityId: userId,
      metadata: { role: roleName },
    });
    return adminUsersRepository.findById(userId);
  },

  async removeRole(actingAdminId: string, userId: string, roleName: string) {
    if (userId === actingAdminId && PROTECTED_ROLES.includes(roleName)) {
      throw ApiError.badRequest('You cannot remove your own admin access');
    }

    const role = await adminUsersRepository.findRoleByName(roleName);
    if (!role) throw ApiError.notFound('Role not found');

    const existing = await adminUsersRepository.hasRole(userId, role.id);
    if (!existing) throw ApiError.notFound('User does not have this role');

    await adminUsersRepository.removeRole(userId, role.id);
    await recordAuditLog({
      actorId: actingAdminId,
      action: 'user.role.removed',
      entity: 'User',
      entityId: userId,
      metadata: { role: roleName },
    });
    return adminUsersRepository.findById(userId);
  },
};
