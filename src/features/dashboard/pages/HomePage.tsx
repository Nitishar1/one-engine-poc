import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  Database,
  FileBarChart,
  MonitorSmartphone,
  Network,
  Plus,
  Sparkles,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import { AppCard } from '@/components/common/AppCard';
import { AppButton } from '@/components/common/AppButton';
import { ErrorState } from '@/components/common/ErrorState';
import { Skeleton } from '@/components/common/Skeleton';
import { ROUTES } from '@/config/routes';
import { useAuthStore } from '@/stores/authStore';
import { APP_CONFIG } from '@/utils/constants';
import { useDashboardSummary } from '../hooks/useDashboard';
import type { DashboardSummary } from '../types/dashboard.types';
import { KpiStrip } from '../components/KpiStrip';
import { ExecutionTrendChart } from '../components/ExecutionTrendChart';
import { SuccessRateChart } from '../components/SuccessRateChart';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { InfrastructureHealth } from '../components/InfrastructureHealth';
import { AiAutomationPanel } from '../components/AiAutomationPanel';

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const QUICK_ACTIONS: Array<{ label: string; text: string; icon: LucideIcon; path: string }> = [
  {
    label: 'Build a runbook',
    text: 'Compose agents, commands and conditions.',
    icon: Workflow,
    path: ROUTES.runbook,
  },
  {
    label: 'Register an agent',
    text: 'Add a Windows or Linux script agent.',
    icon: MonitorSmartphone,
    path: ROUTES.agentNew,
  },
  {
    label: 'Run an AI agent',
    text: 'Summarise or extract from text.',
    icon: Bot,
    path: ROUTES.aiAgents,
  },
  {
    label: 'Map configuration items',
    text: 'Define CIs and their relationships.',
    icon: Network,
    path: ROUTES.ciRelationship,
  },
];

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-5" role="status" aria-label="Loading dashboard">
      <Skeleton className="h-[260px] w-full rounded-[var(--oe-radius-lg)]" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[118px] rounded-[var(--oe-radius-lg)]" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Skeleton className="h-[340px] rounded-[var(--oe-radius-lg)] xl:col-span-2" />
        <Skeleton className="h-[340px] rounded-[var(--oe-radius-lg)]" />
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-4 text-[12px] text-fg-secondary">
      <span className="flex items-center gap-1.5">
        <span className="h-0.5 w-3 rounded-full bg-[linear-gradient(90deg,var(--oe-chart-1),var(--oe-chart-1-end))]" />
        Success
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-0.5 w-3 rounded-full bg-[var(--oe-chart-2)]" /> Failed
      </span>
    </div>
  );
}

/** Deep-blue command-centre banner: greeting, primary actions and the headline success rate. */
function CommandHero({ summary, name }: { summary?: DashboardSummary; name?: string }) {
  const navigate = useNavigate();
  const running = summary?.recentExecutions.filter((e) => e.status === 'Running').length ?? 0;

  return (
    <section className="oe-card oe-card--feature oe-hero grid gap-6 p-6 sm:p-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,1fr)]">
      <div className="flex min-w-0 flex-col">
        <p className="oe-glass-on-feature m-0 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[12px] font-medium text-[#dbeafe]">
          <span
            className={`oe-status !h-auto !border-0 !bg-transparent !p-0 ${running ? 'is-live' : ''}`}
            style={{ ['--tone' as string]: running ? '#67e8f9' : '#93c5fd' }}
          >
            <span className="oe-status__dot" aria-hidden />
          </span>
          Command center
          {running > 0 && (
            <span className="text-[#bfdbfe]/80">
              · {running} run{running === 1 ? '' : 's'} in progress
            </span>
          )}
        </p>
        <h1 className="m-0 mt-4 text-[28px] font-semibold leading-tight tracking-[-0.03em] text-white sm:text-[32px]">
          {name ? `${greeting()}, ${name}` : 'Welcome to OneEngine'}
        </h1>
        <p className="m-0 mt-2 max-w-[520px] text-[14px] leading-relaxed text-[#c7d6f5]/80">
          Your automation estate at a glance — runbook activity, configuration item health and AI
          agents over the last 14 days.
        </p>
        <div className="mt-6 flex flex-wrap gap-2 lg:mt-auto lg:pt-6">
          <AppButton
            icon={<Plus size={15} />}
            onClick={() => navigate(ROUTES.runbook)}
            className="oe-btn-on-feature"
          >
            New runbook
          </AppButton>
          <AppButton
            tone="secondary"
            icon={<FileBarChart size={15} />}
            onClick={() => navigate(ROUTES.executionReport)}
            className="oe-btn-ghost-on-feature"
          >
            Execution report
          </AppButton>
        </div>
      </div>

      <div className="oe-glass-on-feature flex flex-col p-5">
        <p className="m-0 mb-4 flex items-center justify-between text-[12.5px] font-medium text-[#dbeafe]">
          Success rate
          <span className="text-[11.5px] font-normal text-[#bfdbfe]/70">
            Completed runs · 14 days
          </span>
        </p>
        {summary ? (
          <SuccessRateChart rate={summary.successRate} daily={summary.dailyExecutions} />
        ) : (
          <Skeleton className="h-[124px] w-full !bg-white/10" />
        )}
      </div>
    </section>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const summary = useDashboardSummary();
  const user = useAuthStore((s) => s.user);
  const firstName = user?.displayName.split(' ')[0];

  useEffect(() => {
    document.title = `Home · ${APP_CONFIG.name}`;
  }, []);

  return (
    <>
      {summary.error ? (
        <AppCard>
          <ErrorState error={summary.error} onRetry={() => void summary.refetch()} />
        </AppCard>
      ) : summary.isLoading || !summary.data ? (
        <DashboardSkeleton />
      ) : (
        <div className="oe-stagger flex flex-col gap-5">
          <CommandHero summary={summary.data} name={firstName} />

          <KpiStrip
            items={[
              {
                label: 'Agents',
                value: summary.data.totals.agents,
                hint: 'Script agents in the repository',
                icon: MonitorSmartphone,
                onClick: () => navigate(ROUTES.agentRepository),
              },
              {
                label: 'AI Agents',
                value: summary.data.totals.aiAgents,
                hint: 'Configured AI workflows',
                icon: Bot,
                onClick: () => navigate(ROUTES.aiAgents),
              },
              {
                label: 'Runbooks',
                value: summary.data.totals.runbooks,
                hint: 'Saved automation flows',
                icon: Workflow,
                onClick: () => navigate(ROUTES.runbookList),
                highlight: true,
              },
              {
                label: 'Configuration Items',
                value: summary.data.totals.configurationItems,
                hint: 'Tracked in CI Master',
                icon: Database,
                onClick: () => navigate(ROUTES.ciMaster),
              },
            ]}
          />

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <AppCard
              title="Runbook executions"
              description="Daily runs, last 14 days"
              extra={<Legend />}
              className="xl:col-span-2"
            >
              <ExecutionTrendChart data={summary.data.dailyExecutions} />
            </AppCard>
            <AppCard
              title="Infrastructure health"
              description="Configuration items by status and environment"
            >
              <InfrastructureHealth />
            </AppCard>
          </div>

          <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-3">
            <AppCard
              title="Activity"
              description="Latest runbook executions across all targets"
              className="xl:col-span-2"
              bodyClassName="px-5 py-4"
            >
              <ActivityTimeline data={summary.data.recentExecutions} />
            </AppCard>
            <AppCard
              variant="tinted"
              title={
                <span className="flex items-center gap-2.5">
                  <span className="oe-ai-orb h-6 w-6">
                    <Sparkles size={12} strokeWidth={2.2} />
                  </span>
                  <span className="text-[14px] font-semibold text-fg">AI automation</span>
                </span>
              }
              description="Agents ready to run and the models behind them"
            >
              <AiAutomationPanel />
            </AppCard>
          </div>

          <nav
            aria-label="Quick actions"
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
          >
            {QUICK_ACTIONS.map(({ label, text, icon: Icon, path }) => (
              <Link
                key={label}
                to={path}
                className="oe-card oe-card-interactive group flex items-center gap-3 px-4 py-3.5 !no-underline"
              >
                <span className="oe-icon-tile is-reactive h-9 w-9 rounded-[10px]">
                  <Icon size={16} strokeWidth={1.9} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-medium text-fg">{label}</span>
                  <span className="block truncate text-[12px] text-fg-muted">{text}</span>
                </span>
                <ArrowRight
                  size={15}
                  className="shrink-0 text-primary opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                />
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
