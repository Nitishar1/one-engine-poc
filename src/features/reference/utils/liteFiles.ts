/**
 * Files of OneEngine Lite (the separate app in `lite/`) for the /ref2 typing reference, read
 * as raw text at build time.
 */
import { countLines, mkdirCommand, type ReferenceGroup, type SourceFile } from './referenceUtils';

/** Folder name to create the project in on the lab laptop. */
export const LITE_FOLDER = 'oneEngine_lite';

const ROOT = '/lite/';

const modules: Record<string, unknown> = {
  ...import.meta.glob('/lite/src/**/*', {
    query: '?raw',
    import: 'default',
    eager: true,
  }),
  // `exhaustive` so dotfiles (.env.example, .gitignore) are found too.
  ...import.meta.glob(
    [
      '/lite/package.json',
      '/lite/.env.example',
      '/lite/.gitignore',
      '/lite/tsconfig.json',
      '/lite/vite.config.ts',
      '/lite/index.html',
      '/lite/README.md',
    ],
    { query: '?raw', import: 'default', eager: true, exhaustive: true },
  ),
};

/** Typing order: setup files, then the API layer, then the code that uses it, UI last. */
const ORDER = [
  'package.json',
  '.env',
  'tsconfig.json',
  'vite.config.ts',
  'index.html',
  'src/config.ts',
  'src/api/types.ts',
  'src/api/endpoints.ts',
  'src/api/client.ts',
  'src/api/authApi.ts',
  'src/api/menuApi.ts',
  'src/api/configurationApi.ts',
  'src/mocks/data.ts',
  'src/mocks/mockApi.ts',
  'src/hooks/useApi.ts',
  'src/auth/AuthContext.tsx',
  'src/layout/menu.tsx',
  'src/layout/AppLayout.tsx',
  'src/auth/ProtectedRoute.tsx',
  'src/pages/configurations/ConfigurationModal.tsx',
  'src/pages/configurations/ConfigurationsPage.tsx',
  'src/pages/index.ts',
  'src/pages/MenuPage.tsx',
  'src/pages/LoginPage.tsx',
  'src/styles.css',
  'src/App.tsx',
  'src/main.tsx',
];

/** Not needed to run the app: notes and git settings. */
const OPTIONAL = ['README.md', '.gitignore'];

const contents: Record<string, string> = Object.fromEntries(
  Object.entries(modules).map(([path, text]) => [path.slice(ROOT.length), String(text)]),
);
// The app reads .env; the repo only has the template, so show it under the name to create.
if (contents['.env.example'] !== undefined) {
  contents['.env'] = contents['.env.example'];
  delete contents['.env.example'];
}

const rank = (path: string) => {
  const i = ORDER.indexOf(path);
  if (i >= 0) return i;
  return OPTIONAL.includes(path) ? 2000 + OPTIONAL.indexOf(path) : 1000; // unknown new files
};

export const LITE_FILES: SourceFile[] = Object.keys(contents)
  .sort((a, b) => rank(a) - rank(b) || (a < b ? -1 : 1))
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

export const LITE_MKDIR_COMMAND = mkdirCommand(LITE_FILES);
