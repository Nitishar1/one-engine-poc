import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import { AppButton } from '@/components/common/AppButton';
import { ROUTES } from '@/config/routes';
import { APP_CONFIG } from '@/utils/constants';

export default function NotFoundPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `Page not found · ${APP_CONFIG.name}`;
  }, []);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <span className="relative mb-5 inline-flex">
        <span
          aria-hidden
          className="absolute -inset-6 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--oe-primary)_20%,transparent),transparent_70%)]"
        />
        <span className="oe-icon-tile relative h-12 w-12 rounded-[12px]">
          <Compass size={22} strokeWidth={1.75} />
        </span>
      </span>
      <p className="oe-text-gradient m-0 font-mono text-[12px] font-medium tracking-[0.12em]">
        ERROR 404
      </p>
      <h1 className="m-0 mt-2 text-[22px] font-semibold text-fg">Page not found</h1>
      <p className="m-0 mt-2 max-w-sm text-[13.5px] leading-relaxed text-fg-muted">
        The page you are looking for doesn’t exist or has moved. Check the address, or use the
        sidebar or search to find what you need.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <AppButton tone="secondary" icon={<ArrowLeft size={15} />} onClick={() => navigate(-1)}>
          Go back
        </AppButton>
        <AppButton onClick={() => navigate(ROUTES.home)}>Back to home</AppButton>
      </div>
    </div>
  );
}
