import { api } from './api';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  technologies: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface Assessment {
  id: string;
  title: string;
  type: string;
  passScore: number;
}

export interface AssessmentAttempt {
  id: string;
  score: number;
  passed: boolean;
  attemptedAt: string;
  assessment: Assessment;
}

export interface Certificate {
  id: string;
  programmeName: string;
  skills: string[];
  issueDate: string;
  verificationCode: string;
}

export interface CertificateVerification {
  valid: boolean;
  holderName: string;
  programmeName: string;
  skills: string[];
  issueDate: string;
  verificationCode: string;
}

export const credentialsApi = {
  // Projects
  listMyProjects: () => api.get<{ data: Project[] }>('/credentials/projects'),
  createProject: (input: {
    name: string;
    description?: string;
    category?: string;
    technologies?: string[];
    githubUrl?: string;
    liveUrl?: string;
  }) => api.post<{ data: Project }>('/credentials/projects', input),
  markCompleted: (projectId: string) => api.patch(`/credentials/projects/${projectId}/complete`),
  deleteProject: (projectId: string) => api.delete(`/credentials/projects/${projectId}`),

  // Assessments
  listAssessments: () => api.get<{ data: Assessment[] }>('/credentials/assessments'),
  submitAttempt: (assessmentId: string, score: number) =>
    api.post(`/credentials/assessments/${assessmentId}/attempts`, { score }),
  myAttempts: () => api.get<{ data: AssessmentAttempt[] }>('/credentials/assessments/attempts/mine'),

  // Certificates
  myCertificates: () => api.get<{ data: Certificate[] }>('/credentials/certificates/mine'),
};

export const adminCredentialsApi = {
  createAssessment: (input: { title: string; type: string; passScore: number }) =>
    api.post('/admin/credentials/assessments', input),
  issueCertificate: (input: { userId: string; programmeName: string; skills?: string[] }) =>
    api.post('/admin/credentials/certificates', input),
  listAllCertificates: () => api.get('/admin/credentials/certificates'),
};

// Public — no auth token required, but the shared axios instance attaches
// one if present, which is harmless since this endpoint ignores it.
export const publicCredentialsApi = {
  verify: (code: string) => api.get<{ data: CertificateVerification }>(`/public/certificates/${code}`),
};
