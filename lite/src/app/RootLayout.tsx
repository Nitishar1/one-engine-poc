import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { LoadingState } from '@/components/common/LoadingState';
import { useSessionBootstrap } from '@/features/auth/hooks/useSessionBootstrap';

/** Top-level route element: restores the session once and hosts lazily loaded pages. */
export function RootLayout() {
  useSessionBootstrap();
  return (
    <Suspense fallback={<LoadingState fullHeight />}>
      <Outlet />
    </Suspense>
  );
}
