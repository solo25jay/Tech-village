import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1',
});

api.interceptors.request.use((config) => {
  const auth = useAuthStore();
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  return config;
});

let refreshing: Promise<void> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const auth = useAuthStore();
    const original = error.config;

    if (error.response?.status === 401 && auth.refreshToken && !original._retry) {
      original._retry = true;
      refreshing ??= auth.refreshAccessToken().finally(() => {
        refreshing = null;
      });
      await refreshing;
      original.headers.Authorization = `Bearer ${auth.accessToken}`;
      return api(original);
    }

    return Promise.reject(error);
  },
);
