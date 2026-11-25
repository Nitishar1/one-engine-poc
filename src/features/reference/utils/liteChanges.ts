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
    date: '26 Nov 2026',
    title: 'New sign-in page: centred card on a deep blue AI background',
    summary:
      'The sign-in page is no longer split in two. Brand and form sit in the middle on a deep ' +
      'blue background with slowly drifting aurora lights (blue / cyan / violet / teal), a ' +
      'fine grid fading out from the centre, stars, dashed links and floating agent cards. ' +
      'No logo above the name. The card has a glowing gradient ' +
      'border, fields with icons inside and one Sign in button (no SSO); Privacy Notice link ' +
      'under it. Same look in light and dark mode.',
    pages: [{ name: 'Sign in', status: 'changed' }],
    files: [
      {
        path: 'src/features/auth/pages/LoginPage.tsx',
        status: 'changed',
        note: 'Whole file: LOGIN_THEME, CHIPS, LoginBackground and the centred card.',
      },
      {
        path: 'src/styles/background.css',
        status: 'changed',
        note: 'The "Sign-in page" section (to the end of the file) is replaced.',
      },
    ],
  },
  {
    date: '26 Nov 2026',
    title: 'Runbook Execution Details: multi-select, request type, status filter, logs',
    summary:
      'Stats page title is now "Runbook Execution Details". Runbook is a multi-select with ' +
      '"All runbooks"; new Request Type filter; the Runbook runs grid has a status filter. ' +
      'Created / Modified replaced by Execution Start Time, Execution End Time and Executed By. ' +
      'Pop-up: Processes tab (START / END show only their date and time; other processes ' +
      'expand to inputs / output) and a Logs tab like the old OETimeLineReport page. Request ' +
      'types are All / Web / Scheduled (All by default); Executed By is system for Web and ' +
      'scheduler for Scheduled.',
    pages: [{ name: 'Reports > Runbook Stats > Stats', status: 'changed' }],
    files: [
      {
        path: 'src/features/reports/runbookStats/stats/runbookStats.schema.ts',
        status: 'changed',
        note: 'Stats part: ALL_RUNBOOKS, runbookIds + requestType filter, execution times, ExecutedOn, TriggerLog.',
      },
      {
        path: 'src/features/reports/runbookStats/stats/runbookStats.api.ts',
        status: 'changed',
        note: 'From DUMMY_RUNBOOKS to the end: new dummy data, useRequestTypes, useTriggerLogs.',
      },
      {
        path: 'src/features/reports/runbookStats/stats/RunbookStatsPage.tsx',
        status: 'changed',
        note: 'Whole file: new filters, status filter on the grid, new columns, new title.',
      },
      {
        path: 'src/features/reports/runbookStats/stats/TriggerDetailsModal.tsx',
        status: 'changed',
        note: 'Whole file: Processes / Logs tabs.',
      },
    ],
  },
  {
    date: '25 Nov 2026',
    title: 'Runbook Stats page: date filter, overview, grid and process pop-up',
    summary:
      'Stats page redone: Tools Name removed; filter is Runbook (optional) + From / To Date + ' +
      'Search. Below it an overview (totals, status, by request type / monitoring tool) and a ' +
      'grid of runbook runs. Clicking a row opens a pop-up with the processes as a timeline; ' +
      'click a ProcessName for its input parameters and output. DELETE ' +
      'stats/RunbookActivityView.tsx (no longer used).',
    pages: [{ name: 'Reports > Runbook Stats > Stats', status: 'changed' }],
    files: [
      {
        path: 'src/features/reports/runbookStats/stats/runbookStats.schema.ts',
        status: 'changed',
        note: 'Whole file: new filter rules (dates), RunbookTrigger, TriggerProcess, ProcessParameter.',
      },
      {
        path: 'src/features/reports/runbookStats/stats/runbookStats.api.ts',
        status: 'changed',
        note: 'Whole file: useRunbooks, useRunbookTriggers(filter), useTriggerProcesses(id) + dummy data.',
      },
      {
        path: 'src/features/reports/runbookStats/stats/RunbookStatsPage.tsx',
        status: 'changed',
        note: 'Whole file: filter, overview, grid; row click opens the pop-up.',
      },
      {
        path: 'src/features/reports/runbookStats/stats/TriggerDetailsModal.tsx',
        status: 'new',
        note: 'Pop-up: trigger details and the process timeline with inputs / output.',
      },
    ],
  },
  {
    date: '23 Nov 2026',
    title: 'Runbook Stats split into dashboard / stats folders; colourful sidebar',
    summary:
      'Runbook Stats files now live in two folders (as on the lab laptop): dashboard/ holds ' +
      'RunbookDashboardPage.tsx, stats/ holds the rest. The sidebar gives every menu its own ' +
      'colour: tinted icon tiles, and the active page is highlighted in its menu colour.',
    pages: [
      { name: 'Sidebar (all pages)', status: 'changed' },
      { name: 'Reports > Runbook Stats > Dashboard', status: 'changed' },
    ],
    files: [
      {
        path: 'src/components/layout/SidebarMenu.tsx',
        status: 'changed',
        note: 'MENU_TONES colour list; toMenuItems gives each menu a --tone and an icon tile.',
      },
      {
        path: 'src/styles/themes.css',
        status: 'changed',
        note: 'Sidebar menu section: .oe-nav-icon tile, active item / accent bar / guide line in --tone.',
      },
      {
        path: 'src/features/reports/runbookStats/dashboard/RunbookDashboardPage.tsx',
        status: 'changed',
        note: "Moved into dashboard/; imports now '../stats/runbookStats.api' and '../stats/runbookStats.schema'.",
      },
      {
        path: 'src/config/pageRegistry.ts',
        status: 'changed',
        note: 'Import paths: runbookStats/dashboard/RunbookDashboardPage and runbookStats/stats/RunbookStatsPage.',
      },
    ],
  },
  {
    date: '23 Nov 2026',
    title: 'Colourful Runbook Dashboard',
    summary:
      'The Runbook Dashboard now uses colour: gradient tiles with white text, green / red ' +
      'stacked bars for daily runs, a multi-colour donut, coloured ranking and recent-run badges.',
    pages: [{ name: 'Reports > Runbook Stats > Dashboard', status: 'changed' }],
    files: [
      {
        path: 'src/features/reports/runbookStats/dashboard/RunbookDashboardPage.tsx',
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
        path: 'src/features/reports/runbookStats/stats/runbookStats.schema.ts',
        status: 'new',
        note: 'Types for the dashboard, dropdowns and run activity; Stats filter rules.',
      },
      {
        path: 'src/features/reports/runbookStats/stats/runbookStats.api.ts',
        status: 'new',
        note: 'Hooks + dummy data. Swap each fetch... body for its TODO http call later.',
      },
      {
        path: 'src/features/reports/runbookStats/stats/RunbookActivityView.tsx',
        status: 'new',
        note: 'Run overview, stage progress strip, expandable stages with Timeline / Logs.',
      },
      {
        path: 'src/features/reports/runbookStats/dashboard/RunbookDashboardPage.tsx',
        status: 'new',
        note: 'Dashboard page.',
      },
      {
        path: 'src/features/reports/runbookStats/stats/RunbookStatsPage.tsx',
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
