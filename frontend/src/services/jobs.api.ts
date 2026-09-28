import { api } from './api';

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT' | 'FREELANCE' | 'APPRENTICESHIP' | 'VOLUNTEER';
export type ApplicationStatus = 'SUBMITTED' | 'REVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED';

export interface JobListing {
  id: string;
  title: string;
  description: string;
  type: JobType;
  location: string | null;
  remote: boolean;
  skills: string[];
  isPublished: boolean;
  createdAt: string;
  company: { id: string; name: string; logoUrl: string | null };
  _count?: { applications: number };
}

export interface MyApplication {
  id: string;
  status: ApplicationStatus;
  createdAt: string;
  job: JobListing & { company: { name: string } };
}

export interface Company {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  industry: string | null;
}

export interface JobApplicant {
  id: string;
  status: ApplicationStatus;
  coverNote: string | null;
  createdAt: string;
  applicant: { id: string; firstName: string; lastName: string; email: string };
}

export const jobsApi = {
  listOpen: () => api.get<{ data: JobListing[] }>('/jobs'),
  getJob: (jobId: string) => api.get<{ data: JobListing }>(`/jobs/${jobId}`),
  apply: (jobId: string, coverNote?: string) => api.post(`/jobs/${jobId}/apply`, { coverNote }),
  myApplications: () => api.get<{ data: MyApplication[] }>('/jobs/applications/mine'),
};

export const companyApi = {
  getMyCompany: () => api.get<{ data: Company | null }>('/company/profile'),
  upsertMyCompany: (input: { name: string; description?: string; website?: string; industry?: string }) =>
    api.put('/company/profile', input),
  listMyJobs: () => api.get<{ data: JobListing[] }>('/company/jobs'),
  createJob: (input: {
    title: string;
    description: string;
    type: JobType;
    location?: string;
    remote?: boolean;
    skills?: string[];
  }) => api.post('/company/jobs', input),
  publishJob: (jobId: string, isPublished: boolean) => api.patch(`/company/jobs/${jobId}/publish`, { isPublished }),
  listApplications: (jobId: string) => api.get<{ data: JobApplicant[] }>(`/company/jobs/${jobId}/applications`),
  updateApplicationStatus: (applicationId: string, status: ApplicationStatus) =>
    api.patch(`/company/applications/${applicationId}/status`, { status }),
};
