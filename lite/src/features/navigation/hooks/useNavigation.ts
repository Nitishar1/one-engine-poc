import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { navigationService } from '../services/navigationService';
import { buildBreadcrumbs, findNavMatch, flattenNav, toNavItems } from '../utils/navTree';

export const NAVIGATION_QUERY_KEY = ['navigation'] as const;

/**
 * The signed-in user's menu from the backend, plus helpers derived from it. Cached by TanStack
 * Query, so every component can call this; saving menus or authorization refreshes it.
 */
export function useNavigation() {
  const query = useQuery({
    queryKey: NAVIGATION_QUERY_KEY,
    queryFn: ({ signal }) => navigationService.get({ signal }),
    staleTime: 5 * 60_000,
  });

  return useMemo(() => {
    const items = toNavItems(query.data ?? []);
    const flat = flattenNav(items);
    return {
      items,
      /** Every page the user may open, in menu order. */
      pages: flat.map((m) => m.item),
      /** The same pages with the groups above them (for search). */
      flat,
      isLoading: query.isLoading,
      error: query.error,
      refetch: query.refetch,
      findMatch: (pathname: string) => findNavMatch(flat, pathname),
      breadcrumbs: (pathname: string) => buildBreadcrumbs(flat, pathname),
    };
  }, [query.data, query.isLoading, query.error, query.refetch]);
}
