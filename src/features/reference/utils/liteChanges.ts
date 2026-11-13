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
    title: 'Users page finished on the real OneEngine.Api',
    summary:
      'Built on the lab-laptop version of the Users page (AppUser with userID, domainID, ' +
      'timeZoneID...). Added: Domain / Time Zone / Allowed Roles lists from the API, Home URL ' +
      'limited to the pages of the checked roles (POST /api/menu/byUserRole), edit opens with ' +
      'the saved values, save via POST /api/Users (no PUT) and delete. Each file starts with a ' +
      'comment listing what it does.',
    pages: [{ name: 'Configurations > User (list, Add User, Edit User)', status: 'changed' }],
    files: [
      {
        path: '.env',
        status: 'changed',
        note: 'Comment with the OneEngine.Api proxy address (only a comment line).',
      },
      {
        path: 'src/services/api/apiEndpoints.ts',
        status: 'changed',
        note: "users: '/Users'; lookups: timeZones '/timezones', domains, userRoles, menusByRole.",
      },
      {
        path: 'src/features/configurations/users/user.schema.ts',
        status: 'changed',
        note: 'Your AppUser and form rules, plus DomainOption, RoleOption, TimeZoneOption, HomeUrlOption.',
      },
      {
        path: 'src/features/configurations/users/user.api.ts',
        status: 'changed',
        note: 'Your list / get, plus save via POST, delete, and the domain / role / time zone / Home URL hooks.',
      },
      {
        path: 'src/features/configurations/users/UserListPage.tsx',
        status: 'changed',
        note: 'Your columns, plus names looked up by id, Allowed Roles and Home URL columns.',
      },
      {
        path: 'src/features/configurations/users/UserFormPage.tsx',
        status: 'changed',
        note: 'Your form and payload, plus API lists, roles drive Home URL, edit prefill. Debug console.log lines left out.',
      },
      {
        path: 'src/mocks/data/seed.ts',
        status: 'changed',
        note: 'usersSeed uses a small SeedUser type (only for the mock sign-in).',
      },
      {
        path: 'src/mocks/mockDb.ts',
        status: 'changed',
        note: 'create() takes an optional id.',
      },
      {
        path: 'src/mocks/handlers/index.ts',
        status: 'changed',
        note: 'New userAdminRoutes block: mock of the OneEngine.Api user endpoints with int ids.',
      },
    ],
  },
];

/** Files of the latest update, by path. */
export const LATEST_CHANGES: Record<string, FileChange> = Object.fromEntries(
  (LITE_UPDATES[0]?.files ?? []).map((f) => [f.path, f]),
);
