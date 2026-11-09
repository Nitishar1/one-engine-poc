import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Database,
  ListTree,
  ShieldCheck,
  SquareMenu,
  UserPlus,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { ErrorState } from '@/components/common/ErrorState';
import { Skeleton } from '@/components/common/Skeleton';
import { ROUTES, newPath } from '@/config/routes';
import { useNavigation } from '@/features/navigation/hooks/useNavigation';
import { useAuthStore } from '@/stores/authStore';
import { APP_CONFIG } from '@/utils/constants';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { ExecutionTrendChart } from '../components/ExecutionTrendChart';
import { KpiStrip } from '../components/KpiStrip';
import { SuccessRateChart } from '../components/SuccessRateChart';
import { useHomeSummary } from '../hooks/useHomeSummary';
import type { HomeSummary } from '../types/home.types';

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const QUICK_ACTIONS: Array<{ label: string; text: string; icon: LucideIcon; path: string }> = [
  {
    label: 'Add a user',
    text: 'Give someone access.',
    icon: UserPlus,
    path: newPath(ROUTES.users),
  },
  { label: 'Manage roles', text: 'Group users by role.', icon: Users, path: ROUTES.roles },
  {
    label: 'Page authorization',
    text: 'Choose pages per role.',
    icon: ShieldCheck,
    path: ROUTES.authorization,
  },
  { label: 'Edit menus', text: 'Shape the sidebar.', icon: SquareMenu, path: ROUTES.menus },
];

function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-5" role="status" aria-label="Loading">
      <Skeleton className="h-[240px] w-full rounded-[var(--oe-radius-lg)]" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[118px] rounded-[var(--oe-radius-lg)]" />
        ))}
      </div>
      <Skeleton className="h-[340px] rounded-[var(--oe-radius-lg)]" />
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

/** True for paths in the signed-in user's menu; actions for other pages are hidden. */
function useCanOpen() {
  const { pages } = useNavigation();
  return (path: string) =>
    pages.some((page) => page.path && (path === page.path || path.startsWith(`${page.path}/`)));
}

/** Deep-blue banner: greeting, main actions and the headline success rate. */
function CommandHero({ summary, name }: { summary: HomeSummary; name?: string }) {
  const navigate = useNavigate();
  const canOpen = useCanOpen();
  return (
    <section className="oe-card oe-card--feature oe-hero grid gap-6 p-6 sm:p-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,1fr)]">
      <div className="flex min-w-0 flex-col">
        <p className="oe-glass-on-feature m-0 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[12px] font-medium text-[#dbeafe]">
          Command center
        </p>
        <h1 className="m-0 mt-4 text-[28px] font-semibold leading-tight tracking-[-0.03em] text-white sm:text-[32px]">
          {name ? `${greeting()}, ${name}` : `Welcome to ${APP_CONFIG.name}`}
        </h1>
        <p className="m-0 mt-2 max-w-[520px] text-[14px] leading-relaxed text-[#c7d6f5]/80">
          Your automation estate at a glance: runbook activity over the last 14 days and the
          configuration that controls who can do what.
        </p>
        <div className="mt-6 flex flex-wrap gap-2 lg:mt-auto lg:pt-6">
          {canOpen(ROUTES.users) && (
            <AppButton
              icon={<UserPlus size={15} />}
              onClick={() => navigate(newPath(ROUTES.users))}
              className="oe-btn-on-feature"
            >
              Add user
            </AppButton>
          )}
          {canOpen(ROUTES.menus) && (
            <AppButton
              tone="secondary"
              icon={<ListTree size={15} />}
              onClick={() => navigate(ROUTES.menus)}
              className="oe-btn-ghost-on-feature"
            >
              Menus
            </AppButton>
          )}
        </div>
      </div>

      <div className="oe-glass-on-feature flex flex-col p-5">
        <p className="m-0 mb-4 flex items-center justify-between text-[12.5px] font-medium text-[#dbeafe]">
          Success rate
          <span className="text-[11.5px] font-normal text-[#bfdbfe]/70">
            Completed runs, 14 days
          </span>
        </p>
        <SuccessRateChart rate={summary.successRate} daily={summary.dailyExecutions} />
      </div>
    </section>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const summary = useHomeSummary();
  const user = useAuthStore((s) => s.user);
  const canOpen = useCanOpen();
  const open = (path: string) => canOpen(path) && navigate(path);
  const quickActions = QUICK_ACTIONS.filter((action) => canOpen(action.path));

  useEffect(() => {
    document.title = `Home | ${APP_CONFIG.name}`;
  }, []);

  if (summary.error) {
    return (
      <AppCard>
        <ErrorState error={summary.error} onRetry={() => void summary.refetch()} />
      </AppCard>
    );
  }
  if (!summary.data) return <HomeSkeleton />;

  const { totals } = summary.data;
  return (
    <div className="oe-stagger flex flex-col gap-5">
      <CommandHero summary={summary.data} name={user?.displayName.split(' ')[0]} />

      <KpiStrip
        items={[
          {
            label: 'Users',
            value: totals.users,
            hint: 'People who can sign in',
            icon: UserRound,
            onClick: () => open(ROUTES.users),
            highlight: true,
          },
          {
            label: 'Roles',
            value: totals.roles,
            hint: 'Groups of permissions',
            icon: Users,
            onClick: () => open(ROUTES.roles),
          },
          {
            label: 'Menus',
            value: totals.menus,
            hint: 'Entries in the sidebar',
            icon: SquareMenu,
            onClick: () => open(ROUTES.menus),
          },
          {
            label: 'Data Sources',
            value: totals.dataSources,
            hint: 'Databases for reports',
            icon: Database,
            onClick: () => open(ROUTES.dataSources),
          },
        ]}
      />

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-3">
        <AppCard
          title="Runbook executions"
          description="Daily runs, last 14 days"
          extra={<Legend />}
          className="xl:col-span-2"
        >
          <ExecutionTrendChart data={summary.data.dailyExecutions} />
        </AppCard>
        <AppCard title="Activity" description="Latest runbook executions" bodyClassName="px-5 py-4">
          <ActivityTimeline data={summary.data.recentExecutions} />
        </AppCard>
      </div>

      {quickActions.length > 0 && (
        <nav
          aria-label="Quick actions"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          {quickActions.map(({ label, text, icon: Icon, path }) => (
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
      )}
    </div>
  );
}
