import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/common/Skeleton';
import { ROUTES } from '@/config/routes';
import { ciMasterHooks } from '@/features/ciMapping/hooks/useCiMapping';
import type { CiEnvironment, CiStatus } from '@/features/ciMapping/types/ciMapping.types';

const STATUS_TONES: Array<{ status: CiStatus; tone: string }> = [
  { status: 'Active', tone: 'var(--oe-success)' },
  { status: 'Maintenance', tone: 'var(--oe-warning)' },
  { status: 'Inactive', tone: 'var(--oe-text-muted)' },
];

const ENVIRONMENTS: CiEnvironment[] = ['Production', 'Staging', 'Development', 'DR'];

/** Health of the tracked estate, from the status and environment of each CI Master record. */
export function InfrastructureHealth() {
  const list = ciMasterHooks.useList();

  if (list.isLoading)
    return (
      <div className="flex flex-col gap-3" role="status" aria-label="Loading configuration items">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  if (list.error || !list.data)
    return <p className="m-0 text-[13px] text-fg-muted">Configuration items are unavailable.</p>;

  const items = list.data;
  const total = items.length;
  const byStatus = STATUS_TONES.map((s) => ({
    ...s,
    count: items.filter((i) => i.status === s.status).length,
  }));
  const byEnv = ENVIRONMENTS.map((env) => ({
    env,
    count: items.filter((i) => i.environment === env).length,
  })).filter((e) => e.count > 0);
  const maxEnv = Math.max(1, ...byEnv.map((e) => e.count));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-baseline gap-2">
        <span className="font-display text-[30px] font-semibold leading-none tracking-[-0.03em] text-fg tabular-nums">
          {total}
        </span>
        <span className="text-[12.5px] text-fg-muted">configuration items tracked</span>
      </div>

      <div>
        <div
          className="flex h-2 w-full gap-[3px] overflow-hidden rounded-full bg-active"
          role="img"
          aria-label={byStatus.map((s) => `${s.count} ${s.status}`).join(', ')}
        >
          {total > 0 &&
            byStatus
              .filter((s) => s.count > 0)
              .map((s) => (
                <span
                  key={s.status}
                  className="oe-grow-x h-full first:rounded-l-full last:rounded-r-full"
                  style={{ width: `${(s.count / total) * 100}%`, background: s.tone }}
                />
              ))}
        </div>
        <ul className="m-0 mt-3 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-[12.5px]">
          {byStatus.map((s) => (
            <li key={s.status} className="flex items-center gap-1.5 text-fg-secondary">
              <span className="h-2 w-2 rounded-full" style={{ background: s.tone }} />
              {s.status}
              <span className="font-medium tabular-nums text-fg">{s.count}</span>
            </li>
          ))}
        </ul>
      </div>

      <dl className="m-0 flex flex-col gap-2.5">
        {byEnv.map(({ env, count }) => (
          <div
            key={env}
            className="grid grid-cols-[96px_1fr_24px] items-center gap-3 text-[12.5px]"
          >
            <dt className="text-fg-secondary">{env}</dt>
            <dd className="m-0 h-1.5 overflow-hidden rounded-full bg-active">
              <span
                className="oe-grow-x block h-full rounded-full bg-[linear-gradient(90deg,var(--oe-chart-1),var(--oe-chart-1-end))]"
                style={{ width: `${(count / maxEnv) * 100}%` }}
              />
            </dd>
            <dd className="m-0 text-right font-medium tabular-nums text-fg">{count}</dd>
          </div>
        ))}
      </dl>

      <Link to={ROUTES.ciMaster} className="oe-link oe-link-arrow text-[12.5px]">
        Open CI Master
      </Link>
    </div>
  );
}
