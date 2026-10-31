import type { ReactNode } from 'react';

/** Responsive card grid shared by the agent screens. */
export function AgentGrid({ children }: { children: ReactNode }) {
  return (
    <div className="oe-stagger grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {children}
    </div>
  );
}
