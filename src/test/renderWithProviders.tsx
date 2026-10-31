import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createMemoryRouter, type RouteObject } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

/** Renders `ui` (or a route tree) inside the same providers the app uses, with a memory router. */
export function renderWithProviders(
  ui: ReactElement | RouteObject[],
  {
    route = '/',
    queryClient = createTestQueryClient(),
  }: { route?: string; queryClient?: QueryClient } = {},
) {
  const routes: RouteObject[] = Array.isArray(ui) ? ui : [{ path: '*', element: ui }];
  const router = createMemoryRouter(routes, { initialEntries: [route] });
  return {
    router,
    ...render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </QueryClientProvider>,
    ),
  };
}
