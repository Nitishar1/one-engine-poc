/**
 * Project files listed by the typing reference (/ref), read as raw text at build time and
 * sorted into the order they should be retyped on a machine without file transfer.
 */
import selfSource from './sourceFiles.ts?raw';

export type SourceGroup = 'required' | 'reference' | 'tests';

export const GROUP_ORDER: SourceGroup[] = ['required', 'reference', 'tests'];

export interface SourceFile {
  path: string;
  content: string;
  lines: number;
  group: SourceGroup;
}

const toRecord = (modules: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(modules).map(([path, text]) => [path.replace(/^\//, ''), String(text)]),
  );

const srcFiles = toRecord(
  import.meta.glob(['/src/**/*', '!/src/assets/**'], {
    query: '?raw',
    import: 'default',
    eager: true,
  }),
);
// import.meta.glob never matches the file it is written in.
srcFiles['src/features/reference/utils/sourceFiles.ts'] = selfSource;

const rootFiles = toRecord(
  import.meta.glob(
    [
      '/package.json',
      '/package-lock.json',
      '/.env.example',
      '/tsconfig.json',
      '/tsconfig.app.json',
      '/tsconfig.node.json',
      '/vite.config.ts',
      '/.prettierrc',
      '/.prettierignore',
      '/eslint.config.js',
      '/index.html',
      '/public/favicon.svg',
    ],
    // `exhaustive` so the glob also matches dotfiles (.prettierrc, .env.example).
    { query: '?raw', import: 'default', eager: true, exhaustive: true },
  ),
);

const ROOT_ORDER = [
  'package.json',
  '.env',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
  'vite.config.ts',
  '.prettierrc',
  '.prettierignore',
  'eslint.config.js',
  'index.html',
  'public/favicon.svg',
];

/** Folders in dependency order: shared foundations first, features, then the app shell. */
const SRC_ORDER = [
  'src/vite-env.d.ts',
  'src/types/',
  'src/utils/',
  'src/config/',
  'src/stores/',
  'src/services/',
  'src/styles/',
  'src/components/theme/',
  'src/components/feedback/',
  'src/components/common/',
  'src/components/layout/',
  'src/hooks/',
  'src/mocks/data/',
  'src/mocks/handlers/',
  'src/mocks/',
  'src/features/auth/',
  'src/features/dashboard/',
  'src/features/ciMapping/',
  'src/features/agentRepository/',
  'src/features/aiAgents/',
  'src/features/workflows/',
  'src/features/reports/',
  'src/features/modules/',
  'src/features/errors/',
  'src/features/reference/',
  'src/app/',
  'src/main.tsx',
];

/** Within a feature folder: contracts first, then logic, then UI. */
const SUB_ORDER = [
  'types/',
  'schemas/',
  'utils/',
  'config/',
  'services/',
  'stores/',
  'hooks/',
  'edges/',
  'nodes/',
  'components/properties/',
  'components/',
  'pages/',
];

const groupOf = (path: string): SourceGroup => {
  if (path.includes('__tests__/') || path.startsWith('src/test/')) return 'tests';
  if (path.startsWith('src/features/reference/')) return 'reference';
  return 'required';
};

const sortKey = (path: string): number[] => {
  const root = ROOT_ORDER.indexOf(path);
  if (root >= 0) return [0, root, 0];
  let folder = -1;
  SRC_ORDER.forEach((prefix, i) => {
    const matches = path === prefix || (prefix.endsWith('/') && path.startsWith(prefix));
    if (matches && (folder < 0 || prefix.length > SRC_ORDER[folder].length)) folder = i;
  });
  const rest = folder >= 0 ? path.slice(SRC_ORDER[folder].length) : path;
  return [1, folder < 0 ? 999 : folder, SUB_ORDER.findIndex((sub) => rest.startsWith(sub))];
};

const compare = (a: string, b: string) => {
  const ka = sortKey(a);
  const kb = sortKey(b);
  for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return ka[i] - kb[i];
  return a < b ? -1 : a > b ? 1 : 0;
};

type Deps = Record<string, string>;

/**
 * package.json with every dependency pinned to the version installed here. The retyped project
 * has no lockfile, so this is what keeps its `npm install` identical to this machine.
 */
function pinnedPackageJson(pkgText: string, lockText?: string) {
  if (!lockText) return pkgText;
  const pkg = JSON.parse(pkgText) as { dependencies?: Deps; devDependencies?: Deps };
  const { packages } = JSON.parse(lockText) as { packages: Record<string, { version?: string }> };
  const version = (name: string) => packages[`node_modules/${name}`]?.version;
  for (const deps of [pkg.dependencies, pkg.devDependencies]) {
    if (!deps) continue;
    for (const name of Object.keys(deps)) deps[name] = version(name) ?? deps[name];
  }
  // Peer dep npm normally auto-installs; --legacy-peer-deps (needed without a lockfile) skips it.
  const dom = version('@testing-library/dom');
  if (dom && pkg.devDependencies) {
    pkg.devDependencies = Object.fromEntries(
      Object.entries({ ...pkg.devDependencies, '@testing-library/dom': dom }).sort(([a], [b]) =>
        a < b ? -1 : 1,
      ),
    );
  }
  return `${JSON.stringify(pkg, null, 2)}\n`;
}

export const countLines = (content: string) => content.replace(/\n+$/, '').split('\n').length;

const contents: Record<string, string> = {
  ...srcFiles,
  ...Object.fromEntries(Object.entries(rootFiles).filter(([path]) => ROOT_ORDER.includes(path))),
  'package.json': pinnedPackageJson(rootFiles['package.json'], rootFiles['package-lock.json']),
  '.env': rootFiles['.env.example'],
};

export const SOURCE_FILES: SourceFile[] = Object.keys(contents)
  .sort(compare)
  .map((path) => ({
    path,
    content: contents[path],
    lines: countLines(contents[path]),
    group: groupOf(path),
  }))
  .sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group));

export const GROUP_LABELS: Record<SourceGroup, string> = {
  required: 'Required',
  reference: 'Optional - this /ref page',
  tests: 'Optional - tests',
};

/** Windows `mkdir` line that creates every folder of the project in one go (PowerShell). */
export const MKDIR_COMMAND = `mkdir ${[
  ...new Set([
    ...SOURCE_FILES.filter((f) => f.path.includes('/')).map((f) =>
      f.path.slice(0, f.path.lastIndexOf('/')),
    ),
    'src/assets/fonts',
    'src/assets/icons',
    'src/assets/images',
  ]),
]
  .map((dir) => dir.replaceAll('/', '\\'))
  .sort()
  .join(', ')}`;

export const FOLDER_COUNT = MKDIR_COMMAND.split(', ').length;

/** How to type each non-ASCII character used in the sources on a Windows keyboard. */
const SPECIAL_CHARS: Record<string, { name: string; alt?: string }> = {
  '…': { name: 'Horizontal Ellipsis', alt: '0133' },
  '—': { name: 'Em Dash', alt: '0151' },
  '–': { name: 'En Dash', alt: '0150' },
  '·': { name: 'Middle Dot', alt: '0183' },
  '’': { name: 'Right Single Quotation Mark', alt: '0146' },
  '“': { name: 'Left Double Quotation Mark', alt: '0147' },
  '”': { name: 'Right Double Quotation Mark', alt: '0148' },
  '©': { name: 'Copyright Sign', alt: '0169' },
  '€': { name: 'Euro Sign', alt: '0128' },
  '•': { name: 'Bullet', alt: '0149' },
  '›': { name: 'Single Right-Pointing Angle Quotation Mark', alt: '0155' },
  '→': { name: 'Rightwards Arrow' },
  '↑': { name: 'Upwards Arrow' },
  '↓': { name: 'Downwards Arrow' },
  '↵': { name: 'Downwards Arrow With Corner Leftwards' },
  '⌘': { name: 'Place Of Interest Sign' },
  '₹': { name: 'Indian Rupee Sign' },
};

export const isSpecialChar = (char: string) => char.charCodeAt(0) > 127;

export function specialCharHint(char: string) {
  const code = `U+${char.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}`;
  const info = SPECIAL_CHARS[char];
  if (!info) return `${code} - Character Map: search ${code}`;
  const how = info.alt ? `Alt+${info.alt}` : `Character Map: search "${info.name}"`;
  return `${code} ${info.name} - ${how}`;
}

export const countSpecialChars = (content: string) => [...content].filter(isSpecialChar).length;

/** Every special character across all files, most frequent first. */
export const SPECIAL_CHAR_USAGE = Object.entries(
  SOURCE_FILES.flatMap((f) => [...f.content].filter(isSpecialChar)).reduce<Record<string, number>>(
    (acc, char) => ({ ...acc, [char]: (acc[char] ?? 0) + 1 }),
    {},
  ),
).sort((a, b) => b[1] - a[1]);
