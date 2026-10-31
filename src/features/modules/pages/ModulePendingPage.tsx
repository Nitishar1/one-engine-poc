import { useLocation, useNavigate } from 'react-router-dom';
import { Construction } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { AppButton } from '@/components/common/AppButton';
import { findNavMatch } from '@/config/navigation';
import { ROUTES } from '@/config/routes';

/**
 * Shown for menu entries whose screens have not been specified yet (no reference design).
 * The route, navigation and breadcrumb are live so the module can be dropped in later.
 */
export default function ModulePendingPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const match = findNavMatch(pathname);
  const title = match?.item.label ?? 'Module';
  const Icon = match?.item.icon ?? Construction;

  return (
    <>
      <PageHeader title={title} />
      <section className="oe-card oe-card--tinted relative flex flex-col items-center overflow-hidden px-6 py-16 text-center sm:py-20">
        <span
          aria-hidden
          className="oe-dot-grid absolute inset-0 [mask-image:radial-gradient(ellipse_60%_70%_at_50%_30%,#000,transparent_75%)]"
        />
        <span
          aria-hidden
          className="absolute left-1/2 top-6 h-48 w-48 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--oe-primary)_22%,transparent),transparent_70%)]"
        />
        <span className="oe-icon-tile relative mb-5 h-12 w-12 rounded-[12px]">
          <Icon size={22} strokeWidth={1.75} />
        </span>
        <span className="relative mb-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-0.5 text-[11.5px] font-medium text-fg-secondary">
          <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden />
          Coming soon
        </span>
        <h2 className="relative m-0 text-[18px] font-semibold text-fg">
          {title} isn’t available yet
        </h2>
        <p className="relative m-0 mt-2 max-w-md text-[13.5px] leading-relaxed text-fg-muted">
          This module is already registered in navigation and routing. Its screens will be added
          once their designs are finalised.
        </p>
        <AppButton tone="secondary" className="mt-6" onClick={() => navigate(ROUTES.home)}>
          Back to home
        </AppButton>
      </section>
    </>
  );
}
