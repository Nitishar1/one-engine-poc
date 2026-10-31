import type { CSSProperties } from 'react';

/** Shimmering placeholder block. */
export function Skeleton({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return <span aria-hidden className={`oe-skeleton ${className}`} style={style} />;
}

/** Placeholder rows shown while a table's first page loads. */
export function TableSkeleton({ rows = 6, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading data"
      className="overflow-hidden rounded-[10px] border border-line"
    >
      <div className="flex gap-6 border-b border-line bg-surface-alt px-4 py-3">
        {Array.from({ length: columns }, (_, c) => (
          <Skeleton key={c} className="h-3 flex-1" style={{ maxWidth: c === 0 ? 140 : 100 }} />
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div
          key={r}
          className="flex items-center gap-6 border-b border-line px-4 py-3.5 last:border-0"
        >
          {Array.from({ length: columns }, (_, c) => (
            <Skeleton
              key={c}
              className="h-3 flex-1"
              style={{ maxWidth: c === 0 ? 180 : 120, opacity: 1 - r * 0.1 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
