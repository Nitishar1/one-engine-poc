/**
 * Joins a collection path with URL-encoded id segments, so ids can never change the route
 * (`a/b`, `?x=1`, `..`). Use it for every path that contains a value.
 */
export function resourcePath(base: string, ...segments: Array<string | number>): string {
  return [
    base,
    ...segments.map((segment) => {
      const value = String(segment);
      if (!value.trim() || value === '.' || value === '..') {
        throw new Error(`Invalid path segment "${value}" for ${base}`);
      }
      return encodeURIComponent(value);
    }),
  ].join('/');
}

/** Every backend route used by the client, relative to VITE_API_BASE_URL. */
export const API_ENDPOINTS = {
  auth: {
    domains: '/auth/domains',
    login: '/auth/login',
    logout: '/auth/logout',
    session: '/auth/session',
    changePassword: '/auth/change-password',
  },
  /** Menu tree for the signed-in user; drives the sidebar and which pages can open. */
  navigation: '/navigation',
  dashboard: {
    summary: '/dashboard/summary',
  },
  /** Lists used by the user form (OneEngine.Api routes). */
  lookups: {
    timeZones: '/timezones',
    domains: '/domains',
    userRoles: '/UserRoles',
    /** POST { roleIds: number[] } -> menus those roles can open (Home URL list). */
    menusByRole: '/menu/byUserRole',
  },
  agentParameters: '/configurations/agent-parameters',
  appSettings: '/configurations/app-settings',
  roles: '/configurations/roles',
  /** OneEngine.Api users: GET list, GET/DELETE /:id, POST saves (userID 0 = new). */
  users: '/Users',
  authorization: (roleId: string) => resourcePath('/configurations/authorization', roleId),
  domains: '/configurations/domains',
  lockedAccounts: '/configurations/locked-accounts',
  unlockAccount: (id: string) => `${resourcePath('/configurations/locked-accounts', id)}/unlock`,
  menus: '/configurations/menus',
  reports: '/configurations/reports',
  dataSources: '/configurations/data-sources',
  validateDataSource: '/configurations/data-sources/validate',
} as const;
