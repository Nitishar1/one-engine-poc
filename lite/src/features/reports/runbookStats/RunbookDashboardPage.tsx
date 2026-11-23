/**
 * Reports > Runbook Stats > Dashboard.
 *
 * Functionality:
 * - Headline tiles (each its own colour): solution repositories, runbooks, runs in the last
 *   14 days, success rate, failed runs.
 * - Repositories by type (C#, PowerShell, SSH ...) as a colourful donut with counts and shares.
 * - Daily successful / failed runs for the last 14 days (stacked gradient bars).
 * - Most-run runbooks with their success rate.
 * - Recent runs; clicking one opens it on the Stats page (overview, stages, logs).
 */
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowRight,
  BookMarked,
  CircleCheck,
  CirclePlay,
  CircleX,
  FolderGit2,
  type LucideIcon,
} from 'lucide-react';
import { AppCard } from '@/components/common/AppCard';
import { ErrorState } from '@/components/common/ErrorState';
import { PageHeader } from '@/components/common/PageHeader';
import { Skeleton } from '@/components/common/Skeleton';
import { StatusTag } from '@/components/common/StatusTag';
import { ROUTES } from '@/config/routes';
import { useTheme } from '@/hooks/useTheme';
import { formatDateTime, formatDuration } from '@/utils/formatters';
import { useRunbookDashboard } from './runbookStats.api';
import type { DailyRunPoint, RepositoryTypeCount, RunbookDashboard } from './runbookStats.schema';

// ---------------------------------------------------------------- colours

/** Dashboard palette: [start, end] of each gradient. Readable with white text in both themes. */
const PALETTE = {
  blue: ['#2563eb', '#06b6d4'],
  violet: ['#7c3aed', '#c026d3'],
  emerald: ['#047857', '#10b981'],
  amber: ['#c2410c', '#f59e0b'],
  rose: ['#be123c', '#f43f5e'],
} as const;
type PaletteKey = keyof typeof PALETTE;

/** Solid colours for chart series, donut slices and bars (cycled). */
const SERIES = ['#3b82f6', '#a855f7', '#f59e0b', '#10b981', '#f43f5e', '#06b6d4'];

const gradient = (key: PaletteKey, angle = 135) =>
  `linear-gradient(${angle}deg, ${PALETTE[key][0]}, ${PALETTE[key][1]})`;

/** Same name -> same colour, for the recent-run badges. */
const colourOf = (name: string) =>
  SERIES[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % SERIES.length];

// ---------------------------------------------------------------- tiles

interface Tile {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  colour: PaletteKey;
}

function StatTile({ label, value, hint, icon: Icon, colour }: Tile) {
  return (
    <div
      className="relative overflow-hidden rounded-[var(--oe-radius-lg)] px-5 py-4 text-white shadow-card transition-transform duration-200 hover:-translate-y-0.5"
      style={{ background: gradient(colour) }}
    >
      {/* Large faded icon and a soft light spot for depth. */}
      <Icon
        size={92}
        strokeWidth={1.4}
        className="pointer-events-none absolute -bottom-5 -right-4 opacity-[0.16]"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-white/15 blur-2xl"
        aria-hidden
      />
      <span className="relative flex items-center gap-2.5 text-[12.5px] font-medium text-white/90">
        <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-white/20 backdrop-blur-sm">
          <Icon size={15} strokeWidth={2} />
        </span>
        {label}
      </span>
      <span className="relative mt-3 block font-display text-[30px] font-semibold leading-none tracking-[-0.03em] tabular-nums">
        {value}
      </span>
      <span className="relative mt-2 block text-[12px] text-white/80">{hint}</span>
    </div>
  );
}

function tilesOf(data: RunbookDashboard): Tile[] {
  const success = data.dailyRuns.reduce((sum, d) => sum + d.success, 0);
  const failed = data.dailyRuns.reduce((sum, d) => sum + d.failed, 0);
  const runs = success + failed;
  return [
    {
      label: 'Solution Repositories',
      value: String(data.totalSolutionRepositories),
      hint: `${data.repositoriesByType.length} script types`,
      icon: FolderGit2,
      colour: 'blue',
    },
    {
      label: 'Total Runbooks',
      value: String(data.totalRunbooks),
      hint: 'Defined in the orchestrator',
      icon: BookMarked,
      colour: 'violet',
    },
    { label: 'Runs', value: String(runs), hint: 'Last 14 days', icon: CirclePlay, colour: 'amber' },
    {
      label: 'Success rate',
      value: runs ? `${Math.round((success / runs) * 100)}%` : '-',
      hint: `${success} successful runs`,
      icon: CircleCheck,
      colour: 'emerald',
    },
    {
      label: 'Failed runs',
      value: String(failed),
      hint: 'Last 14 days',
      icon: CircleX,
      colour: 'rose',
    },
  ];
}

// ---------------------------------------------------------------- charts

function TooltipBox({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: DailyRunPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="oe-glass min-w-[150px] rounded-lg border border-line-strong px-3 py-2.5 text-[12.5px] shadow-pop">
      <div className="mb-1.5 flex justify-between gap-4 font-medium text-fg">
        <span>{p.date}</span>
        <span className="tabular-nums text-fg-muted">{p.success + p.failed} runs</span>
      </div>
      {[
        { label: 'Success', value: p.success, colour: PALETTE.emerald[1] },
        { label: 'Failed', value: p.failed, colour: PALETTE.rose[1] },
      ].map((r) => (
        <div key={r.label} className="flex items-center gap-2 py-0.5 text-fg-secondary">
          <span className="h-2 w-2 rounded-[2px]" style={{ background: r.colour }} />
          {r.label}
          <span className="ml-auto font-medium tabular-nums text-fg">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

/** Stacked bars per day: green success with a rose failed cap. */
function DailyRunsChart({ data }: { data: DailyRunPoint[] }) {
  const { tokens } = useTheme();
  const axis = { fontSize: 11.5, fill: tokens.textMuted };
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }} barSize={18}>
          <defs>
            <linearGradient id="rb-success" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#34d399" />
              <stop offset="1" stopColor="#0d9488" />
            </linearGradient>
            <linearGradient id="rb-failed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fb7185" />
              <stop offset="1" stopColor="#f97316" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={tokens.chartGrid} vertical={false} strokeDasharray="3 4" />
          <XAxis
            dataKey="date"
            tick={axis}
            tickLine={false}
            axisLine={{ stroke: tokens.border }}
            interval="preserveStartEnd"
            minTickGap={12}
          />
          <YAxis allowDecimals={false} tick={axis} tickLine={false} axisLine={false} width={48} />
          <Tooltip
            cursor={{ fill: tokens.hover }}
            content={<TooltipBox />}
            isAnimationActive={false}
          />
          <Bar dataKey="success" stackId="runs" fill="url(#rb-success)" animationDuration={700} />
          <Bar
            dataKey="failed"
            stackId="runs"
            fill="url(#rb-failed)"
            radius={[5, 5, 0, 0]}
            animationDuration={700}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-4 text-[12px] text-fg-secondary">
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: gradient('emerald') }} />
        Success
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: gradient('rose') }} />
        Failed
      </span>
    </div>
  );
}

function RepositoryDonut({ data, total }: { data: RepositoryTypeCount[]; total: number }) {
  const { tokens } = useTheme();
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row xl:flex-col 2xl:flex-row">
      <div className="relative h-[180px] w-[180px] shrink-0">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="typeName"
              innerRadius={58}
              outerRadius={84}
              paddingAngle={3}
              cornerRadius={5}
              stroke="none"
              animationDuration={700}
            >
              {data.map((d, i) => (
                <Cell key={d.typeName} fill={SERIES[i % SERIES.length]} />
              ))}
            </Pie>
            <Tooltip
              isAnimationActive={false}
              contentStyle={{
                background: tokens.surfaceElevated,
                border: `1px solid ${tokens.borderStrong}`,
                borderRadius: 8,
                fontSize: 12.5,
              }}
              itemStyle={{ color: tokens.textPrimary }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="oe-text-gradient font-display text-[28px] font-semibold leading-none">
            {total}
          </span>
          <span className="mt-1 text-[11.5px] text-fg-muted">repositories</span>
        </div>
      </div>
      <ul className="m-0 flex w-full list-none flex-col gap-3 p-0">
        {data.map((d, i) => {
          const share = total ? Math.round((d.count / total) * 100) : 0;
          const colour = SERIES[i % SERIES.length];
          return (
            <li
              key={d.typeName}
              className="rounded-[var(--oe-radius)] px-3 py-2"
              style={{ background: `color-mix(in srgb, ${colour} 10%, transparent)` }}
            >
              <div className="mb-1.5 flex items-center gap-2 text-[13px]">
                <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: colour }} />
                <span className="font-medium text-fg">{d.typeName}</span>
                <span className="ml-auto tabular-nums text-fg-secondary">
                  <b className="text-fg">{d.count}</b> · {share}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-active">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${share}%`, background: colour }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------- page

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-5" role="status" aria-label="Loading">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[118px] rounded-[var(--oe-radius-lg)]" />
        ))}
      </div>
      <Skeleton className="h-[340px] rounded-[var(--oe-radius-lg)]" />
      <Skeleton className="h-[300px] rounded-[var(--oe-radius-lg)]" />
    </div>
  );
}

const rateColour = (rate: number) =>
  rate >= 90 ? PALETTE.emerald[1] : rate >= 70 ? PALETTE.amber[1] : PALETTE.rose[1];

export default function RunbookDashboardPage() {
  const navigate = useNavigate();
  const dashboard = useRunbookDashboard();
  const data = dashboard.data;

  const header = (
    <PageHeader
      title="Runbook Dashboard"
      description="Solution repositories, runbooks and how their runs went over the last 14 days."
    />
  );

  if (dashboard.error)
    return (
      <>
        {header}
        <AppCard>
          <ErrorState error={dashboard.error} onRetry={() => void dashboard.refetch()} />
        </AppCard>
      </>
    );
  if (!data)
    return (
      <>
        {header}
        <DashboardSkeleton />
      </>
    );

  const maxRuns = Math.max(...data.topRunbooks.map((r) => r.runs), 1);
  const barColours: PaletteKey[] = ['blue', 'violet', 'amber', 'emerald', 'rose'];

  return (
    <>
      {header}
      <div className="oe-stagger flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {tilesOf(data).map((tile) => (
            <StatTile key={tile.label} {...tile} />
          ))}
        </div>

        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-3">
          <AppCard
            title="Runbook runs"
            description="Successful and failed runs per day, last 14 days"
            extra={<Legend />}
            className="xl:col-span-2"
          >
            <DailyRunsChart data={data.dailyRuns} />
          </AppCard>
          <AppCard title="Repositories by type" description="Solution repositories per script type">
            <RepositoryDonut
              data={data.repositoriesByType}
              total={data.totalSolutionRepositories}
            />
          </AppCard>
        </div>

        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
          <AppCard title="Most-run runbooks" description="Runs and success rate, last 14 days">
            <ul className="m-0 flex list-none flex-col gap-4 p-0">
              {data.topRunbooks.map((r, i) => {
                const colour = barColours[i % barColours.length];
                return (
                  <li key={r.runbookName} className="flex items-center gap-3">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] text-[13px] font-semibold text-white"
                      style={{ background: gradient(colour) }}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-center gap-3 text-[13px]">
                        <span className="min-w-0 truncate font-medium text-fg">
                          {r.runbookName}
                        </span>
                        <span className="ml-auto shrink-0 tabular-nums text-fg-muted">
                          {r.runs} runs
                        </span>
                        <span
                          className="w-14 shrink-0 rounded-full px-2 text-center text-[12px] font-semibold tabular-nums leading-5"
                          style={{
                            color: rateColour(r.successRate),
                            background: `color-mix(in srgb, ${rateColour(r.successRate)} 14%, transparent)`,
                          }}
                        >
                          {r.successRate}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-active">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(r.runs / maxRuns) * 100}%`,
                            background: gradient(colour, 90),
                          }}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </AppCard>

          <AppCard
            title="Recent runs"
            description="Click a run to open its stages and logs"
            bodyClassName="p-2"
          >
            <ul className="m-0 flex list-none flex-col p-0">
              {data.recentRuns.map((run) => {
                const colour = colourOf(run.runbookName);
                return (
                  <li key={`${run.runbookID}-${run.startedOn}`}>
                    <button
                      type="button"
                      onClick={() => navigate(`${ROUTES.runbookStats}?runbook=${run.runbookID}`)}
                      className="group flex w-full cursor-pointer items-center gap-3 rounded-[var(--oe-radius)] border-0 bg-transparent px-3 py-2.5 text-left font-[inherit] hover:bg-hover"
                    >
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12.5px] font-semibold"
                        style={{
                          color: colour,
                          background: `color-mix(in srgb, ${colour} 16%, transparent)`,
                        }}
                        aria-hidden
                      >
                        {run.runbookName.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium text-fg">
                          {run.runbookName}
                        </span>
                        <span className="mt-0.5 flex flex-wrap gap-x-3 text-[12px] text-fg-muted">
                          <span style={{ color: colour }}>{run.toolName}</span>
                          <span className="tabular-nums">{formatDateTime(run.startedOn)}</span>
                          <span className="tabular-nums">
                            {formatDuration(run.durationSeconds)}
                          </span>
                        </span>
                      </span>
                      <StatusTag status={run.status} />
                      <ArrowRight
                        size={15}
                        className="shrink-0 text-primary opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </AppCard>
        </div>
      </div>
    </>
  );
}
