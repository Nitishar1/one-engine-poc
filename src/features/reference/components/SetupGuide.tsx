import type { ReactNode } from 'react';
import { AppCard } from '@/components/common/AppCard';
import {
  FOLDER_COUNT,
  MKDIR_COMMAND,
  SPECIAL_CHAR_USAGE,
  specialCharHint,
} from '../utils/sourceFiles';

function Command({ children }: { children: string }) {
  return (
    <pre className="m-0 my-2 overflow-x-auto whitespace-pre-wrap break-all rounded-[var(--oe-radius)] border border-line bg-surface-sunken px-3 py-2.5 font-mono text-[12.5px] text-fg">
      {children}
    </pre>
  );
}

const code = (text: string) => (
  <code className="rounded bg-surface-sunken px-1 py-px font-mono text-[12.5px]">{text}</code>
);

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="oe-icon-tile h-7 w-7 shrink-0 rounded-full text-[12.5px] font-semibold">
        {n}
      </span>
      <div className="min-w-0 flex-1 text-[13.5px] leading-relaxed text-fg-secondary">
        <p className="m-0 mt-0.5 font-medium text-fg">{title}</p>
        {children}
      </div>
    </li>
  );
}

/** Setup, typing rules and the special-character table shown before the first file. */
export function SetupGuide({
  requiredFiles,
  requiredLines,
}: {
  requiredFiles: number;
  requiredLines: number;
}) {
  return (
    <div className="flex max-w-4xl flex-col gap-5">
      <AppCard title="Set up the lab laptop" description="Once, before typing any file.">
        <ol className="m-0 flex list-none flex-col gap-5 p-0">
          <Step n={1} title="Check Node.js">
            Open <b>Command Prompt</b> (PowerShell may block npm scripts) and run:
            <Command>{'node -v\nnpm -v'}</Command>
            Node must be <b>v22.12 or newer</b>. If not, install Node 22 LTS.
          </Step>
          <Step n={2} title="Create the project folder">
            <Command>{'mkdir C:\\oneEngine_poc_4\ncd C:\\oneEngine_poc_4'}</Command>
            Then, in <b>PowerShell</b> opened in that folder, run this line to create all{' '}
            {FOLDER_COUNT} sub-folders:
            <Command>{MKDIR_COMMAND}</Command>
          </Step>
          <Step n={3} title="Type package.json, then install">
            Type file 1 ({code('package.json')}) and run:
            <Command>npm install --legacy-peer-deps</Command>
            Keep the flag - without a lockfile npm 10 otherwise crashes with{' '}
            <i>Cannot read properties of null (reading 'edgesOut')</i>.
          </Step>
          <Step n={4} title="Type the remaining files in order">
            {requiredFiles} required files, {requiredLines.toLocaleString()} lines. Tick each file
            in the list as you finish it; ticks are remembered in this browser.
          </Step>
          <Step n={5} title="Format, check and run">
            <Command>{'npm run format\nnpm run typecheck\nnpm run dev'}</Command>
            Open {code('http://localhost:5173')} and sign in with any user name and password.
          </Step>
        </ol>
      </AppCard>

      <AppCard title="Rules while typing">
        <ul className="m-0 flex flex-col gap-2 pl-5 text-[13.5px] leading-relaxed text-fg-secondary">
          <li>
            <b className="text-fg">Indentation and spacing don't matter</b> -{' '}
            {code('npm run format')} fixes them. Spelling, brackets, quotes, commas and capitals
            must be exact.
          </li>
          <li>
            File names are case-sensitive in imports: {code('AppButton.tsx')} is not{' '}
            {code('appButton.tsx')}.
          </li>
          <li>
            In Notepad, save with "Save as type: All files" so {code('.tsx')} doesn't become{' '}
            {code('.tsx.txt')}. The env file is named exactly {code('.env')}.
          </li>
          <li>
            Run {code('npm run typecheck')} any time. Ignore <i>Cannot find module</i> for files not
            typed yet; any other error points at a typo as {code('file(line,col)')}.
          </li>
          <li>
            The {code('src/features/reference')} files are optional. If you skip them, also leave
            out the {code('reference')} line in {code('src/config/routes.ts')} and the{' '}
            {code('ROUTES.reference')} route in {code('src/app/router.tsx')}.
          </li>
          <li>
            {code('package.json')} here pins exact versions and adds {code('@testing-library/dom')}{' '}
            - that differs from the original on purpose.
          </li>
        </ul>
      </AppCard>

      <AppCard
        title="Special characters"
        description="Highlighted in the code. Alt codes: hold Alt, type the digits on the numeric keypad. Otherwise use Character Map (Start, type charmap)."
        bodyClassName="p-0"
      >
        <table className="w-full border-collapse text-[13px]">
          <tbody>
            {SPECIAL_CHAR_USAGE.map(([char, count]) => (
              <tr key={char} className="border-b border-line last:border-0">
                <td className="w-14 py-1.5 text-center text-[20px] text-fg">{char}</td>
                <td className="py-1.5 text-fg-secondary">{specialCharHint(char)}</td>
                <td className="py-1.5 pr-5 text-right tabular-nums text-fg-muted">{count}x</td>
              </tr>
            ))}
          </tbody>
        </table>
      </AppCard>
    </div>
  );
}
