import { lazy } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ROUTES } from '@/config/routes';
import RouteErrorPage from '@/features/errors/pages/RouteErrorPage';
import { DynamicRoutes } from './DynamicRoutes';
import { ProtectedRoute } from './ProtectedRoute';
import { RootLayout } from './RootLayout';

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: ROUTES.login, element: <LoginPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/',
            element: <AppLayout />,
            errorElement: <RouteErrorPage />,
            // Every page inside the shell comes from the backend menu.
            children: [{ path: '*', element: <DynamicRoutes /> }],
          },
        ],
      },
    ],
  },
];

export const createAppRouter = () => createBrowserRouter(routes);
