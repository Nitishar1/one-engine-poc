import type { ReactNode } from 'react';
import { Inbox, type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: ReactNode;
  icon?: LucideIcon;
  action?: ReactNode;
  compact?: boolean;
}

export function EmptyState({
  title = 'No data available',
  description,
  icon: Icon = Inbox,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1.5 px-4 text-center ${compact ? 'py-8' : 'py-14'}`}
    >
      <span className="relative mb-3 inline-flex">
        {/* Soft halo so empty areas read as intentional rather than blank. */}
        <span
          aria-hidden
          className="absolute -inset-4 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--oe-primary)_16%,transparent),transparent_70%)]"
        />
        <span className="oe-icon-tile relative h-11 w-11 rounded-[11px]">
          <Icon size={20} strokeWidth={1.75} />
        </span>
      </span>
      <p className="m-0 text-[14px] font-medium text-fg">{title}</p>
      {description && (
        <p className="m-0 max-w-sm text-[13px] leading-relaxed text-fg-muted">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
