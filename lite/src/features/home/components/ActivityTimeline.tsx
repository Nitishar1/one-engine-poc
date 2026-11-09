import { EmptyState } from '@/components/common/EmptyState';
import { StatusTag } from '@/components/common/StatusTag';
import { formatDateTime, formatDuration } from '@/utils/formatters';
import type { ExecutionRecord } from '../types/home.types';

const DOT_TONE: Record<ExecutionRecord['status'], string> = {
  Success: 'var(--oe-success)',
  Failed: 'var(--oe-error)',
  Running: 'var(--oe-info)',
};

/** Recent runbook executions as a vertical timeline (newest first). */
export function ActivityTimeline({ data }: { data: ExecutionRecord[] }) {
  if (!data.length)
    return (
      <EmptyState
        compact
        title="No executions yet"
        description="Runbook executions will appear here as they run."
      />
    );

  return (
    <ol className="oe-timeline m-0 list-none p-0">
      {data.map((run) => (
        <li
          key={run.id}
          className={`oe-timeline__item ${run.status === 'Running' ? 'is-live' : ''}`}
          style={{ ['--tone' as string]: DOT_TONE[run.status] }}
        >
          <span className="oe-timeline__dot" aria-hidden />
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
            <span className="min-w-0 truncate text-[13.5px] font-medium text-fg">
              {run.runbookName}
            </span>
            <span className="truncate rounded-md border border-line bg-surface-alt px-1.5 font-mono text-[11.5px] leading-5 text-fg-secondary">
              {run.target}
            </span>
            <span className="ml-auto">
              <StatusTag status={run.status} />
            </span>
          </div>
          <div className="mt-1 flex flex-wrap gap-x-3 text-[12px] text-fg-muted">
            <span className="tabular-nums">{formatDateTime(run.startedOn)}</span>
            <span>by {run.triggeredBy}</span>
            <span className="tabular-nums">
              {run.status === 'Running' ? 'in progress - ' : ''}
              {formatDuration(run.durationSeconds)}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}
