import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/config/routes';
import { LoadingState } from '@/components/common/LoadingState';

/**
 * Gates authenticated routes on the client. This is a UX guard only; the backend must
 * authorise every request independently.
 */
export function ProtectedRoute() {
  const status = useAuthStore((s) => s.status);
  const signedOut = useAuthStore((s) => s.signedOut);
  const location = useLocation();

  if (status === 'unknown') return <LoadingState label="Restoring session..." fullHeight />;
  if (status === 'anonymous') {
    return (
      // Remember the page to return to, unless the user signed out on purpose.
      <Navigate
        to={ROUTES.login}
        replace
        state={signedOut ? undefined : { from: location.pathname + location.search }}
      />
    );
  }
  return <Outlet />;
}
