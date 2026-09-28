import { api } from './api';

export interface MentorProfileSummary {
  id: string;
  title: string | null;
  bio: string | null;
  expertise: string[];
  isApproved: boolean;
  hourlyRate: string | null;
  ratingAverage: string | null;
  user: { id: string; firstName: string; lastName: string; avatarUrl: string | null; email?: string };
}

export type MentorshipStatus = 'REQUESTED' | 'ACCEPTED' | 'DECLINED' | 'ACTIVE' | 'ENDED';

export interface MentorshipSession {
  id: string;
  scheduledAt: string;
  durationMins: number;
  meetingProvider: string | null;
  meetingUrl: string | null;
  status: string;
}

export interface MenteeMentorship {
  id: string;
  status: MentorshipStatus;
  createdAt: string;
  mentor: { id: string; firstName: string; lastName: string; avatarUrl: string | null };
  mentorProfile: MentorProfileSummary | null;
  sessions: MentorshipSession[];
}

export interface MentorSideMentorship {
  id: string;
  status: MentorshipStatus;
  note: string | null;
  createdAt: string;
  mentee: { id: string; firstName: string; lastName: string; email: string; avatarUrl: string | null };
  sessions: MentorshipSession[];
}

export const mentorshipApi = {
  applyAsMentor: (input: { title?: string; bio?: string; expertise: string[]; hourlyRate?: number }) =>
    api.post('/mentorship/apply', input),
  listMentors: () => api.get<{ data: MentorProfileSummary[] }>('/mentorship/mentors'),
  requestMentorship: (mentorProfileId: string) => api.post('/mentorship/requests', { mentorProfileId }),
  myMentorships: () => api.get<{ data: MenteeMentorship[] }>('/mentorship/mine'),
  myUpcomingSessions: () => api.get('/mentorship/sessions/upcoming'),
};

export const mentorApi = {
  listMentorships: (status?: string) =>
    api.get<{ data: MentorSideMentorship[] }>('/mentor/mentorships', { params: status ? { status } : {} }),
  respondToRequest: (mentorshipId: string, accept: boolean) =>
    api.patch(`/mentor/mentorships/${mentorshipId}/respond`, { accept }),
  setNote: (mentorshipId: string, note: string) =>
    api.patch(`/mentor/mentorships/${mentorshipId}/note`, { note }),
  scheduleSession: (mentorshipId: string, input: { scheduledAt: string; durationMins: number; meetingUrl?: string }) =>
    api.post(`/mentor/mentorships/${mentorshipId}/sessions`, input),
  upcomingSessions: () => api.get('/mentor/sessions/upcoming'),
};

export const adminMentorshipApi = {
  listAll: () => api.get<{ data: MentorProfileSummary[] }>('/admin/mentors'),
  setApproval: (id: string, isApproved: boolean) => api.patch(`/admin/mentors/${id}/approval`, { isApproved }),
};
