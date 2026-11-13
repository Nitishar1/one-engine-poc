import type { ChangeStatus } from '../utils/liteChanges';

const STYLES: Record<ChangeStatus, { label: string; className: string }> = {
  new: { label: 'New', className: 'text-success' },
  changed: { label: 'Changed', className: 'text-warning' },
};

/** "New" / "Changed" chip for files touched by the latest update. */
export function ChangeBadge({ status }: { status: ChangeStatus }) {
  const { label, className } = STYLES[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border border-current px-1.5 font-sans text-[10.5px] font-semibold uppercase leading-[16px] tracking-[0.04em] ${className}`}
    >
      {label}
    </span>
  );
}
