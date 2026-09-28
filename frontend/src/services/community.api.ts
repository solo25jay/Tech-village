import { api } from './api';

export interface CommunityAccessRow {
  id: string;
  communityType: 'GENERAL' | 'PROFESSIONAL';
  communityPlatform: 'DISCORD' | 'TELEGRAM';
  accessUrl: string | null;
  status: 'ELIGIBLE' | 'GRANTED' | 'REVOKED';
}

export interface MyCommunityAccess {
  access: CommunityAccessRow[];
  isProfessional: boolean;
  professionalOnboarding: string | null;
}

export interface ProfessionalProfileRow {
  id: string;
  userId: string;
  isQualified: boolean;
  qualifiedAt: string | null;
  user: { id: string; firstName: string; lastName: string; email: string };
}

export const communityApi = {
  me: () => api.get<{ data: MyCommunityAccess }>('/community/me'),
};

export const adminCommunityApi = {
  listProfessionals: () => api.get<{ data: ProfessionalProfileRow[] }>('/admin/community/professionals'),
  setQualification: (userId: string, isQualified: boolean) =>
    api.patch(`/admin/community/professionals/${userId}/qualification`, { isQualified }),
};
