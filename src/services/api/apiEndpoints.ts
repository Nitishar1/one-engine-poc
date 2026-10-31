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
  aiAgentRun: (id: string) => `/ai-agents/${id}/run`,
  runbooks: '/runbooks',
  runbookRoles: '/runbooks/roles',
  reports: {
    executions: '/reports/executions',
  },
} as const;
