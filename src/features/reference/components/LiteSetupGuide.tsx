import { AppCard } from '@/components/common/AppCard';
import { LITE_FOLDER, LITE_MKDIR_COMMAND } from '../utils/liteFiles';
import { Code, Command, Step } from './GuideParts';

/** Step-by-step setup for retyping OneEngine Lite on the lab laptop. */
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
        title="Create OneEngine Lite on the lab laptop"
        description={`A new, separate project: login, a menu from the backend, header, footer, light / dark theme and a Configurations page. ${requiredFiles} files, ${requiredLines.toLocaleString()} lines.`}
      >
        <ol className="m-0 flex list-none flex-col gap-5 p-0">
          <Step n={1} title="Check Node.js">
            Open <b>Command Prompt</b> and run:
            <Command>{'node -v\nnpm -v'}</Command>
            Node must be <b>v22.12 or newer</b>.
          </Step>
          <Step n={2} title="Create a new, empty project folder">
            Keep it separate from the old project:
            <Command>{`mkdir C:\\${LITE_FOLDER}\ncd C:\\${LITE_FOLDER}`}</Command>
            Then open <b>PowerShell</b> in that folder and create the sub-folders:
            <Command>{LITE_MKDIR_COMMAND}</Command>
          </Step>
          <Step n={3} title="Create package.json and install">
            Open <Code>package.json</Code> in the list on the left, create the file with exactly
            that content, then run:
            <Command>npm install</Command>
            This downloads React, Ant Design, axios and Vite at the same versions as here.
          </Step>
          <Step n={4} title="Create the other files in order">
            Go through the list with <b>Next</b> (or the right arrow key). Create each file at the
            path shown, paste or type the content, save, and tick it. The <Code>.env</Code> file
            name starts with a dot and has no extension.
          </Step>
          <Step n={5} title="Check and run">
            <Command>{'npm run typecheck\nnpm run dev'}</Command>
            <Code>typecheck</Code> must print no errors; each error shows the file and line of a
            typo. Then open <Code>http://localhost:5174</Code> and sign in with any user name and
            password (password <Code>invalid</Code> shows a failed login).
          </Step>
          <Step n={6} title="Switch to the real backend (when it's ready)">
            In <Code>.env</Code> set:
            <Command>
              {'VITE_USE_MOCKS=false\nAPI_PROXY_TARGET=http://<backend-host>:<port>'}
            </Command>
            Stop the dev server (Ctrl+C) and run <Code>npm run dev</Code> again. The backend must
            answer the URLs listed in <Code>README.md</Code>.
          </Step>
        </ol>
      </AppCard>

      <AppCard title="Good to know">
        <ul className="m-0 flex flex-col gap-2 pl-5 text-[13.5px] leading-relaxed text-fg-secondary">
          <li>
            Styling is plain Ant Design plus one small <Code>src/styles.css</Code>. There is no
            Tailwind, so dropdowns, inputs and tables get their look from Ant Design itself.
          </li>
          <li>
            The menu comes from <Code>GET /menus</Code>. To add a page: create the component and add
            its path to <Code>src/pages/index.ts</Code>; until then the menu item shows "coming
            soon".
          </li>
          <li>
            Light / dark theme: the sun / moon button in the header (and on the login page). The
            choice is saved in the browser. Ant Design switches its own colours; the layout colours
            are the variables at the top of <Code>src/styles.css</Code>.
          </li>
          <li>
            The footer shows a <b>Mock data</b> tag while <Code>VITE_USE_MOCKS=true</Code>, so it is
            always clear whether the app is using the real backend.
          </li>
          <li>
            In mock mode, data lives in memory: changes on the Configurations page reset when you
            reload the page.
          </li>
          <li>All files are plain ASCII, so there are no special characters to type.</li>
        </ul>
      </AppCard>
    </div>
  );
}
