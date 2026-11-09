import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '../services/authService';

/** Resolves the initial auth state once on startup by asking the backend for the current session. */
export function useSessionBootstrap() {
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (useAuthStore.getState().status !== 'unknown') return;
    let cancelled = false;
    authService
      .restoreSession()
      .then(({ user, accessToken }) => {
        if (!cancelled) useAuthStore.getState().setSession(user, accessToken);
      })
      .catch(() => {
        if (!cancelled) useAuthStore.getState().setAnonymous();
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
