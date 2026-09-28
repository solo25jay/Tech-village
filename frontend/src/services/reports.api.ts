import { api } from './api';

export interface ReportsSummary {
  users: { total: number; active: number; learners: number; mentors: number; professionals: number; companies: number };
  learning: { enrollments: number; completedEnrollments: number; completionRatePercent: number; certificatesIssued: number };
  mentorship: { activeMentorships: number };
  events: { upcoming: number };
  jobs: { openJobs: number; applications: number; applicationsByStatus: { status: string; count: number }[] };
  community: { qualifiedProfessionals: number };
  revenueKobo: number;
  registrationsLast30Days: { date: string; count: number }[];
}

export interface SettingRow {
  key: string;
  label: string;
  value: string;
}

export const reportsApi = {
  summary: () => api.get<{ data: ReportsSummary }>('/admin/reports/summary'),
};

export const settingsApi = {
  list: () => api.get<{ data: SettingRow[] }>('/admin/settings'),
  update: (key: string, value: string) => api.put(`/admin/settings/${key}`, { value }),
};
