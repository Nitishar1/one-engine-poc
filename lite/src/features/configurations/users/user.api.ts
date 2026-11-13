/**
 * User API (OneEngine.Api).
 *
 * Functionality:
 * - list:   GET    /api/Users        -> grid rows (id = userID)
 * - get:    GET    /api/Users/{id}   -> the user shown in Edit User
 * - create: POST   /api/Users        -> body with userID 0
 * - update: POST   /api/Users        -> same body with the user's userID (the API has no PUT)
 * - remove: DELETE /api/Users/{id}
 * - Form lists: domains, time zones, roles, and the Home URLs allowed for the checked roles.
 */
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import type { RequestOptions } from '@/types/api.types';
import { ApiError } from '@/types/api.types';
import type { EntityId, EntityInput } from '@/types/common.types';
import { createCrudHooks } from '@/hooks/useCrudQueries';
import { apiClient, http } from '@/services/api/axiosInstance';
import { API_ENDPOINTS, resourcePath } from '@/services/api/apiEndpoints';
import { createCrudService } from '@/services/api/crudService';
import { sanitizePayload } from '@/utils/sanitize';
import type {
  AppUser,
  DomainOption,
  HomeUrlOption,
  RoleOption,
  TimeZoneOption,
} from './user.schema';

const crudService = createCrudService<AppUser>(API_ENDPOINTS.users);

/** "1,2" -> ['1', '2']. */
export const splitRoles = (allowedRoles?: string | null) =>
  String(allowedRoles ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

const toAppUser = (user: AppUser): AppUser => ({
  ...user,
  id: String(user.userID),
  roleIds: user.roleIds ?? splitRoles(user.allowedRoles),
  modifiedBy: user.modifiedBy ?? '',
  modifiedOn: user.modifiedOn ?? '',
});

/**
 * Save / delete may answer with only a message (no `data`), so any 2xx counts as success;
 * `{ success: false }` or an HTML page (SSO / proxy) is an error.
 */
function checkSaved(response: AxiosResponse<unknown>) {
  const body = response.data as { success?: boolean; message?: string } | string | null;
  const type = String(response.headers['content-type'] ?? '');
  if (body && typeof body === 'string' && !type.includes('json')) {
    throw new ApiError('Received an unexpected response from the server.', response.status);
  }
  if (body && typeof body === 'object' && body.success === false) {
    throw new ApiError(body.message ?? 'The request failed.', response.status);
  }
}

/** Create and update are the same call; the payload's userID decides which one it is. */
const saveUser = async (input: EntityInput<AppUser>): Promise<AppUser> => {
  const response = await apiClient.post<unknown>(API_ENDPOINTS.users, sanitizePayload(input));
  checkSaved(response);
  return input as AppUser;
};

export const userService = {
  ...crudService,

  list: async (options?: RequestOptions): Promise<AppUser[]> => {
    const users = await http.get<AppUser[]>(API_ENDPOINTS.users, undefined, options);
    return (users ?? []).filter((user) => !user.isDeleted).map(toAppUser);
  },

  get: async (id: EntityId, options?: RequestOptions): Promise<AppUser> => {
    const user = await http.get<AppUser | AppUser[]>(
      resourcePath(API_ENDPOINTS.users, id),
      undefined,
      options,
    );
    // Some endpoints wrap a single row in a list.
    const row = Array.isArray(user) ? user[0] : user;
    if (!row) throw new ApiError('The requested item was not found.', 404);
    return toAppUser(row);
  },

  create: saveUser,
  update: (_id: EntityId, input: EntityInput<AppUser>) => saveUser(input),

  remove: async (id: EntityId): Promise<void> => {
    checkSaved(await apiClient.delete<unknown>(resourcePath(API_ENDPOINTS.users, id)));
  },
};

export const userHooks = createCrudHooks('users', userService, 'User');

// ---------------------------------------------------------------- form lists

/** GET /api/timezones -> Time Zone dropdown. */
export const useTimeZones = () =>
  useQuery({
    queryKey: ['lookups', 'timezones'],
    queryFn: ({ signal }) =>
      http.get<TimeZoneOption[]>(API_ENDPOINTS.lookups.timeZones, undefined, { signal }),
    staleTime: Infinity,
  });

/** GET /api/domains -> Domain Name dropdown. */
export const useUserDomains = () =>
  useQuery({
    queryKey: ['lookups', 'domains'],
    queryFn: ({ signal }) =>
      http.get<DomainOption[]>(API_ENDPOINTS.lookups.domains, undefined, { signal }),
  });

/** GET /api/UserRoles -> Allowed Roles checkboxes (deleted roles left out). */
export const useUserRoles = () =>
  useQuery({
    queryKey: ['lookups', 'user-roles'],
    queryFn: async ({ signal }) => {
      const roles = await http.get<RoleOption[]>(API_ENDPOINTS.lookups.userRoles, undefined, {
        signal,
      });
      return (roles ?? []).filter((role) => !role.isDeleted);
    },
  });

/**
 * POST /api/menu/byUserRole { roleIds } -> Home URL dropdown: only the pages the checked roles
 * can open. Waits until at least one role is checked.
 */
export const useHomeUrls = (roleIds: string[]) => {
  const ids = [...roleIds].sort();
  return useQuery<HomeUrlOption[]>({
    queryKey: ['lookups', 'home-urls', ids],
    queryFn: async ({ signal }) => {
      const menus = await http.post<HomeUrlOption[]>(
        API_ENDPOINTS.lookups.menusByRole,
        { roleIds: ids.map(Number) },
        { signal },
      );
      return (menus ?? []).filter((menu) => menu.menuUrl);
    },
    enabled: ids.length > 0,
    // Keeps the old list on screen while the list for the new roles loads.
    placeholderData: keepPreviousData,
  });
};
