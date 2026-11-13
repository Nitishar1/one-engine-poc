import { Link } from 'react-router-dom';
import { AppCard } from '@/components/common/AppCard';
import { LITE_UPDATES } from '../utils/liteChanges';
import { ChangeBadge } from './ChangeBadge';
import { LITE_FILES, LITE_FILE_LINES, LITE_FOLDER, LITE_FOLDER_LINES } from '../utils/liteFiles';
import { Code, Command, Step } from './GuideParts';

const PAGES = [
  'Home',
  'Agent Parameters',
  'AppSetting Parameters',
  'Role',
  'User',
  'Authorization',
  'Domain',
  'Locked Accounts',
  'Menu',
  'Report Designer',
  'DataSource',
];

/** Updates to Lite, newest first: what changed and which files to create or retype. */
function UpdatesCard() {
  if (!LITE_UPDATES.length) return null;
  return (
    <AppCard
      title="What's new: pages and files changed"
      description={`Already have Lite on the lab laptop? Only create or retype the files listed here. In the file list on the left, use "Updated only" to see just these.`}
    >
      <div className="flex flex-col gap-5">
        {LITE_UPDATES.map((update, i) => {
          const created = update.files.filter((f) => f.status === 'new').length;
          const changed = update.files.length - created;
          return (
            <section key={`${update.date}-${update.title}`}>
              <p className="m-0 flex flex-wrap items-center gap-2 text-[14px] font-semibold text-fg">
                {update.title}
                <span className="text-[12px] font-normal text-fg-muted">
                  {update.date} · {created} new, {changed} changed
                  {i === 0 ? ' · latest' : ''}
                </span>
              </p>
              <p className="m-0 mb-2 mt-1 text-[13.5px] leading-relaxed text-fg-secondary">
                {update.summary}
              </p>
              <p className="m-0 mb-1 text-[12px] font-semibold uppercase tracking-[0.06em] text-fg-muted">
                Pages
              </p>
              <ul className="m-0 mb-3 flex list-none flex-wrap gap-2 p-0">
                {update.pages.map((page) => (
                  <li
                    key={page.name}
                    className="flex items-center gap-2 rounded-[var(--oe-radius)] border border-line px-2.5 py-1 text-[13px] text-fg"
                  >
                    <ChangeBadge status={page.status} />
                    {page.name}
                  </li>
                ))}
              </ul>
              <p className="m-0 mb-1 text-[12px] font-semibold uppercase tracking-[0.06em] text-fg-muted">
                Files
              </p>
              <ul className="m-0 flex list-none flex-col divide-y divide-line rounded-[var(--oe-radius)] border border-line p-0">
                {update.files.map((f) => (
                  <li
                    key={f.path}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2"
                  >
                    <ChangeBadge status={f.status} />
                    <Link
                      to={`?file=${encodeURIComponent(f.path)}`}
                      className="break-all font-mono text-[12.5px] text-primary hover:underline"
                    >
                      {f.path}
                    </Link>
                    <span className="min-w-0 basis-full text-[12.5px] text-fg-muted sm:basis-auto sm:flex-1">
                      {f.note}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </AppCard>
  );
}

/** Step-by-step setup for creating OneEngine Lite on the lab laptop. */
export function LiteSetupGuide({
  requiredFiles,
  requiredLines,
}: {
  requiredFiles: number;
  requiredLines: number;
}) {
  return (
    <div className="flex max-w-4xl flex-col gap-5">
      <UpdatesCard />
      <AppCard
        title="What you are building"
        description={`${requiredFiles} files, ${requiredLines.toLocaleString()} lines. All plain ASCII: no special characters to type.`}
      >
        <ul className="m-0 flex flex-col gap-2 pl-5 text-[13.5px] leading-relaxed text-fg-secondary">
          <li>
            The OneEngine design (same theme, sidebar, header, footer, tables, forms, toasts and
            light / dark mode) with a new, simple sign-in page.
          </li>
          <li>Pages: {PAGES.join(', ')}. Other menu entries show "coming soon".</li>
          <li>
            The sidebar comes from the backend (<Code>GET /navigation</Code>). A mock backend in{' '}
            <Code>src/mocks</Code> answers every call until the real one is ready.
          </li>
        </ul>
      </AppCard>

      <AppCard
        title="Copy / paste blocked? Use Download instead"
        description="The fastest way: no typing at all, if the lab laptop can open this page."
      >
        <ol className="m-0 flex flex-col gap-2 pl-5 text-[13.5px] leading-relaxed text-fg-secondary">
          <li>
            On this laptop, start the main app so other computers on the network can reach it:
            <Command>npm run dev -- --host</Command>
            It prints a <b>Network</b> address such as <Code>http://10.x.x.x:5173</Code>.
          </li>
          <li>
            On the lab laptop, open that address followed by <Code>/ref2</Code> in the browser and
            press <b>Download all (.zip)</b> at the top. Unzip it (right-click &gt; Extract All) and
            continue at step 3 below (<Code>npm install</Code>); steps 2 and 4 are not needed.
          </li>
          <li>
            For a single file use <b>Download</b> next to Prev / Next and save it into the right
            folder.
          </li>
          <li>
            If downloads are blocked too, type the files: use <b>A+ / A++</b> for bigger text and
            click a line to mark where you are; lines above it are dimmed.
          </li>
        </ol>
      </AppCard>

      <AppCard title="Create it on the lab laptop" description="Follow the steps in order.">
        <ol className="m-0 flex list-none flex-col gap-5 p-0">
          <Step n={1} title="Check Node.js">
            Open <b>Command Prompt</b> and run:
            <Command>{'node -v\nnpm -v'}</Command>
            Node must be <b>v22.12 or newer</b>.
          </Step>
          <Step n={2} title="Create the project folder, sub-folders and empty files">
            Everything in this step runs in <b>Command Prompt</b> (the prompt looks like{' '}
            <Code>{'C:\\>'}</Code>). If it starts with <Code>PS</Code> you are in PowerShell: type{' '}
            <Code>cmd</Code> and press Enter first. Create the project folder and go into it:
            <Command>{`mkdir C:\\${LITE_FOLDER}\ncd /d C:\\${LITE_FOLDER}`}</Command>
            Create the sub-folders (parent folders are created too). Type each line and press Enter
            after it; &quot;already exists&quot; is fine:
            <Command>{LITE_FOLDER_LINES}</Command>
            Create all {LITE_FILES.length} files (empty), again one line at a time:
            <Command>{LITE_FILE_LINES}</Command>
            <Code>{'>>'}</Code> (two arrows) only creates a missing file and never empties one you
            already filled in, so a line typed twice does no harm. Check with{' '}
            <Code>dir /s /b /a-d</Code>. Then open each file in your editor and fill in its content
            from the list on the left.
          </Step>
          <Step n={3} title="Create package.json and install">
            Open <Code>package.json</Code> in the list on the left, create the file with exactly
            that content, then run:
            <Command>npm install</Command>
            This downloads React, Ant Design, Tailwind, Vite and the rest at the same versions as
            here. No extra flags are needed.
          </Step>
          <Step n={4} title="Create the other files in the order listed">
            Use <b>Next</b> (or the right arrow key) to go through the list. Create each file at the
            path shown, paste or type the content, save it and tick it. Notes:
            <ul className="mb-0 mt-2 flex flex-col gap-1 pl-5">
              <li>
                File names are case-sensitive: <Code>RoleListPage.tsx</Code> is not{' '}
                <Code>roleListPage.tsx</Code>.
              </li>
              <li>
                <Code>.env</Code>, <Code>.prettierrc</Code> and <Code>.prettierignore</Code> start
                with a dot and have no extension. In Notepad choose "Save as type: All files".
              </li>
              <li>
                Comment lines (starting with <Code>//</Code>, <Code>/*</Code> or <Code>*</Code>) can
                be skipped.
              </li>
            </ul>
          </Step>
          <Step n={5} title="Format, check and run">
            <Command>{'npm run format\nnpm run typecheck\nnpm run dev'}</Command>
            <Code>format</Code> fixes spacing and indentation. <Code>typecheck</Code> must print no
            errors; each error shows the file and line of a typo. Then open{' '}
            <Code>http://localhost:5174</Code>.
          </Step>
          <Step n={6} title="Try every page">
            <ul className="m-0 flex flex-col gap-1 pl-5">
              <li>
                Sign in with domain <Code>Local</Code>, user <Code>superadmin</Code>, any password
                (the password <Code>invalid</Code> shows a failed sign-in).
              </li>
              <li>Open Home, then each item under Configurations in the sidebar.</li>
              <li>
                Add a menu under Configurations: it appears in the sidebar straight away and opens a
                "coming soon" page.
              </li>
              <li>
                Under Authorization, give the role <Code>Test User</Code> a page, sign out, sign in
                as <Code>oeUser</Code> (domain <Code>OELAB</Code>): only those pages are shown.
              </li>
              <li>Switch light / dark with the moon / sun button in the header.</li>
            </ul>
          </Step>
          <Step n={7} title="Switch to the real backend (when it is ready)">
            In <Code>.env</Code> set:
            <Command>
              {'VITE_USE_MOCKS=false\nAPI_PROXY_TARGET=http://localhost/OneEngine.Api'}
            </Command>
            Stop the dev server (Ctrl+C) and run <Code>npm run dev</Code> again. The endpoints the
            backend must provide are listed in <Code>README.md</Code>.
          </Step>
        </ol>
      </AppCard>

      <AppCard title="Good to know">
        <ul className="m-0 flex flex-col gap-2 pl-5 text-[13.5px] leading-relaxed text-fg-secondary">
          <li>
            Every Configurations page is in its own folder under{' '}
            <Code>src/features/configurations</Code>: <Code>*.schema.ts</Code> (types and
            validation), <Code>*.api.ts</Code> (API calls), a list page and a form page. List pages
            share <Code>CrudListPage</Code>; forms share <Code>FormCard</Code>,{' '}
            <Code>AppInput</Code>, <Code>AppSelect</Code> and <Code>AppCheckbox</Code>.
          </li>
          <li>
            Mock data is saved in the browser. To start fresh, clear the site data (F12 &gt;
            Application &gt; Clear site data).
          </li>
          <li>
            If the browser shows "Invalid hook call" after reinstalling packages, stop the dev
            server, delete <Code>node_modules\.vite</Code> and start it again.
          </li>
        </ul>
      </AppCard>
    </div>
  );
}
