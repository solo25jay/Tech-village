import { api } from './api';

export type EmailSegment = 'ALL_USERS' | 'LEARNERS' | 'MENTORS' | 'PROFESSIONALS' | 'COMPANIES';
export type EmailCampaignStatus = 'DRAFT' | 'SENDING' | 'SENT' | 'FAILED';

export interface EmailCampaign {
  id: string;
  subject: string;
  body: string;
  segment: EmailSegment;
  status: EmailCampaignStatus;
  recipientCount: number | null;
  sentAt: string | null;
  createdAt: string;
  createdBy: { firstName: string; lastName: string };
}

export const emailsApi = {
  list: () => api.get<{ data: EmailCampaign[] }>('/admin/emails'),
  createDraft: (input: { subject: string; body: string; segment: EmailSegment }) =>
    api.post<{ data: EmailCampaign }>('/admin/emails', input),
  send: (campaignId: string) => api.post(`/admin/emails/${campaignId}/send`),
};
