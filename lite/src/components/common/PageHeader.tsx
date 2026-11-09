import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigation } from '@/features/navigation/hooks/useNavigation';
import { APP_CONFIG } from '@/utils/constants';

interface PageHeaderProps {
  title: string;
  /** One line explaining what the page is for. */
  description?: ReactNode;
  /** Primary page-level actions, aligned right. */
  actions?: ReactNode;
  /**
   * Small element shown before the title (icon, avatar). Defaults to the current section's
   * navigation icon; pass `null` to show nothing.
   */
  leading?: ReactNode;
}

/** The current navigation item's icon on a gradient tile. */
function SectionIcon() {
  const { pathname } = useLocation();
  const Icon = useNavigation().findMatch(pathname)?.item.icon;
  if (!Icon) return null;
  return (
    <span className="oe-section-icon" aria-hidden>
      <Icon size={20} strokeWidth={1.8} />
    </span>
  );
}

/** Page title, description and page actions. Breadcrumbs live in the app header. */
export function PageHeader({
  title,
  description,
  actions,
  leading = <SectionIcon />,
}: PageHeaderProps) {
  useEffect(() => {
    document.title = `${title} | ${APP_CONFIG.name}`;
  }, [title]);

  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="flex min-w-0 items-center gap-3.5">
        {leading}
        <div className="min-w-0">
          <h1 className="m-0 text-[24px] font-semibold leading-tight tracking-[-0.025em] text-fg">
            {title}
          </h1>
          {description && (
            <p className="m-0 mt-1 max-w-2xl text-[13.5px] leading-relaxed text-fg-muted">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
