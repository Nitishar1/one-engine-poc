/**
 * The result of the Stats page for one runbook run.
 *
 * Functionality:
 * - Overview first: runbook, tool, target, status, start time, duration, stage counts, and a
 *   progress strip with one coloured segment per stage (click a segment to open that stage).
 * - Stages are listed collapsed. Clicking a stage expands it and shows two views:
 *   Timeline (the events, like the old page) and Logs (searchable, level filter, copy).
 * - Expand all / Collapse all. A failed stage is opened automatically.
 */
import { useMemo, useState } from 'react';
import { Input, Segmented, Tooltip } from 'antd';
import {
  CalendarClock,
  ChevronDown,
  CircleCheck,
  CircleX,
  Copy,
  Layers,
  Loader,
  Search,
  Server,
  Timer,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusTag } from '@/components/common/StatusTag';
import { toast } from '@/components/feedback/toastStore';
import { formatDateTime, formatDuration } from '@/utils/formatters';
import dayjs from 'dayjs';
import type {
  ActivityStage,
  LogLevel,
  LogLine,
  RunbookActivity,
  RunStatus,
} from './runbookStats.schema';

export const STATUS_TONE: Record<RunStatus, string> = {
  Success: 'var(--oe-success)',
  Failed: 'var(--oe-error)',
  Running: 'var(--oe-info)',
  Skipped: 'var(--oe-text-muted)',
};

const LEVEL_TONE: Record<LogLevel, string> = {
  INFO: 'var(--oe-info)',
  WARN: 'var(--oe-warning)',
  ERROR: 'var(--oe-error)',
  DEBUG: 'var(--oe-text-muted)',
};

const time = (value: string) => dayjs(value).format('HH:mm:ss');

// ---------------------------------------------------------------- overview

function Fact({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="oe-icon-tile h-8 w-8 shrink-0 rounded-[9px]">
        <Icon size={15} strokeWidth={1.9} />
      </span>
      <span className="min-w-0">
        <span className="block text-[11.5px] text-fg-muted">{label}</span>
        <span className="block truncate text-[13.5px] font-medium text-fg">{value}</span>
      </span>
    </div>
  );
}

function Count({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-[var(--oe-radius)] border border-line bg-surface-alt px-4 py-3">
      <span className="flex items-center gap-2 text-[12px] text-fg-muted">
        <span className="h-2 w-2 rounded-full" style={{ background: tone }} />
        {label}
      </span>
      <span className="mt-1 block font-display text-[24px] font-semibold leading-none tabular-nums text-fg">
        {value}
      </span>
    </div>
  );
}

function Overview({
  activity,
  onOpenStage,
}: {
  activity: RunbookActivity;
  onOpenStage: (stageID: number) => void;
}) {
  const count = (status: RunStatus) => activity.stages.filter((s) => s.status === status).length;
  const total = activity.stages.reduce((sum, s) => sum + Math.max(s.durationSeconds, 1), 0);

  return (
    <AppCard
      title={
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="m-0 text-[16px] font-semibold text-fg">{activity.runbookName}</h2>
          <StatusTag status={activity.status} />
        </div>
      }
      description="Overview of this run. Open a stage below to see its timeline and logs."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Fact icon={Layers} label="Tool" value={activity.toolName} />
        <Fact icon={Server} label="Target" value={activity.target} />
        <Fact icon={CalendarClock} label="Started" value={formatDateTime(activity.startedOn)} />
        <Fact icon={Timer} label="Duration" value={formatDuration(activity.durationSeconds)} />
        <Fact icon={UserRound} label="Triggered by" value={activity.triggeredBy} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Count label="Stages" value={activity.stages.length} tone="var(--oe-primary)" />
        <Count label="Succeeded" value={count('Success')} tone={STATUS_TONE.Success} />
        <Count label="Failed" value={count('Failed')} tone={STATUS_TONE.Failed} />
        <Count
          label="Skipped / running"
          value={count('Skipped') + count('Running')}
          tone={STATUS_TONE.Skipped}
        />
      </div>

      <p className="m-0 mb-2 mt-5 text-[12px] font-medium text-fg-muted">Stage progress</p>
      <div className="flex h-3 w-full gap-1 overflow-hidden rounded-full">
        {activity.stages.map((stage) => (
          <Tooltip
            key={stage.stageID}
            title={`${stage.stageName}: ${stage.status}${
              stage.durationSeconds ? `, ${formatDuration(stage.durationSeconds)}` : ''
            }`}
          >
            <button
              type="button"
              aria-label={`Open stage ${stage.stageName}`}
              onClick={() => onOpenStage(stage.stageID)}
              className="h-full min-w-[14px] cursor-pointer border-0 p-0 transition-opacity hover:opacity-80"
              style={{
                flexGrow: Math.max(stage.durationSeconds, 1) / total,
                background: STATUS_TONE[stage.status],
                opacity: stage.status === 'Skipped' ? 0.35 : 1,
              }}
            />
          </Tooltip>
        ))}
      </div>
    </AppCard>
  );
}

// ---------------------------------------------------------------- stage details

function StageTimeline({ stage }: { stage: ActivityStage }) {
  if (!stage.events.length)
    return <EmptyState compact title="No events" description="This stage did not run." />;
  return (
    <ol className="oe-timeline m-0 list-none p-0">
      {stage.events.map((event) => (
        <li
          key={event.eventID}
          className={`oe-timeline__item ${event.status === 'Running' ? 'is-live' : ''}`}
          style={{ ['--tone' as string]: STATUS_TONE[event.status] }}
        >
          <span className="oe-timeline__dot" aria-hidden />
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <span className="min-w-0 truncate text-[13.5px] font-medium text-fg">
              {event.title}
            </span>
            <span className="ml-auto font-mono text-[12px] tabular-nums text-fg-muted">
              {time(event.occurredOn)}
            </span>
          </div>
          <p className="m-0 mt-1 text-[13px] text-fg-secondary">{event.message}</p>
        </li>
      ))}
    </ol>
  );
}

function StageLogs({ logs }: { logs: LogLine[] }) {
  const [level, setLevel] = useState<'ALL' | LogLevel>('ALL');
  const [query, setQuery] = useState('');
  const shown = logs.filter(
    (l) =>
      (level === 'ALL' || l.level === level) &&
      (!query || l.message.toLowerCase().includes(query.toLowerCase())),
  );
  const copy = async () => {
    const text = logs
      .map((l) => `${time(l.loggedOn)} ${l.level.padEnd(5)} ${l.message}`)
      .join('\n');
    try {
      await navigator.clipboard.writeText(text);
      void toast.success('Logs copied');
    } catch {
      void toast.error('Clipboard is not available');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Segmented<'ALL' | LogLevel>
          size="small"
          value={level}
          onChange={setLevel}
          options={['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG']}
        />
        <Input
          size="small"
          allowClear
          placeholder="Search logs"
          prefix={<Search size={13} className="text-fg-muted" />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="!w-[220px]"
        />
        <AppButton tone="secondary" size="small" icon={<Copy size={13} />} onClick={copy}>
          Copy
        </AppButton>
      </div>
      <div className="max-h-[320px] overflow-auto rounded-[var(--oe-radius)] border border-line bg-surface-sunken p-3 font-mono text-[12.5px] leading-6">
        {shown.length ? (
          shown.map((l, i) => (
            <div key={i} className="flex gap-3 whitespace-pre-wrap break-all">
              <span className="shrink-0 tabular-nums text-fg-muted">{time(l.loggedOn)}</span>
              <span className="w-12 shrink-0 font-semibold" style={{ color: LEVEL_TONE[l.level] }}>
                {l.level}
              </span>
              <span className="min-w-0 text-fg">{l.message}</span>
            </div>
          ))
        ) : (
          <span className="text-fg-muted">No log lines match.</span>
        )}
      </div>
    </div>
  );
}

const STAGE_ICON: Record<RunStatus, LucideIcon> = {
  Success: CircleCheck,
  Failed: CircleX,
  Running: Loader,
  Skipped: CircleCheck,
};

function StageRow({
  stage,
  index,
  open,
  onToggle,
}: {
  stage: ActivityStage;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const [view, setView] = useState<'timeline' | 'logs'>('timeline');
  const Icon = STAGE_ICON[stage.status];
  const errors = stage.logs.filter((l) => l.level === 'ERROR').length;

  return (
    <li
      id={`stage-${stage.stageID}`}
      className={`oe-card overflow-hidden transition-shadow ${open ? 'shadow-pop' : ''}`}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent px-4 py-3 text-left font-[inherit] hover:bg-hover"
      >
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{
            color: STATUS_TONE[stage.status],
            background: `color-mix(in srgb, ${STATUS_TONE[stage.status]} 14%, transparent)`,
          }}
        >
          <Icon size={16} className={stage.status === 'Running' ? 'animate-spin' : ''} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-medium text-fg">
            <span className="mr-2 tabular-nums text-fg-muted">{index + 1}.</span>
            {stage.stageName}
          </span>
          <span className="mt-0.5 flex flex-wrap gap-x-3 text-[12px] text-fg-muted">
            <span className="tabular-nums">{time(stage.startedOn)}</span>
            {stage.durationSeconds > 0 && <span>{formatDuration(stage.durationSeconds)}</span>}
            <span>{stage.events.length} events</span>
            <span>{stage.logs.length} log lines</span>
            {errors > 0 && (
              <span className="text-danger">
                {errors} {errors === 1 ? 'error' : 'errors'}
              </span>
            )}
          </span>
        </span>
        <StatusTag status={stage.status} />
        <ChevronDown
          size={17}
          className={`shrink-0 text-fg-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="oe-animate-in border-t border-line px-4 py-4">
          <Segmented<'timeline' | 'logs'>
            value={view}
            onChange={setView}
            options={[
              { label: 'Timeline', value: 'timeline' },
              { label: `Logs (${stage.logs.length})`, value: 'logs' },
            ]}
            className="!mb-4"
          />
          {view === 'timeline' ? <StageTimeline stage={stage} /> : <StageLogs logs={stage.logs} />}
        </div>
      )}
    </li>
  );
}

// ---------------------------------------------------------------- page section

export function RunbookActivityView({ activity }: { activity: RunbookActivity }) {
  // A failed stage opens by itself; everything else starts collapsed.
  const initiallyOpen = useMemo(
    () => new Set(activity.stages.filter((s) => s.status === 'Failed').map((s) => s.stageID)),
    [activity],
  );
  const [openIds, setOpenIds] = useState<Set<number>>(initiallyOpen);
  const allOpen = openIds.size === activity.stages.length;

  const toggle = (id: number) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const openStage = (id: number) => {
    setOpenIds((prev) => new Set(prev).add(id));
    requestAnimationFrame(() =>
      document
        .getElementById(`stage-${id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    );
  };

  return (
    <div className="oe-stagger flex flex-col gap-5">
      <Overview activity={activity} onOpenStage={openStage} />

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="m-0 text-[14px] font-semibold text-fg">
            Stages <span className="font-normal text-fg-muted">({activity.stages.length})</span>
          </h2>
          <AppButton
            tone="secondary"
            size="small"
            onClick={() =>
              setOpenIds(allOpen ? new Set() : new Set(activity.stages.map((s) => s.stageID)))
            }
          >
            {allOpen ? 'Collapse all' : 'Expand all'}
          </AppButton>
        </div>
        <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
          {activity.stages.map((stage, index) => (
            <StageRow
              key={stage.stageID}
              stage={stage}
              index={index}
              open={openIds.has(stage.stageID)}
              onToggle={() => toggle(stage.stageID)}
            />
          ))}
        </ol>
      </section>
    </div>
  );
}
