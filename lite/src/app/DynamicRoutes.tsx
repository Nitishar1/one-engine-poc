import { useMemo } from 'react';
import { Navigate, useRoutes, type RouteObject } from 'react-router-dom';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { PAGE_REGISTRY } from '@/config/pageRegistry';
import { ROUTES } from '@/config/routes';
import ComingSoonPage from '@/features/errors/pages/ComingSoonPage';
import NotFoundPage from '@/features/errors/pages/NotFoundPage';
import { useNavigation } from '@/features/navigation/hooks/useNavigation';

/**
 * Routes built from the signed-in user's menu (GET /navigation): only pages in the menu can be
 * opened. Each menu path opens its registered page (plus /new and /:id/edit for forms), or
 * "coming soon" when no page is registered for it yet.
 */
export function DynamicRoutes() {
  const nav = useNavigation();

  const routes = useMemo<RouteObject[]>(() => {
    const pageRoutes = nav.pages.flatMap(({ path, label }): RouteObject[] => {
      if (!path) return [];
      const entry = PAGE_REGISTRY[path];
      if (!entry) return [{ path, element: <ComingSoonPage title={label} /> }];
      const Form = entry.form;
      return [
        { path, element: <entry.list /> },
        ...(Form
          ? [
              { path: `${path}/new`, element: <Form /> },
              { path: `${path}/:id/edit`, element: <Form /> },
            ]
          : []),
      ];
    });
    const start = nav.pages.some((p) => p.path === ROUTES.home) ? ROUTES.home : nav.pages[0]?.path;
    return [
      ...pageRoutes,
      { path: '/', element: start ? <Navigate to={start} replace /> : <NotFoundPage /> },
      { path: '*', element: <NotFoundPage /> },
    ];
  }, [nav.pages]);

  const element = useRoutes(routes);

  if (nav.error) return <ErrorState error={nav.error} onRetry={() => void nav.refetch()} />;
  if (nav.isLoading) return <LoadingState label="Loading menu..." fullHeight />;
  return element;
}
