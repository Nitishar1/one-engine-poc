import { create } from 'zustand';
import type { AuthUser } from '@/features/auth/types/auth.types';

export type AuthStatus = 'unknown' | 'authenticated' | 'anonymous';

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  /**
   * The access token lives in memory only. Persistent sessions rely on an httpOnly refresh
   * cookie set by the backend, so nothing sensitive is written to Web Storage.
   */
  accessToken: string | null;
  sessionExpired: boolean;
  setSession: (user: AuthUser, accessToken: string) => void;
  clearSession: (options?: { expired?: boolean }) => void;
  setAnonymous: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  status: 'unknown',
  user: null,
  accessToken: null,
  sessionExpired: false,
  setSession: (user, accessToken) =>
    set({ user, accessToken, status: 'authenticated', sessionExpired: false }),
  clearSession: (options) =>
    set({
      user: null,
      accessToken: null,
      status: 'anonymous',
      sessionExpired: Boolean(options?.expired),
    }),
  setAnonymous: () => set({ status: 'anonymous' }),
}));
