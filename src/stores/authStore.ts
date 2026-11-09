import { create } from 'zustand';
import type { AuthUser } from '@/features/auth/types/auth.types';
import { STORAGE_KEYS } from '@/utils/constants';

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
  /** `expired` shows the "session expired" notice; otherwise other open tabs are signed out too. */
  clearSession: (options?: { expired?: boolean }) => void;
  setAnonymous: () => void;
}

const signedOut = (expired: boolean) => ({
  user: null,
  accessToken: null,
  status: 'anonymous' as const,
  sessionExpired: expired,
});

/** Tells other tabs about a deliberate sign-out via a `storage` event (no token is stored). */
const broadcastSignOut = () => {
  try {
    localStorage.setItem(STORAGE_KEYS.signOut, String(Date.now()));
  } catch {
    // Storage unavailable: other tabs find out on their next API call (401).
  }
};

export const useAuthStore = create<AuthState>()((set) => ({
  status: 'unknown',
  user: null,
  accessToken: null,
  sessionExpired: false,
  setSession: (user, accessToken) =>
    set({ user, accessToken, status: 'authenticated', sessionExpired: false }),
  clearSession: (options) => {
    const expired = Boolean(options?.expired);
    set(signedOut(expired));
    if (!expired) broadcastSignOut();
  },
  setAnonymous: () => set({ status: 'anonymous' }),
}));

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEYS.signOut && useAuthStore.getState().status === 'authenticated') {
      useAuthStore.setState(signedOut(false));
    }
  });
}
