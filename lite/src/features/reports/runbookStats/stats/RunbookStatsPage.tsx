/**
 * Reports > Runbook Stats > Stats.
 *
 * Functionality:
 * - Filter: Runbook (optional, empty = all runbooks), From Date and To Date (required, default
 *   the last 30 days), then Search. The searched filter is kept in the URL
 *   (?runbook=1&from=2026-10-26&to=2026-11-25), so a reload or a Dashboard link shows it again.
 * - Overview of the result: total runs, runbooks, success / failed / running, success rate,
 *   status bar, runs by request type and by monitoring tool.
 * - Grid: Runbook Trigger ID, Request Type, Monitoring Tool Name, Scheduler Name, Status, Logs,
 *   Created By, Modified By (+ Runbook and Created On), with search, sort and paging.
 * - Clicking a row opens a pop-up with the trigger's processes as a timeline; clicking a
 *   process shows its input parameters and output (TriggerDetailsModal).
 */
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DatePicker, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  BookMarked,
  CircleCheck,
  CircleX,
  ListChecks,
  Loader,
  Search,
  type LucideIcon,
} from 'lucide-react';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppSelect } from '@/components/common/AppSelect';
import { AppTable } from '@/components/common/AppTable';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { FormField } from '@/components/common/FormField';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusTag } from '@/components/common/StatusTag';
import { formatDateTime } from '@/utils/formatters';
import { useRunbooks, useRunbookTriggers } from './runbookStats.api';
import {
  statsFilterSchema,
  type RunbookTrigger,
  type StatsFilterValues,
  type TriggerStatus,
} from './runbookStats.schema';
import { TriggerDetailsModal } from './TriggerDetailsModal';

const DAY = 'YYYY-MM-DD';
const STATUS_COLOUR: Record<TriggerStatus, string> = {
  Success: '#10b981',
  Failed: '#f43f5e',
  Running: '#3b82f6',
};
const BAR_COLOURS = ['#3b82f6', '#a855f7', '#f59e0b', '#10b981', '#06b6d4', '#f43f5e'];

// ---------------------------------------------------------------- overview

function Tile({
  label,
  value,
  icon: Icon,
  from,
  to,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  from: string;
  to: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-[var(--oe-radius-lg)] px-4 py-3.5 text-white shadow-card"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <Icon
        size={64}
        strokeWidth={1.4}
        className="pointer-events-none absolute -bottom-3 -right-2 opacity-[0.16]"
        aria-hidden
      />
      <span className="relative flex items-center gap-2 text-[12.5px] font-medium text-white/90">
        <Icon size={15} strokeWidth={2} /> {label}
      </span>
      <span className="relative mt-2 block font-display text-[26px] font-semibold leading-none tabular-nums">
        {value}
      </span>
    </div>
  );
}

/** Count per value, largest first. */
const countBy = (rows: RunbookTrigger[], key: (r: RunbookTrigger) => string) =>
  [
    ...rows.reduce(
      (map, r) => map.set(key(r), (map.get(key(r)) ?? 0) + 1),
      new Map<string, number>(),
    ),
  ].sort((a, b) => b[1] - a[1]);

function Breakdown({ title, rows }: { title: string; rows: Array<[string, number]> }) {
  const max = Math.max(...rows.map(([, n]) => n), 1);
  return (
    <div>
      <p className="m-0 mb-3 text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-muted">
        {title}
      </p>
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {rows.map(([name, n], i) => (
          <li key={name}>
            <div className="mb-1 flex justify-between text-[12.5px]">
              <span className="text-fg">{name}</span>
              <span className="tabular-nums text-fg-muted">{n}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-active">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(n / max) * 100}%`,
                  background: BAR_COLOURS[i % BAR_COLOURS.length],
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Overview({ rows }: { rows: RunbookTrigger[] }) {
  const count = (s: TriggerStatus) => rows.filter((r) => r.status === s).length;
  const done = count('Success') + count('Failed');
  const rate = done ? Math.round((count('Success') / done) * 100) : 0;
  const runbooks = new Set(rows.map((r) => r.runbookID)).size;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Tile
          label="Total Runs"
          value={rows.length}
          icon={ListChecks}
          from="#2563eb"
          to="#06b6d4"
        />
        <Tile label="Runbooks" value={runbooks} icon={BookMarked} from="#7c3aed" to="#c026d3" />
        <Tile
          label="Success"
          value={count('Success')}
          icon={CircleCheck}
          from="#047857"
          to="#10b981"
        />
        <Tile label="Failed" value={count('Failed')} icon={CircleX} from="#be123c" to="#f43f5e" />
        <Tile label="Running" value={count('Running')} icon={Loader} from="#c2410c" to="#f59e0b" />
      </div>

      <AppCard bodyClassName="p-5">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div>
            <p className="m-0 mb-3 text-[12px] font-semibold uppercase tracking-[0.05em] text-fg-muted">
              Status
            </p>
            <p className="m-0 font-display text-[28px] font-semibold leading-none text-fg">
              {rate}%
              <span className="ml-2 text-[12.5px] font-normal text-fg-muted">success rate</span>
            </p>
            <div className="mt-4 flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-active">
              {(['Success', 'Failed', 'Running'] as TriggerStatus[]).map((s) =>
                count(s) ? (
                  <Tooltip key={s} title={`${s}: ${count(s)}`}>
                    <span
                      className="h-full"
                      style={{ flexGrow: count(s), background: STATUS_COLOUR[s] }}
                    />
                  </Tooltip>
                ) : null,
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-fg-secondary">
              {(['Success', 'Failed', 'Running'] as TriggerStatus[]).map((s) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-[3px]"
                    style={{ background: STATUS_COLOUR[s] }}
                  />
                  {s} <b className="text-fg">{count(s)}</b>
                </span>
              ))}
            </div>
          </div>
          <Breakdown title="By request type" rows={countBy(rows, (r) => r.requestType)} />
          <Breakdown title="By monitoring tool" rows={countBy(rows, (r) => r.monitoringToolName)} />
        </div>
      </AppCard>
    </div>
  );
}

// ---------------------------------------------------------------- page

const searchValues = (r: RunbookTrigger) => [
  r.runbookTriggerID,
  r.runbookName,
  r.requestType,
  r.monitoringToolName,
  r.schedulerName,
  r.status,
  r.logs,
  r.createdBy,
  r.modifiedBy,
];

export default function RunbookStatsPage() {
  const [params, setParams] = useSearchParams();
  // The searched filter lives in the URL; nothing loads until Search (or a link with ?from=).
  const submitted = useMemo<StatsFilterValues | undefined>(() => {
    const runbook = params.get('runbook');
    const from = params.get('from');
    const to = params.get('to');
    if (!runbook && !from) return undefined;
    return {
      runbookId: runbook ?? '',
      fromDate: from ?? dayjs().subtract(30, 'day').format(DAY),
      toDate: to ?? dayjs().format(DAY),
    };
  }, [params]);

  const runbooks = useRunbooks();
  const triggers = useRunbookTriggers(submitted);
  const [selected, setSelected] = useState<RunbookTrigger>();

  const { control, handleSubmit } = useForm<StatsFilterValues>({
    resolver: zodResolver(statsFilterSchema),
    defaultValues: submitted ?? {
      runbookId: '',
      fromDate: dayjs().subtract(30, 'day').format(DAY),
      toDate: dayjs().format(DAY),
    },
  });

  const onSearch = (f: StatsFilterValues) => {
    const next = { runbook: f.runbookId, from: f.fromDate, to: f.toDate };
    if (JSON.stringify(next) === JSON.stringify(Object.fromEntries(params)))
      void triggers.refetch();
    else setParams(next);
  };

  const columns = useMemo<ColumnsType<RunbookTrigger>>(
    () => [
      {
        title: 'Runbook Trigger ID',
        dataIndex: 'runbookTriggerID',
        width: 160,
        fixed: 'left',
        sorter: (a, b) => a.runbookTriggerID - b.runbookTriggerID,
        render: (id: number) => <span className="font-mono font-medium text-primary">#{id}</span>,
      },
      { title: 'Runbook', dataIndex: 'runbookName', width: 200, ellipsis: true },
      { title: 'Request Type', dataIndex: 'requestType', width: 140 },
      { title: 'Monitoring Tool Name', dataIndex: 'monitoringToolName', width: 180 },
      { title: 'Scheduler Name', dataIndex: 'schedulerName', width: 160 },
      {
        title: 'Status',
        dataIndex: 'status',
        width: 120,
        filters: (['Success', 'Failed', 'Running'] as TriggerStatus[]).map((s) => ({
          text: s,
          value: s,
        })),
        onFilter: (value, row) => row.status === value,
        render: (s: TriggerStatus) => <StatusTag status={s} />,
      },
      {
        title: 'Logs',
        dataIndex: 'logs',
        width: 240,
        ellipsis: { showTitle: false },
        render: (text: string) => (
          <Tooltip title={text} placement="topLeft">
            <span className="text-fg-secondary">{text}</span>
          </Tooltip>
        ),
      },
      { title: 'Created By', dataIndex: 'createdBy', width: 120 },
      { title: 'Modified By', dataIndex: 'modifiedBy', width: 120 },
      {
        title: 'Created On',
        dataIndex: 'createdOn',
        width: 180,
        defaultSortOrder: 'descend',
        sorter: (a, b) => a.createdOn.localeCompare(b.createdOn),
        render: (v: string) => <span className="tabular-nums">{formatDateTime(v)}</span>,
      },
    ],
    [],
  );

  const dateField = (name: 'fromDate' | 'toDate', label: string) => (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormField
          label={label}
          required
          htmlFor={`field-${name}`}
          error={fieldState.error?.message}
        >
          <DatePicker
            id={`field-${name}`}
            className="!w-full"
            format="DD-MM-YYYY"
            allowClear={false}
            status={fieldState.error ? 'error' : undefined}
            value={field.value ? dayjs(field.value) : null}
            onChange={(d) => field.onChange(d ? d.format(DAY) : '')}
            disabledDate={(d) => d.isAfter(dayjs(), 'day')}
          />
        </FormField>
      )}
    />
  );

  return (
    <>
      <PageHeader
        title="Runbook Stats"
        description="Search runbook runs by runbook and date. Click a row to see its processes, inputs and outputs."
      />

      <form onSubmit={handleSubmit(onSearch)} noValidate className="mb-5">
        <AppCard bodyClassName="px-5 py-5">
          <div className="grid grid-cols-1 items-start gap-x-5 gap-y-4 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_auto]">
            <AppSelect
              control={control}
              name="runbookId"
              label="Runbook"
              placeholder="All runbooks"
              allowClear
              loading={runbooks.isLoading}
              options={(runbooks.data ?? []).map((r) => ({
                label: r.runbookName,
                value: String(r.runbookID),
              }))}
            />
            {dateField('fromDate', 'From Date')}
            {dateField('toDate', 'To Date')}
            <AppButton
              htmlType="submit"
              icon={<Search size={15} />}
              loading={triggers.isFetching}
              className="xl:mt-[26px]"
            >
              Search
            </AppButton>
          </div>
        </AppCard>
      </form>

      {!submitted ? (
        <AppCard>
          <EmptyState
            icon={Search}
            title="Search runbook runs"
            description="Choose a runbook (or leave it empty for all), pick the dates and press Search."
          />
        </AppCard>
      ) : triggers.error ? (
        <AppCard>
          <ErrorState error={triggers.error} onRetry={() => void triggers.refetch()} />
        </AppCard>
      ) : (
        <div className="oe-stagger flex flex-col gap-5">
          {triggers.data && <Overview rows={triggers.data} />}
          <AppCard
            title="Runbook runs"
            description={`${dayjs(submitted.fromDate).format('DD MMM YYYY')} to ${dayjs(
              submitted.toDate,
            ).format('DD MMM YYYY')} · click a row for details`}
            bodyClassName="p-4"
          >
            <AppTable<RunbookTrigger>
              rowKey="runbookTriggerID"
              columns={columns}
              data={triggers.data}
              loading={triggers.isFetching}
              searchValues={searchValues}
              searchPlaceholder="Search runs..."
              emptyText="No runs in this date range"
              scroll={{ x: 1880 }}
              onRow={(row) => ({
                onClick: () => setSelected(row),
                onKeyDown: (e) => e.key === 'Enter' && setSelected(row),
                tabIndex: 0,
                className: 'cursor-pointer',
              })}
            />
          </AppCard>
        </div>
      )}

      <TriggerDetailsModal trigger={selected} onClose={() => setSelected(undefined)} />
    </>
  );
}
