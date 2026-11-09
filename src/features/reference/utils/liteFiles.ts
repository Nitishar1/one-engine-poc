/**
 * Files of OneEngine Lite (the separate app in `lite/`) for the /ref2 typing reference, read
 * as raw text at build time.
 */
import {
  countLines,
  cmdFileLines,
  cmdFolderLines,
  type ReferenceGroup,
  type SourceFile,
} from './referenceUtils';

/** Folder name to create the project in on the lab laptop. */
export const LITE_FOLDER = 'oneEngine_lite';

const ROOT = '/lite/';

const modules: Record<string, unknown> = {
  ...import.meta.glob('/lite/src/**/*', {
    query: '?raw',
    import: 'default',
    eager: true,
  }),
  // `exhaustive` so dotfiles (.env.example, .gitignore, .prettierrc) are found too.
  ...import.meta.glob(
    [
      '/lite/package.json',
      '/lite/.env.example',
      '/lite/.gitignore',
      '/lite/.prettierrc',
      '/lite/.prettierignore',
      '/lite/tsconfig.json',
      '/lite/tsconfig.app.json',
      '/lite/tsconfig.node.json',
      '/lite/vite.config.ts',
      '/lite/index.html',
      '/lite/README.md',
    ],
    { query: '?raw', import: 'default', eager: true, exhaustive: true },
  ),
};

/**
 * Typing order: project setup, styles, shared code (types, utils, stores, API), components,
 * features, mock backend, then the app shell and start-up. Folders are matched by prefix, most
 * specific first; inside a folder files are alphabetical, except that a page's schema and api
 * come before its pages.
 */
const ORDER = [
  'package.json',
  '.env',
  '.prettierrc',
  '.prettierignore',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
  'vite.config.ts',
  'index.html',
  'src/vite-env.d.ts',
  'src/styles/tailwind.css',
  'src/styles/variables.css',
  'src/styles/themes.css',
  'src/styles/background.css',
  'src/styles/toaster.css',
  'src/styles/globals.css',
  'src/types/',
  'src/utils/constants.ts',
  'src/utils/sanitize.ts',
  'src/utils/',
  'src/config/env.ts',
  'src/config/routes.ts',
  'src/stores/',
  'src/services/api/apiEndpoints.ts',
  'src/services/api/axiosInstance.ts',
  'src/services/',
  'src/components/theme/themeTokens.ts',
  'src/components/theme/antdTheme.ts',
  'src/hooks/',
  'src/components/feedback/toastStore.ts',
  'src/components/feedback/',
  'src/components/theme/',
  'src/components/common/iconRegistry.ts',
  'src/components/common/',
  'src/features/navigation/',
  'src/components/layout/',
  'src/features/auth/types/',
  'src/features/auth/schemas/',
  'src/features/auth/services/',
  'src/features/auth/hooks/',
  'src/features/auth/',
  'src/features/errors/',
  'src/features/home/types/',
  'src/features/home/services/',
  'src/features/home/hooks/',
  'src/features/home/',
  'src/features/configurations/roles/',
  'src/features/configurations/domains/',
  'src/features/configurations/menus/',
  'src/features/configurations/users/',
  'src/features/configurations/agentParameters/',
  'src/features/configurations/appSettings/',
  'src/features/configurations/dataSources/',
  'src/features/configurations/reports/',
  'src/features/configurations/lockedAccounts/',
  'src/features/configurations/authorization/',
  'src/config/pageRegistry.ts',
  'src/mocks/handlers/types.ts',
  'src/mocks/',
  'src/app/queryClient.ts',
  'src/app/',
  'src/main.tsx',
];

/** Not needed to run the app: notes and git settings. */
const OPTIONAL = ['README.md', '.gitignore'];

/** Within a folder: types / schema / api first, then list page, then form page. */
const fileRank = (path: string) =>
  /\.schema\.ts$|types\.ts$/.test(path)
    ? 0
    : /\.api\.ts$/.test(path)
      ? 1
      : /ListPage\.tsx$/.test(path)
        ? 2
        : /FormPage\.tsx$/.test(path)
          ? 3
          : 1.5;

const contents: Record<string, string> = Object.fromEntries(
  Object.entries(modules).map(([path, text]) => [path.slice(ROOT.length), String(text)]),
);
// The app reads .env; the repo only has the template, so show it under the name to create.
if (contents['.env.example'] !== undefined) {
  contents['.env'] = contents['.env.example'];
  delete contents['.env.example'];
}

const rank = (path: string) => {
  if (OPTIONAL.includes(path)) return 2000 + OPTIONAL.indexOf(path);
  // Most specific matching prefix wins (an exact file before its folder).
  let best = -1;
  ORDER.forEach((prefix, i) => {
    const matches = path === prefix || (prefix.endsWith('/') && path.startsWith(prefix));
    if (matches && (best < 0 || prefix.length > ORDER[best].length)) best = i;
  });
  return best < 0 ? 1000 : best;
};

export const LITE_FILES: SourceFile[] = Object.keys(contents)
  .sort((a, b) => rank(a) - rank(b) || fileRank(a) - fileRank(b) || (a < b ? -1 : 1))
  .map((path) => ({
    path,
    content: contents[path],
    lines: countLines(contents[path]),
    group: OPTIONAL.includes(path) ? 'optional' : 'required',
  }));

export const LITE_GROUPS: ReferenceGroup[] = [
  { id: 'required', label: 'Required', required: true },
  { id: 'optional', label: 'Optional' },
];

export const LITE_FOLDER_LINES = cmdFolderLines(LITE_FILES);
export const LITE_FILE_LINES = cmdFileLines(LITE_FILES);
