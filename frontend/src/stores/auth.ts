import { defineStore } from 'pinia';
import type { AuthUser, RoleName } from '@/types/user';
import { authApi } from '@/services/auth.api';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: JSON.parse(localStorage.getItem('tv_user') ?? 'null'),
    accessToken: localStorage.getItem('tv_access_token'),
    refreshToken: localStorage.getItem('tv_refresh_token'),
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.accessToken),
    hasRole:
      (state) =>
      (...roles: RoleName[]) =>
        Boolean(state.user && roles.some((r) => state.user!.roles.includes(r))),
    // The primary role decides which layout/dashboard a user lands on
    // when they have more than one (e.g. professional who is also a mentor).
    primaryRole: (state): RoleName | null => {
      if (!state.user) return null;
      const priority: RoleName[] = ['super_admin', 'admin', 'company', 'mentor', 'professional', 'learner'];
      return priority.find((r) => state.user!.roles.includes(r)) ?? state.user.roles[0] ?? null;
    },
  },

  actions: {
    persist() {
      localStorage.setItem('tv_user', JSON.stringify(this.user));
      if (this.accessToken) localStorage.setItem('tv_access_token', this.accessToken);
      if (this.refreshToken) localStorage.setItem('tv_refresh_token', this.refreshToken);
    },

    clear() {
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      localStorage.removeItem('tv_user');
      localStorage.removeItem('tv_access_token');
      localStorage.removeItem('tv_refresh_token');
    },

    async login(email: string, password: string) {
      const { data } = await authApi.login({ email, password });
      this.user = data.data.user;
      this.accessToken = data.data.accessToken;
      this.refreshToken = data.data.refreshToken;
      this.persist();
    },

    async logout() {
      if (this.refreshToken) {
        try {
          await authApi.logout(this.refreshToken);
        } catch {
          // best-effort revoke; clear local session regardless
        }
      }
      this.clear();
    },

    async refreshAccessToken() {
      if (!this.refreshToken) throw new Error('No refresh token');
      const { data } = await authApi.refresh(this.refreshToken);
      this.accessToken = data.data.accessToken;
      this.persist();
    },

    async fetchCurrentUser() {
      const { data } = await authApi.me();
      this.user = data.data;
      this.persist();
    },
  },
});
