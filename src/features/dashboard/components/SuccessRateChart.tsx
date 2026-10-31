import type { DailyExecutionPoint } from '../types/dashboard.types';

interface ReliabilityPanelProps {
  rate: number;
  daily: DailyExecutionPoint[];
}

const RING_RADIUS = 46;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

/** Ring gauge for the headline rate; the arc sweeps in on mount. */
function RateRing({ rate }: { rate: number }) {
  const clamped = Math.max(0, Math.min(100, rate));
  return (
    <div className="relative h-[124px] w-[124px] shrink-0">
      <svg viewBox="0 0 108 108" className="h-full w-full -rotate-90" aria-hidden>
        <defs>
          <linearGradient id="oe-rate-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--oe-chart-1)' }} />
            <stop offset="1" style={{ stopColor: 'var(--oe-chart-1-end)' }} />
          </linearGradient>
        </defs>
        <circle
          cx="54"
          cy="54"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="8"
          style={{ stroke: 'var(--oe-active)' }}
        />
        <circle
          cx="54"
          cy="54"
          r={RING_RADIUS}
          fill="none"
          stroke="url(#oe-rate-ring)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={RING_LENGTH}
          strokeDashoffset={RING_LENGTH * (1 - clamped / 100)}
          className="oe-rate-ring__arc"
          style={{ ['--oe-ring-length' as string]: RING_LENGTH }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-[32px] font-semibold leading-none tracking-[-0.04em] text-fg tabular-nums">
        {rate}
        <span className="text-[17px] text-fg-muted">%</span>
      </span>
    </div>
  );
}

/** Headline success rate with a ring gauge and the totals behind it. */
export function SuccessRateChart({ rate, daily }: ReliabilityPanelProps) {
  const succeeded = daily.reduce((sum, d) => sum + d.success, 0);
  const failed = daily.reduce((sum, d) => sum + d.failed, 0);
  const total = succeeded + failed;
  const busiest = daily.reduce<DailyExecutionPoint | null>(
    (best, d) => (!best || d.success + d.failed > best.success + best.failed ? d : best),
    null,
  );

  const rows = [
    { label: 'Total runs', value: total },
    { label: 'Succeeded', value: succeeded, swatch: 'var(--oe-chart-1-end)' },
    { label: 'Failed', value: failed, swatch: 'var(--oe-chart-2)' },
  ];

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex items-center gap-5"
        role="img"
        aria-label={`${rate}% success rate: ${succeeded} succeeded, ${failed} failed`}
      >
        <RateRing rate={rate} />
        <dl className="m-0 flex min-w-0 flex-1 flex-col divide-y divide-[var(--oe-border)] text-[13px]">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-2 py-2">
              {r.swatch ? (
                <span className="h-2 w-2 rounded-[2px]" style={{ background: r.swatch }} />
              ) : (
                <span className="h-2 w-2" />
              )}
              <dt className="text-fg-secondary">{r.label}</dt>
              <dd className="m-0 ml-auto font-medium tabular-nums text-fg">{r.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {busiest && busiest.success + busiest.failed > 0 && (
        <p className="m-0 mt-auto rounded-lg border border-line bg-surface-alt px-3 py-2.5 text-[12.5px] leading-relaxed text-fg-secondary backdrop-blur-sm max-xl:mt-5">
          Busiest day was <span className="font-medium text-fg">{busiest.date}</span> with{' '}
          {busiest.success + busiest.failed} runs
          {busiest.failed ? `, ${busiest.failed} of which failed` : ', all successful'}.
        </p>
      )}
    </div>
  );
}
