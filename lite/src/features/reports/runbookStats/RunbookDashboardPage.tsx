/**
 * Reports > Runbook Stats > Dashboard.
 *
 * Functionality:
 * - Headline tiles: solution repositories, runbooks, runs in the last 14 days, success rate,
 *   failed runs.
 * - Repositories by type (C#, PowerShell, SSH ...) as a donut with counts and shares.
 * - Daily successful / failed runs for the last 14 days.
 * - Most-run runbooks with their success rate.
 * - Recent runs; clicking one opens it on the Stats page (overview, stages, logs).
 */
import { useNavigate } from 'react-router-dom';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import {
  ArrowRight,
  BookMarked,
  CircleCheck,
  CircleX,
  FolderGit2,
  CirclePlay,
  type LucideIcon,
} from 'lucide-react';
import { AppCard } from '@/components/common/AppCard';
import { ErrorState } from '@/components/common/ErrorState';
import { Skeleton } from '@/components/common/Skeleton';
import { StatusTag } from '@/components/common/StatusTag';
import { PageHeader } from '@/components/common/PageHeader';
import { ROUTES } from '@/config/routes';
import { ExecutionTrendChart } from '@/features/home/components/ExecutionTrendChart';
import { useTheme } from '@/hooks/useTheme';
import { formatDateTime, formatDuration } from '@/utils/formatters';
import { useRunbookDashboard } from './runbookStats.api';
import type { RepositoryTypeCount, RunbookDashboard } from './runbookStats.schema';

// ---------------------------------------------------------------- tiles

interface Tile {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  highlight?: boolean;
}

function StatTile({ label, value, hint, icon: Icon, highlight }: Tile) {
  return (
    <div
      className={`oe-card flex flex-col gap-3 px-5 py-4 ${
        highlight ? 'oe-card--tinted oe-gradient-border' : ''
      }`}
    >
      <span className="flex items-center gap-2.5 text-[12.5px] font-medium text-fg-muted">
        <span className="oe-icon-tile h-8 w-8 rounded-[9px]">
          <Icon size={15} strokeWidth={1.9} />
        </span>
        {label}
      </span>
      <span
        className={`font-display text-[28px] font-semibold leading-none tracking-[-0.03em] tabular-nums ${
          highlight ? 'oe-text-gradient' : 'text-fg'
        }`}
      >
        {value}
      </span>
      <span className="text-[12px] text-fg-muted">{hint}</span>
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
      highlight: true,
    },
    {
      label: 'Total Runbooks',
      value: String(data.totalRunbooks),
      hint: 'Defined in the orchestrator',
      icon: BookMarked,
    },
    { label: 'Runs', value: String(runs), hint: 'Last 14 days', icon: CirclePlay },
    {
      label: 'Success rate',
      value: runs ? `${Math.round((success / runs) * 100)}%` : '-',
      hint: `${success} successful runs`,
      icon: CircleCheck,
    },
    { label: 'Failed runs', value: String(failed), hint: 'Last 14 days', icon: CircleX },
  ];
}

// ---------------------------------------------------------------- repositories donut

function RepositoryDonut({ data, total }: { data: RepositoryTypeCount[]; total: number }) {
  const { tokens } = useTheme();
  const colors = [tokens.chart1, tokens.chart1End, tokens.warning, tokens.success, tokens.chart2];
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
              cornerRadius={4}
              stroke="none"
              animationDuration={700}
            >
              {data.map((d, i) => (
                <Cell key={d.typeName} fill={colors[i % colors.length]} />
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
          <span className="font-display text-[26px] font-semibold leading-none text-fg">
            {total}
          </span>
          <span className="mt-1 text-[11.5px] text-fg-muted">repositories</span>
        </div>
      </div>
      <ul className="m-0 flex w-full list-none flex-col gap-3 p-0">
        {data.map((d, i) => {
          const share = total ? Math.round((d.count / total) * 100) : 0;
          return (
            <li key={d.typeName}>
              <div className="mb-1.5 flex items-center gap-2 text-[13px]">
                <span
                  className="h-2.5 w-2.5 rounded-[3px]"
                  style={{ background: colors[i % colors.length] }}
                />
                <span className="text-fg">{d.typeName}</span>
                <span className="ml-auto tabular-nums text-fg-muted">
                  {d.count} · {share}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-active">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${share}%`, background: colors[i % colors.length] }}
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
            className="xl:col-span-2"
          >
            <ExecutionTrendChart data={data.dailyRuns} />
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
              {data.topRunbooks.map((r) => (
                <li key={r.runbookName}>
                  <div className="mb-1.5 flex items-center gap-3 text-[13px]">
                    <span className="min-w-0 truncate font-medium text-fg">{r.runbookName}</span>
                    <span className="ml-auto shrink-0 tabular-nums text-fg-muted">
                      {r.runs} runs
                    </span>
                    <span
                      className="w-12 shrink-0 text-right font-medium tabular-nums"
                      style={{
                        color:
                          r.successRate >= 90
                            ? 'var(--oe-success)'
                            : r.successRate >= 70
                              ? 'var(--oe-warning)'
                              : 'var(--oe-error)',
                      }}
                    >
                      {r.successRate}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-active">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,var(--oe-chart-1),var(--oe-chart-1-end))]"
                      style={{ width: `${(r.runs / maxRuns) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </AppCard>

          <AppCard
            title="Recent runs"
            description="Click a run to open its stages and logs"
            bodyClassName="p-2"
          >
            <ul className="m-0 flex list-none flex-col p-0">
              {data.recentRuns.map((run) => (
                <li key={`${run.runbookID}-${run.startedOn}`}>
                  <button
                    type="button"
                    onClick={() => navigate(`${ROUTES.runbookStats}?runbook=${run.runbookID}`)}
                    className="group flex w-full cursor-pointer items-center gap-3 rounded-[var(--oe-radius)] border-0 bg-transparent px-3 py-2.5 text-left font-[inherit] hover:bg-hover"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-medium text-fg">
                        {run.runbookName}
                      </span>
                      <span className="mt-0.5 flex flex-wrap gap-x-3 text-[12px] text-fg-muted">
                        <span>{run.toolName}</span>
                        <span className="tabular-nums">{formatDateTime(run.startedOn)}</span>
                        <span className="tabular-nums">{formatDuration(run.durationSeconds)}</span>
                      </span>
                    </span>
                    <StatusTag status={run.status} />
                    <ArrowRight
                      size={15}
                      className="shrink-0 text-primary opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </AppCard>
        </div>
      </div>
    </>
  );
}
