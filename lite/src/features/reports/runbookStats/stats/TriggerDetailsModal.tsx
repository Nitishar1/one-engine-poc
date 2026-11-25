/**
 * Pop-up opened by clicking a row of the Stats grid.
 *
 * Functionality:
 * - Top: the trigger's details (ID, runbook, status, request type, monitoring tool, scheduler,
 *   created / modified, logs).
 * - Processes as a vertical timeline (START ... END), in the order the API returns them.
 * - Click a ProcessName to expand it: its input parameters (name / value) and its output.
 *   Expand all / Collapse all. For a failed run the last process is red, for a running one blue.
 */
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AppButton } from '@/components/common/AppButton';
import { AppModal } from '@/components/common/AppModal';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Skeleton } from '@/components/common/Skeleton';
import { StatusTag } from '@/components/common/StatusTag';
import { formatDateTime } from '@/utils/formatters';
import { useTriggerProcesses } from './runbookStats.api';
import type { RunbookTrigger, TriggerProcess } from './runbookStats.schema';

const TONE = {
  done: 'var(--oe-success)',
  failed: 'var(--oe-error)',
  running: 'var(--oe-info)',
};

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11.5px] text-fg-muted">{label}</dt>
      <dd className="m-0 mt-0.5 break-words text-[13px] font-medium text-fg">{value}</dd>
    </div>
  );
}

function ProcessItem({
  process,
  index,
  tone,
  open,
  onToggle,
}: {
  process: TriggerProcess;
  index: number;
  tone: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <li
      className={`oe-timeline__item ${tone === TONE.running ? 'is-live' : ''}`}
      style={{ ['--tone' as string]: tone }}
    >
      <span className="oe-timeline__dot" aria-hidden />
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center gap-3 rounded-[var(--oe-radius)] border border-line bg-surface-alt px-3 py-2 text-left font-[inherit] hover:bg-hover"
      >
        <span className="tabular-nums text-[12px] text-fg-muted">{index + 1}</span>
        <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-fg">
          {process.ProcessName}
        </span>
        <span className="shrink-0 text-[12px] text-fg-muted">
          {process.inputs.length} input{process.inputs.length === 1 ? '' : 's'}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-fg-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="oe-animate-in mt-2 flex flex-col gap-3 pl-1">
          <div>
            <p className="m-0 mb-1.5 text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-muted">
              Input parameters
            </p>
            {process.inputs.length ? (
              <table className="w-full border-collapse overflow-hidden rounded-[var(--oe-radius)] text-[12.5px]">
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
              style={{ color: tone === TONE.failed ? TONE.failed : undefined }}
            >
              {process.output || '(no output)'}
            </pre>
          </div>
        </div>
      )}
    </li>
  );
}

function ProcessTimeline({ trigger }: { trigger: RunbookTrigger }) {
  const processes = useTriggerProcesses(trigger.runbookTriggerID);
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set());

  if (processes.error)
    return <ErrorState error={processes.error} onRetry={() => void processes.refetch()} />;
  if (!processes.data)
    return (
      <div className="flex flex-col gap-2" role="status" aria-label="Loading">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded-[var(--oe-radius)]" />
        ))}
      </div>
    );
  const list = processes.data;
  if (!list.length) return <EmptyState compact title="No processes recorded" />;

  const last = list.length - 1;
  const toneOf = (i: number) =>
    i < last
      ? TONE.done
      : trigger.status === 'Failed'
        ? TONE.failed
        : trigger.status === 'Running'
          ? TONE.running
          : TONE.done;
  const allOpen = openIndexes.size === list.length;
  const toggle = (i: number) =>
    setOpenIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="m-0 text-[14px] font-semibold text-fg">
          Processes <span className="font-normal text-fg-muted">({list.length})</span>
        </h3>
        <AppButton
          tone="secondary"
          size="small"
          onClick={() => setOpenIndexes(allOpen ? new Set() : new Set(list.map((_, i) => i)))}
        >
          {allOpen ? 'Collapse all' : 'Expand all'}
        </AppButton>
      </div>
      <ol className="oe-timeline m-0 list-none p-0">
        {list.map((process, i) => (
          <ProcessItem
            key={`${process.ProcessName}-${i}`}
            process={process}
            index={i}
            tone={toneOf(i)}
            open={openIndexes.has(i)}
            onToggle={() => toggle(i)}
          />
        ))}
      </ol>
    </>
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
      width={820}
      title={
        trigger && (
          <span className="flex flex-wrap items-center gap-3">
            Trigger #{trigger.runbookTriggerID} · {trigger.runbookName}
            <StatusTag status={trigger.status} />
          </span>
        )
      }
    >
      {trigger && (
        <div className="flex flex-col gap-5">
          <dl className="m-0 grid grid-cols-2 gap-x-5 gap-y-3 rounded-[var(--oe-radius)] border border-line bg-surface-alt p-4 sm:grid-cols-3">
            <Detail label="Runbook Trigger ID" value={trigger.runbookTriggerID} />
            <Detail label="Request Type" value={trigger.requestType} />
            <Detail label="Monitoring Tool" value={trigger.monitoringToolName} />
            <Detail label="Scheduler Name" value={trigger.schedulerName} />
            <Detail
              label="Created"
              value={`${trigger.createdBy} · ${formatDateTime(trigger.createdOn)}`}
            />
            <Detail
              label="Modified"
              value={`${trigger.modifiedBy} · ${formatDateTime(trigger.modifiedOn)}`}
            />
            <div className="col-span-2 sm:col-span-3">
              <Detail label="Logs" value={trigger.logs} />
            </div>
          </dl>
          <section>
            {/* key: each trigger starts with every process collapsed. */}
            <ProcessTimeline key={trigger.runbookTriggerID} trigger={trigger} />
          </section>
        </div>
      )}
    </AppModal>
  );
}
