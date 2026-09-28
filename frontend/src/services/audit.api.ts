import { api } from './api';

export interface AuditLogRow {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: { firstName: string; lastName: string; email: string } | null;
}

export const auditApi = {
  list: (filters?: { entity?: string }) =>
    api.get<{ data: AuditLogRow[] }>('/admin/audit-logs', { params: filters ?? {} }),
};
