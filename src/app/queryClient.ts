import { QueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { ApiError } from '@/types/api.types';
import { QUERY_STALE_TIME } from '@/utils/constants';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME,
      refetchOnWindowFocus: false,
      // Client errors (4xx) will not succeed on retry.
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status >= 400 && error.status < 500) &&
        failureCount < 2,
    },
    mutations: { retry: false },
  },
});

// Drop every cached response when the session ends (sign-out, expiry, another tab), so the
// next user of this browser never sees the previous user's data.
useAuthStore.subscribe((state, prev) => {
  if (prev.status === 'authenticated' && state.status !== 'authenticated') queryClient.clear();
});
