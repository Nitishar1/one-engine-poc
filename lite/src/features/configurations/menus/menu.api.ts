import { NAVIGATION_QUERY_KEY } from '@/features/navigation/hooks/useNavigation';
import { createCrudHooks } from '@/hooks/useCrudQueries';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import { createCrudService } from '@/services/api/crudService';
import type { MenuEntity } from './menu.schema';

export const menuService = createCrudService<MenuEntity>(API_ENDPOINTS.menus);
// Saving a menu changes the sidebar, so the navigation is reloaded too.
export const menuHooks = createCrudHooks('menus', menuService, 'Menu', [NAVIGATION_QUERY_KEY]);

/** Menu id -> name, for grids that show the parent menu. */
export function useMenuNames() {
  const menus = menuHooks.useList();
  const names = new Map((menus.data ?? []).map((m) => [m.id, m.menuName]));
  return (id?: string | null) => (id ? (names.get(id) ?? '-') : '');
}
