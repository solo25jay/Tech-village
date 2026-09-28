import { api } from './api';
import type { AuthUser } from '@/types/user';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export const authApi = {
  register(input: { email: string; password: string; firstName: string; lastName: string }) {
    return api.post('/auth/register', input);
  },
  login(input: { email: string; password: string }) {
    return api.post<{ data: LoginResponse }>('/auth/login', input);
  },
  refresh(refreshToken: string) {
    return api.post<{ data: { accessToken: string } }>('/auth/refresh', { refreshToken });
  },
  logout(refreshToken: string) {
    return api.post('/auth/logout', { refreshToken });
  },
  me() {
    return api.get<{ data: AuthUser }>('/users/me');
  },
};
