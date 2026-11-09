import { createCrudHooks } from '@/hooks/useCrudQueries';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import { createCrudService } from '@/services/api/crudService';
import type { Role } from './role.schema';

export const roleService = createCrudService<Role>(API_ENDPOINTS.roles);
export const roleHooks = createCrudHooks('roles', roleService, 'Role');

/** Role id -> name, for grids that show role names. */
export function useRoleNames() {
  const roles = roleHooks.useList();
  const names = new Map((roles.data ?? []).map((r) => [r.id, r.roleName]));
  return (id?: string | null) => (id ? (names.get(id) ?? '-') : '');
}
