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
  dashboard: {
    summary: '/dashboard/summary',
  },
  ciTypes: '/ci-types',
  ciMasters: '/ci-masters',
  ciRelationships: '/ci-relationships',
  agents: '/agents',
  aiModels: '/ai-models',
  aiAgents: '/ai-agents',
  aiAgentRun: (id: string) => `${resourcePath('/ai-agents', id)}/run`,
  runbooks: '/runbooks',
  runbookRoles: '/runbooks/roles',
  reports: {
    executions: '/reports/executions',
  },
} as const;
