import type { ReactNode } from 'react';

interface AppCardProps {
  title?: ReactNode;
  /** Short supporting line under the title. */
  description?: ReactNode;
  extra?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  /**
   * Surface weight. `tinted` softly highlights secondary content; `feature` is the deep blue
   * gradient reserved for the one or two most important panels on a screen.
   */
  variant?: 'default' | 'tinted' | 'feature';
}

const VARIANT_CLASS: Record<NonNullable<AppCardProps['variant']>, string> = {
  default: '',
  tinted: 'oe-card--tinted',
  feature: 'oe-card--feature',
};

/** Bordered surface with an optional header row — the container used by every screen. */
export function AppCard({
  title,
  description,
  extra,
  footer,
  children,
  className = '',
  bodyClassName = 'p-5',
  variant = 'default',
}: AppCardProps) {
  return (
    <section className={`oe-card ${VARIANT_CLASS[variant]} ${className}`}>
      {(title || extra) && (
        <header className="flex min-h-[52px] flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
          <div className="min-w-0">
            {typeof title === 'string' ? (
              <h2 className="m-0 text-[14px] font-semibold tracking-[-0.005em] text-fg">{title}</h2>
            ) : (
              title
            )}
            {description && <p className="m-0 mt-0.5 text-[12.5px] text-fg-muted">{description}</p>}
          </div>
          {extra && <div className="flex flex-wrap items-center gap-2">{extra}</div>}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
      {footer && (
        <footer className="flex flex-wrap items-center justify-end gap-2 rounded-b-[var(--oe-radius-lg)] border-t border-line bg-[linear-gradient(180deg,var(--oe-surface-alt),color-mix(in_srgb,var(--oe-primary)_4%,var(--oe-surface-alt)))] px-5 py-3">
          {footer}
        </footer>
      )}
    </section>
  );
}
