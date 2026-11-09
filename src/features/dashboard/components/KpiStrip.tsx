import { useEffect, useState } from 'react';
import { ArrowUpRight, type LucideIcon } from 'lucide-react';

export interface KpiItem {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  onClick: () => void;
  /** Gives the headline metric a tinted surface and gradient border. */
  highlight?: boolean;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Counts from 0 to `target` with an ease-out curve (instant with reduced motion). */
function useCountUp(target: number, duration = 700) {
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? target : 0));

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      // rAF timestamps can predate `start`; clamp so the first frame never shows "-0".
      const p = Math.min(1, Math.max(0, (now - start) / duration));
      setShown(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return shown;
}

function Kpi({ label, value, hint, icon: Icon, onClick, highlight }: KpiItem) {
  const shown = useCountUp(value);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`oe-card oe-card-interactive group flex flex-col items-start gap-4 px-5 py-4 text-left font-[inherit] ${
        highlight ? 'oe-card--tinted oe-gradient-border' : ''
      }`}
    >
      <span className="flex w-full items-center gap-2.5 text-[12.5px] font-medium text-fg-muted">
        <span className="oe-icon-tile is-reactive h-8 w-8 rounded-[9px]">
          <Icon size={15} strokeWidth={1.9} />
        </span>
        {label}
        <ArrowUpRight
          size={14}
          className="ml-auto opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary group-hover:opacity-100 group-focus-visible:opacity-100"
        />
      </span>
      <span
        className={`font-display text-[30px] font-semibold leading-none tracking-[-0.03em] tabular-nums ${
          highlight ? 'oe-text-gradient' : 'text-fg'
        }`}
      >
        {shown.toLocaleString()}
      </span>
      <span className="text-[12px] text-fg-muted">{hint}</span>
    </button>
  );
}

/** Row of KPI cards; at most one should be highlighted. */
export function KpiStrip({ items }: { items: KpiItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item) => (
        <Kpi key={item.label} {...item} />
      ))}
    </div>
  );
}
