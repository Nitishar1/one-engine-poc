/**
 * Paths of the pages this app implements. Which of them a user can open comes from the backend
 * menu (GET /navigation); src/config/pageRegistry.ts maps each path to its component.
 */
export const ROUTES = {
  login: '/login',
  home: '/home',
  agentParameters: '/configurations/agent-parameters',
  appSettings: '/configurations/app-settings',
  roles: '/configurations/roles',
  users: '/users',
  authorization: '/configurations/authorization',
  domains: '/domains',
  lockedAccounts: '/configurations/locked-accounts',
  menus: '/menus',
  reports: '/configurations/report-designer',
  dataSources: '/configurations/data-sources',
} as const;

/** Create page below a list page, e.g. /configurations/roles/new. */
export const newPath = (listPath: string) => `${listPath}/new`;

/** Edit page below a list page, e.g. /configurations/roles/role-1/edit. */
export const editPath = (listPath: string, id: string) =>
  `${listPath}/${encodeURIComponent(id)}/edit`;
