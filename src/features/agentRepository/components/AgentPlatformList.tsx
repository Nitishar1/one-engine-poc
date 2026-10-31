import { AppWindow, Terminal, type LucideIcon } from 'lucide-react';
import type { AgentPlatform } from '../types/agent.types';

const PLATFORMS: Array<{ value: AgentPlatform; label: string; icon: LucideIcon }> = [
  { value: 'windows', label: 'Windows', icon: AppWindow },
  { value: 'nonWindows', label: 'Non Windows', icon: Terminal },
];

interface AgentPlatformListProps {
  value: AgentPlatform;
  onChange: (platform: AgentPlatform) => void;
  counts: Record<AgentPlatform, number>;
}

/** Platform filter: a vertical list on desktop, a row on small screens. */
export function AgentPlatformList({ value, onChange, counts }: AgentPlatformListProps) {
  return (
    <div
      role="tablist"
      aria-label="Platform"
      aria-orientation="vertical"
      className="flex flex-row gap-1 md:w-[200px] md:shrink-0 md:flex-col"
    >
      <span className="hidden px-2.5 pb-1 text-[11px] font-medium uppercase tracking-[0.06em] text-fg-muted md:block">
        Platform
      </span>
      {PLATFORMS.map(({ value: platform, label, icon: Icon }) => {
        const active = platform === value;
        return (
          <button
            key={platform}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(platform)}
            className={`flex h-9 flex-1 cursor-pointer items-center gap-2.5 rounded-[8px] border px-2.5 text-left text-[13.5px] font-medium transition-colors duration-150 md:flex-none ${
              active
                ? 'border-[color-mix(in_srgb,var(--oe-primary)_22%,transparent)] bg-[image:var(--oe-sidebar-active-bg)] text-fg'
                : 'border-transparent bg-transparent text-fg-secondary hover:bg-hover hover:text-fg'
            }`}
          >
            <Icon size={15} className={active ? 'text-primary' : 'text-fg-muted'} />
            <span className="truncate">{label}</span>
            <span className="ml-auto min-w-[22px] rounded-md px-1.5 text-center text-[11.5px] tabular-nums text-fg-muted">
              {counts[platform]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
