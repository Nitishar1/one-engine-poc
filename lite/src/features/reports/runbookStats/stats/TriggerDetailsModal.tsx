/**
 * Pop-up opened by clicking a row of the Runbook runs grid.
 *
 * Functionality:
 * - Top: the execution's details (ID, runbook, status, request type, monitoring tool,
 *   scheduler, execution start / end time, executed by, result).
 * - Processes tab: the processes as a vertical timeline, each with its date and time.
 *   START and END only show their time; any other process expands on click to show its input
 *   parameters and output (Expand all / Collapse all). For a failed run the last process is
 *   red, for a running one blue.
 * - Logs tab: the execution log like the old OETimeLineReport page: a check (or cross) per
 *   entry, title, message and time, ending with a clock marker.
 */
import { useState, type ReactNode } from 'react';
import { Segmented } from 'antd';
import { ChevronDown, CircleCheck, CircleX, Clock3, Loader } from 'lucide-react';
import { AppButton } from '@/components/common/AppButton';
import { AppModal } from '@/components/common/AppModal';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Skeleton } from '@/components/common/Skeleton';
import { StatusTag } from '@/components/common/StatusTag';
import { formatDateTime, formatDuration } from '@/utils/formatters';
import dayjs from 'dayjs';
import { useTriggerLogs, useTriggerProcesses } from './runbookStats.api';
import type { RunbookTrigger, TriggerProcess, TriggerStatus } from './runbookStats.schema';

const TONE: Record<TriggerStatus, string> = {
  Success: 'var(--oe-success)',
  Failed: 'var(--oe-error)',
  Running: 'var(--oe-info)',
};

/** START and END have no inputs / output to show. */
const isBoundary = (name: string) => ['START', 'END'].includes(name.trim().toUpperCase());

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11.5px] text-fg-muted">{label}</dt>
      <dd className="m-0 mt-0.5 break-words text-[13px] font-medium text-fg">{value}</dd>
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="flex flex-col gap-2" role="status" aria-label="Loading">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-10 w-full rounded-[var(--oe-radius)]" />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- processes

function ProcessDetails({ process, failed }: { process: TriggerProcess; failed: boolean }) {
  return (
    <div className="oe-animate-in mt-2 flex flex-col gap-3 pl-1">
      <div>
        <p className="m-0 mb-1.5 text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-muted">
          Input parameters
        </p>
        {process.inputs.length ? (
          <table className="w-full border-collapse text-[12.5px]">
            <thead>
              <tr className="bg-surface-alt text-left text-fg-muted">
                <th className="border border-line px-3 py-1.5 font-medium">Parameter Name</th>
                <th className="border border-line px-3 py-1.5 font-medium">Parameter Value</th>
              </tr>
            </thead>
            <tbody>
              {process.inputs.map((p) => (
                <tr key={p.ParameterName}>
                  <td className="border border-line px-3 py-1.5 font-mono text-fg">
                    {p.ParameterName}
                  </td>
                  <td className="break-all border border-line px-3 py-1.5 font-mono text-fg-secondary">
                    {p.ParameterValue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <span className="text-[12.5px] text-fg-muted">No input parameters.</span>
        )}
      </div>
      <div>
        <p className="m-0 mb-1.5 text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-muted">
          Output
        </p>
        <pre
          className="m-0 whitespace-pre-wrap break-all rounded-[var(--oe-radius)] border border-line bg-surface-sunken px-3 py-2 font-mono text-[12.5px]"
          style={{ color: failed ? TONE.Failed : undefined }}
        >
          {process.output || '(no output)'}
        </pre>
      </div>
    </div>
  );
}

function ProcessesTab({ trigger }: { trigger: RunbookTrigger }) {
  const processes = useTriggerProcesses(trigger.runbookTriggerID);
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set());

  if (processes.error)
    return <ErrorState error={processes.error} onRetry={() => void processes.refetch()} />;
  if (!processes.data) return <LoadingRows />;
  const list = processes.data;
  if (!list.length) return <EmptyState compact title="No processes recorded" />;

  const last = list.length - 1;
  const statusOf = (i: number): TriggerStatus => (i < last ? 'Success' : trigger.status);
  const expandable = list.map((p, i) => (isBoundary(p.ProcessName) ? -1 : i)).filter((i) => i >= 0);
  const allOpen = expandable.length > 0 && expandable.every((i) => openIndexes.has(i));
  const toggle = (i: number) =>
    setOpenIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <>
      <div className="mb-3 flex justify-end">
        {expandable.length > 0 && (
          <AppButton
            tone="secondary"
            size="small"
            onClick={() => setOpenIndexes(allOpen ? new Set() : new Set(expandable))}
          >
            {allOpen ? 'Collapse all' : 'Expand all'}
          </AppButton>
        )}
      </div>
      <ol className="oe-timeline m-0 list-none p-0">
        {list.map((process, i) => {
          const status = statusOf(i);
          const boundary = isBoundary(process.ProcessName);
          const open = openIndexes.has(i);
          const row = (
            <>
              <span className="tabular-nums text-[12px] text-fg-muted">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-fg">
                {process.ProcessName}
              </span>
              <span className="shrink-0 font-mono text-[12px] tabular-nums text-fg-muted">
                {formatDateTime(process.ExecutedOn)}
              </span>
            </>
          );
          return (
            <li
              key={`${process.ProcessName}-${i}`}
              className={`oe-timeline__item ${status === 'Running' ? 'is-live' : ''}`}
              style={{ ['--tone' as string]: TONE[status] }}
            >
              <span className="oe-timeline__dot" aria-hidden />
              {boundary ? (
                <div className="flex items-center gap-3 rounded-[var(--oe-radius)] border border-line bg-surface-alt px-3 py-2">
                  {row}
                  <span className="w-4 shrink-0" />
                </div>
              ) : (
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => toggle(i)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-[var(--oe-radius)] border border-line bg-surface-alt px-3 py-2 text-left font-[inherit] hover:bg-hover"
                >
                  {row}
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-fg-muted transition-transform ${open ? 'rotate-180' : ''}`}
                  />
                </button>
              )}
              {!boundary && open && (
                <ProcessDetails process={process} failed={status === 'Failed'} />
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}

// ---------------------------------------------------------------- logs

const LOG_ICON = { Success: CircleCheck, Failed: CircleX, Running: Loader };

function LogsTab({ trigger }: { trigger: RunbookTrigger }) {
  const logs = useTriggerLogs(trigger.runbookTriggerID);
  if (logs.error) return <ErrorState error={logs.error} onRetry={() => void logs.refetch()} />;
  if (!logs.data) return <LoadingRows />;
  if (!logs.data.length) return <EmptyState compact title="No log entries" />;

  return (
    <ol className="relative m-0 flex list-none flex-col gap-3 p-0 pl-11">
      {/* Vertical line behind the icons. */}
      <span className="absolute bottom-4 left-[15px] top-4 w-0.5 bg-line-strong" aria-hidden />
      {logs.data.map((log) => {
        const Icon = LOG_ICON[log.status];
        return (
          <li key={log.logID} className="relative">
            <span
              className="absolute -left-11 top-2 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm"
              style={{ background: TONE[log.status] }}
            >
              <Icon
                size={17}
                strokeWidth={2.4}
                className={log.status === 'Running' ? 'animate-spin' : ''}
              />
            </span>
            <div className="overflow-hidden rounded-[var(--oe-radius)] border border-line bg-surface-alt">
              <div className="flex items-center gap-3 border-b border-line px-3.5 py-2">
                <span className="min-w-0 flex-1 text-[13.5px] font-semibold text-fg">
                  {log.title}
                </span>
                <span className="flex shrink-0 items-center gap-1 font-mono text-[12px] tabular-nums text-fg-muted">
                  <Clock3 size={12} /> {dayjs(log.loggedOn).format('HH:mm:ss')}
                </span>
              </div>
              <p
                className="m-0 px-3.5 py-2 text-[13px] text-fg-secondary"
                style={{ color: log.status === 'Failed' ? TONE.Failed : undefined }}
              >
                {log.message}
              </p>
            </div>
          </li>
        );
      })}
      <li className="relative h-8">
        <span className="absolute -left-11 top-0 flex h-8 w-8 items-center justify-center rounded-full border border-line-strong bg-surface-alt text-fg-muted">
          <Clock3 size={16} />
        </span>
      </li>
    </ol>
  );
}

// ---------------------------------------------------------------- pop-up

function ExecutionDetails({ trigger }: { trigger: RunbookTrigger }) {
  const [tab, setTab] = useState<'processes' | 'logs'>('processes');
  const duration = trigger.executionEndTime
    ? formatDuration(dayjs(trigger.executionEndTime).diff(trigger.executionStartTime, 'second'))
    : 'In progress';

  return (
    <div className="flex flex-col gap-5">
      <dl className="m-0 grid grid-cols-2 gap-x-5 gap-y-3 rounded-[var(--oe-radius)] border border-line bg-surface-alt p-4 sm:grid-cols-3">
        <Detail label="Runbook Trigger ID" value={trigger.runbookTriggerID} />
        <Detail label="Request Type" value={trigger.requestType} />
        <Detail label="Monitoring Tool" value={trigger.monitoringToolName} />
        <Detail label="Scheduler Name" value={trigger.schedulerName} />
        <Detail label="Execution Start Time" value={formatDateTime(trigger.executionStartTime)} />
        <Detail
          label="Execution End Time"
          value={trigger.executionEndTime ? formatDateTime(trigger.executionEndTime) : 'Running...'}
        />
        <Detail label="Executed By" value={trigger.executedBy} />
        <Detail label="Duration" value={duration} />
        <Detail label="Result" value={trigger.logs} />
      </dl>

      <section>
        <Segmented<'processes' | 'logs'>
          value={tab}
          onChange={setTab}
          options={[
            { label: 'Processes', value: 'processes' },
            { label: 'Logs', value: 'logs' },
          ]}
          className="!mb-4"
        />
        {tab === 'processes' ? <ProcessesTab trigger={trigger} /> : <LogsTab trigger={trigger} />}
      </section>
    </div>
  );
}

export function TriggerDetailsModal({
  trigger,
  onClose,
}: {
  trigger?: RunbookTrigger;
  onClose: () => void;
}) {
  return (
    <AppModal
      open={Boolean(trigger)}
      onCancel={onClose}
      footer={null}
      width={860}
      title={
        trigger && (
          <span className="flex flex-wrap items-center gap-3">
            Execution #{trigger.runbookTriggerID} · {trigger.runbookName}
            <StatusTag status={trigger.status} />
          </span>
        )
      }
    >
      {/* key: each execution opens on the Processes tab with everything collapsed. */}
      {trigger && <ExecutionDetails key={trigger.runbookTriggerID} trigger={trigger} />}
    </AppModal>
  );
}
