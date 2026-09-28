import { api } from './api';

export type PaymentPurpose = 'COURSE' | 'MENTORSHIP' | 'EVENT' | 'CERTIFICATION' | 'SUBSCRIPTION' | 'COMPANY_SERVICE';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface Payment {
  id: string;
  purpose: PaymentPurpose;
  referenceId: string | null;
  amountKobo: number;
  currency: string;
  provider: string;
  providerReference: string;
  status: PaymentStatus;
  createdAt: string;
  user?: { firstName: string; lastName: string; email: string };
}

export const paymentsApi = {
  initiate: (input: { purpose: PaymentPurpose; referenceId?: string; amountKobo: number; currency?: string }) =>
    api.post<{ data: { authorizationUrl: string; reference: string } }>('/payments/initiate', input),
  verify: (reference: string) => api.get(`/payments/verify/${reference}`),
  myPayments: () => api.get<{ data: Payment[] }>('/payments/mine'),
};

export const adminPaymentsApi = {
  listAll: () => api.get<{ data: Payment[] }>('/admin/payments'),
  revenueSummary: () => api.get<{ data: { totalRevenueKobo: number } }>('/admin/payments/revenue'),
};
