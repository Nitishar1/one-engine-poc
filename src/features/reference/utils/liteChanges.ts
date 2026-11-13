/**
 * What changed in OneEngine Lite, newest update first, so the lab laptop copy can be brought up
 * to date without retyping everything. Paths are as listed on /ref2 (`.env`, not `.env.example`).
 * Add a new entry at the top for every change to `lite/`.
 */

export type ChangeStatus = 'new' | 'changed';

export interface FileChange {
  path: string;
  status: ChangeStatus;
  /** What is different in this file, in a few words. */
  note: string;
}

export interface LiteUpdate {
  date: string;
  title: string;
  summary: string;
  /** App pages that look or behave differently, e.g. 'Configurations > User'. */
  pages: { name: string; status: ChangeStatus }[];
  files: FileChange[];
}

export const LITE_UPDATES: LiteUpdate[] = [
  {
    date: '13 Nov 2026',
    title: 'Users page on the real OneEngine.Api',
    summary:
      'Add / Edit / Delete User now use /api/Users. Domain, Time Zone and Allowed Roles come from ' +
      'the API, and Home URL only lists the pages the checked roles can open ' +
      '(POST /api/menu/byUserRole). Edit opens with the saved values filled in.',
    pages: [{ name: 'Configurations > User (list, Add User, Edit User)', status: 'changed' }],
    files: [
      {
        path: '.env',
        status: 'changed',
        note: 'Comment with the OneEngine.Api proxy address (only a comment line).',
      },
      {
        path: 'src/config/routes.ts',
        status: 'changed',
        note: 'users: /users, domains: /domains, menus: /menus (no /configurations prefix).',
      },
      {
        path: 'src/services/api/apiEndpoints.ts',
        status: 'changed',
        note: 'New userAdmin block (/Users, /domains, /UserRoles, /timezones, /menu/byUserRole); lookups and users removed.',
      },
      {
        path: 'src/features/configurations/users/user.schema.ts',
        status: 'changed',
        note: 'timeZoneId, homeUrlId, isActive; option types for the API lists.',
      },
      {
        path: 'src/features/configurations/users/user.api.ts',
        status: 'changed',
        note: 'Rewritten: OneEngine.Api user service and the dropdown / Home URL hooks.',
      },
      {
        path: 'src/features/configurations/users/UserListPage.tsx',
        status: 'changed',
        note: 'Rewritten: names from the API lists, Home URL and Status columns.',
      },
      {
        path: 'src/features/configurations/users/UserFormPage.tsx',
        status: 'changed',
        note: 'Rewritten: API dropdowns, roles drive Home URL, Active checkbox, edit prefill.',
      },
      {
        path: 'src/mocks/data/seed.ts',
        status: 'changed',
        note: 'Menu paths /users, /domains, /menus; users get timeZoneId, homeUrlId, isActive.',
      },
      {
        path: 'src/mocks/handlers/index.ts',
        status: 'changed',
        note: 'New userAdminRoutes block (mock of the OneEngine.Api user endpoints); old users / time-zone routes removed.',
      },
    ],
  },
];

/** Files of the latest update, by path. */
export const LATEST_CHANGES: Record<string, FileChange> = Object.fromEntries(
  (LITE_UPDATES[0]?.files ?? []).map((f) => [f.path, f]),
);
