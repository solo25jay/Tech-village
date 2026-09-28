import { api } from './api';

export interface AdminUserRow {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  createdAt: string;
  roles: { role: { id: string; name: string } }[];
}

export interface RoleRow {
  id: string;
  name: string;
}

export const adminUsersApi = {
  list: (search?: string) => api.get<{ data: AdminUserRow[] }>('/admin/users', { params: search ? { search } : {} }),
  listRoles: () => api.get<{ data: RoleRow[] }>('/admin/users/roles'),
  setStatus: (userId: string, status: string) => api.patch(`/admin/users/${userId}/status`, { status }),
  assignRole: (userId: string, roleName: string) => api.post(`/admin/users/${userId}/roles`, { roleName }),
  removeRole: (userId: string, roleName: string) => api.delete(`/admin/users/${userId}/roles/${roleName}`),
};
