import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import { createCrudHooks } from '@/hooks/useCrudQueries';
import { apiClient } from '@/services/api/axiosInstance';
import { API_ENDPOINTS, resourcePath } from '@/services/api/apiEndpoints';
import type { CrudService } from '@/services/api/crudService';
import { ApiError } from '@/types/api.types';
import type { EntityInput } from '@/types/common.types';
import { sanitizePayload } from '@/utils/sanitize';
import type {
  AppUser,
  DomainOption,
  HomeUrlOption,
  RoleOption,
  TimeZoneOption,
} from './user.schema';

const ENDPOINTS = API_ENDPOINTS.userAdmin;

// ---------------------------------------------------------------- response handling

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Reads `{ data: ... }` (or a bare JSON value) from a OneEngine.Api response. Some endpoints
 * answer a save / delete with only a message, so a missing `data` is not an error here.
 */
function readData<T>(response: AxiosResponse<unknown>): T {
  if (response.status === 204) return undefined as T;
  const contentType = String(response.headers['content-type'] ?? '');
  const body = response.data;
  // An HTML body usually means an SSO / proxy login page answered instead of the API.
  if (body !== '' && body != null && !contentType.includes('json')) {
    throw new ApiError('Received an unexpected response from the server.', response.status);
  }
  if (isRecord(body)) {
    if (body.success === false) {
      const message = typeof body.message === 'string' ? body.message : 'The request failed.';
      throw new ApiError(message.slice(0, 300), response.status);
    }
    if ('data' in body) return body.data as T;
  }
  return body as T;
}

const asList = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

// ---------------------------------------------------------------- API <-> page model

/** User as OneEngine.Api sends and receives it (`POST /api/Users` body). */
interface ApiUser {
  userID: number | string;
  userName: string;
  domainID: number | string;
  timeZoneID: number | string;
  homeUrl: string;
  homeUrlID: number | string;
  allowedRoles: string;
  isActive: boolean;
  modifiedBy?: string | null;
  modifiedOn?: string | null;
}

/** First non-empty value among the given keys (the API is not consistent with casing). */
const pick = (row: Record<string, unknown>, ...keys: string[]) =>
  keys.map((k) => row[k]).find((v) => v !== undefined && v !== null && v !== '');

const idText = (value: unknown) => (value === undefined || value === null ? '' : String(value));

/** `"1,2"`, `"1, 2"`, `[1, 2]` -> `['1', '2']`. */
export const splitRoles = (value: unknown): string[] =>
  (Array.isArray(value) ? value.map(String) : String(value ?? '').split(','))
    .map((v) => v.trim())
    .filter(Boolean);

/** Sends numeric ids as numbers (the API uses int ids), anything else unchanged. */
const toApiId = (value: string) => (/^\d+$/.test(value) ? Number(value) : value);

export function fromApiUser(raw: unknown): AppUser {
  const row = isRecord(raw) ? raw : {};
  return {
    id: idText(pick(row, 'userID', 'userId', 'id')),
    userName: String(pick(row, 'userName') ?? ''),
    domainId: idText(pick(row, 'domainID', 'domainId')),
    timeZoneId: idText(pick(row, 'timeZoneID', 'timezoneID', 'timeZoneId', 'timezoneId')),
    homeUrl: String(pick(row, 'homeUrl', 'homeURL') ?? ''),
    // 0 means "not set".
    homeUrlId: idText(pick(row, 'homeUrlID', 'homeUrlId')).replace(/^0$/, ''),
    roleIds: splitRoles(pick(row, 'allowedRoles', 'roleIds')),
    isActive: row.isActive === undefined ? true : Boolean(row.isActive),
    modifiedBy: String(pick(row, 'modifiedBy', 'createdBy') ?? ''),
    modifiedOn: String(pick(row, 'modifiedOn', 'modifiedOnUtc', 'createdOnUtc') ?? ''),
  };
}

function toApiUser(id: string | undefined, input: EntityInput<AppUser>): ApiUser {
  return sanitizePayload({
    userID: id ? toApiId(id) : 0,
    userName: input.userName,
    domainID: toApiId(input.domainId),
    timeZoneID: toApiId(input.timeZoneId),
    homeUrl: input.homeUrl,
    homeUrlID: input.homeUrlId ? toApiId(input.homeUrlId) : 0,
    allowedRoles: input.roleIds.join(','),
    isActive: input.isActive,
  });
}

// ---------------------------------------------------------------- users CRUD

/**
 * OneEngine.Api has no PUT for users: `POST /api/Users` creates when `userID` is 0 and
 * updates the user with that id otherwise.
 */
export const userService: CrudService<AppUser> = {
  list: ({ signal } = {}) =>
    apiClient
      .get<unknown>(ENDPOINTS.users, { signal })
      .then((r) => asList(readData(r)).map(fromApiUser)),
  get: (id, { signal } = {}) =>
    apiClient.get<unknown>(resourcePath(ENDPOINTS.users, id), { signal }).then((r) => {
      const data = readData<unknown>(r);
      const row = Array.isArray(data) ? data[0] : data;
      if (!isRecord(row)) throw new ApiError('The requested item was not found.', 404);
      return fromApiUser(row);
    }),
  create: (input) =>
    apiClient
      .post<unknown>(ENDPOINTS.users, toApiUser(undefined, input))
      .then((r) => fromApiUser(readData(r))),
  update: (id, input) =>
    apiClient
      .post<unknown>(ENDPOINTS.users, toApiUser(id, input))
      .then((r) => fromApiUser(readData(r))),
  remove: (id) =>
    apiClient.delete<unknown>(resourcePath(ENDPOINTS.users, id)).then((r) => {
      readData(r);
    }),
};

export const userHooks = createCrudHooks('users', userService, 'User');

// ---------------------------------------------------------------- form option lists

const getList = <T>(url: string, signal?: AbortSignal) =>
  apiClient.get<unknown>(url, { signal }).then((r) => asList<T>(readData(r)));

/** GET /api/domains -> Domain Name dropdown. */
export const useUserDomains = () =>
  useQuery({
    queryKey: ['user-options', 'domains'],
    queryFn: ({ signal }) => getList<DomainOption>(ENDPOINTS.domains, signal),
  });

/** GET /api/UserRoles -> Allowed Roles checkboxes (deleted roles left out). */
export const useUserRoles = () =>
  useQuery({
    queryKey: ['user-options', 'roles'],
    queryFn: ({ signal }) =>
      getList<RoleOption & { isDeleted?: boolean }>(ENDPOINTS.roles, signal).then((roles) =>
        roles.filter((r) => !r.isDeleted),
      ),
  });

/** GET /api/timezones -> Time Zone dropdown. */
export const useTimeZones = () =>
  useQuery({
    queryKey: ['user-options', 'time-zones'],
    queryFn: ({ signal }) => getList<TimeZoneOption>(ENDPOINTS.timeZones, signal),
    staleTime: Infinity,
  });

/**
 * POST /api/menu/byUserRole -> Home URL dropdown: only the pages the selected roles can open.
 * Disabled until at least one role is selected.
 */
export const useHomeUrls = (roleIds: string[]) => {
  const sorted = [...roleIds].sort();
  return useQuery<HomeUrlOption[]>({
    queryKey: ['user-options', 'home-urls', sorted],
    queryFn: ({ signal }) =>
      apiClient
        .post<unknown>(ENDPOINTS.menusByRole, { roleIds: sorted.map(toApiId) }, { signal })
        .then((r) => asList<HomeUrlOption>(readData(r)).filter((m) => m.menuUrl)),
    enabled: sorted.length > 0,
    // Keeps the old list on screen while the list for the new roles loads.
    placeholderData: keepPreviousData,
  });
};
