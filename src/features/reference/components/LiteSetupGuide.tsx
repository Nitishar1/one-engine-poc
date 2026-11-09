import { AppCard } from '@/components/common/AppCard';
import { LITE_FOLDER, LITE_MKDIR_COMMAND } from '../utils/liteFiles';
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
          <Step n={2} title="Create a new, empty project folder">
            Start from scratch, separate from any older copy:
            <Command>{`mkdir C:\\${LITE_FOLDER}\ncd C:\\${LITE_FOLDER}`}</Command>
            Then open <b>PowerShell</b> in that folder and create all sub-folders at once:
            <Command>{LITE_MKDIR_COMMAND}</Command>
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
              {'VITE_USE_MOCKS=false\nAPI_PROXY_TARGET=http://<backend-host>:<port>'}
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
