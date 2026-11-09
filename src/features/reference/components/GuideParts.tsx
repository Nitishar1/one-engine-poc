import type { ReactNode } from 'react';

/** Building blocks shared by the setup guides of the typing reference pages. */

export function Command({ children }: { children: string }) {
  return (
    <pre className="m-0 my-2 overflow-x-auto whitespace-pre-wrap break-all rounded-[var(--oe-radius)] border border-line bg-surface-sunken px-3 py-2.5 font-mono text-[12.5px] text-fg">
      {children}
    </pre>
  );
}

export function Code({ children }: { children: string }) {
  return (
    <code className="rounded bg-surface-sunken px-1 py-px font-mono text-[12.5px]">{children}</code>
  );
}

export function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
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
