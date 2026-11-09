import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { AppLayout } from '../layout/AppLayout';
import { useAuth } from './AuthContext';

/**
 * Shows the app only to signed-in users; everyone else goes to the login page. This is for the
 * user experience only: the backend must still check the token on every request.
 */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <Spin fullscreen description="Loading..." />;
  if (status === 'signedOut') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <AppLayout />;
}
