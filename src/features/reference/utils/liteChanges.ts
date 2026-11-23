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
    date: '23 Nov 2026',
    title: 'Colourful Runbook Dashboard',
    summary:
      'The Runbook Dashboard now uses colour: gradient tiles with white text, green / red ' +
      'stacked bars for daily runs, a multi-colour donut, coloured ranking and recent-run badges.',
    pages: [{ name: 'Reports > Runbook Stats > Dashboard', status: 'changed' }],
    files: [
      {
        path: 'src/features/reports/runbookStats/RunbookDashboardPage.tsx',
        status: 'changed',
        note: 'Whole file replaced (colour palette at the top).',
      },
    ],
  },
  {
    date: '23 Nov 2026',
    title: 'Reports > Runbook Stats: Dashboard and Stats pages',
    summary:
      'Two new pages under Reports > Runbook Stats, with dummy data for now (in ' +
      'runbookStats.api.ts; each hook has a TODO with the real API call). Dashboard: totals, ' +
      'repositories by type, 14-day runs, most-run and recent runs. Stats: pick a runbook and ' +
      'Submit for an overview; click a stage to open its timeline and logs.',
    pages: [
      { name: 'Reports > Runbook Stats > Dashboard', status: 'new' },
      { name: 'Reports > Runbook Stats > Stats', status: 'new' },
    ],
    files: [
      {
        path: 'src/config/routes.ts',
        status: 'changed',
        note: 'runbookDashboard and runbookStats paths (must match the backend menu URLs).',
      },
      {
        path: 'src/features/reports/runbookStats/runbookStats.schema.ts',
        status: 'new',
        note: 'Types for the dashboard, dropdowns and run activity; Stats filter rules.',
      },
      {
        path: 'src/features/reports/runbookStats/runbookStats.api.ts',
        status: 'new',
        note: 'Hooks + dummy data. Swap each fetch... body for its TODO http call later.',
      },
      {
        path: 'src/features/reports/runbookStats/RunbookActivityView.tsx',
        status: 'new',
        note: 'Run overview, stage progress strip, expandable stages with Timeline / Logs.',
      },
      {
        path: 'src/features/reports/runbookStats/RunbookDashboardPage.tsx',
        status: 'new',
        note: 'Dashboard page.',
      },
      {
        path: 'src/features/reports/runbookStats/RunbookStatsPage.tsx',
        status: 'new',
        note: 'Stats page: Tools Name / Runbook / Submit, then the activity view.',
      },
      {
        path: 'src/config/pageRegistry.ts',
        status: 'changed',
        note: 'Registers the two pages (two entries at the end).',
      },
      {
        path: 'src/mocks/data/seed.ts',
        status: 'changed',
        note: 'Mock menus: Runbook Stats group with Dashboard and Stats under Reports.',
      },
    ],
  },
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
