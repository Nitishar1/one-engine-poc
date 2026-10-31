import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { House, RotateCw, TriangleAlert } from 'lucide-react';
import { AppButton } from '@/components/common/AppButton';
import { ROUTES } from '@/config/routes';
import { getErrorMessage } from '@/utils/helpers';

/** Error boundary for route rendering failures (including failed lazy chunk loads). */
export default function RouteErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : getErrorMessage(error, String(error));

  return (
    <div
      role="alert"
      className="flex min-h-[60vh] flex-col items-center justify-center bg-bg px-4 py-10 text-center"
    >
      <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-[12px] border border-[color-mix(in_srgb,var(--oe-error)_30%,transparent)] bg-[color-mix(in_srgb,var(--oe-error)_10%,transparent)] text-danger">
        <TriangleAlert size={22} strokeWidth={1.9} />
      </span>
      <h1 className="m-0 text-[20px] font-semibold text-fg">
        Something went wrong while loading this page
      </h1>
      <p className="m-0 mt-2 max-w-md text-[13.5px] leading-relaxed text-fg-muted">
        Reloading usually fixes this. If it keeps happening, contact your administrator.
      </p>
      <code className="mt-4 max-w-full truncate rounded-md border border-line bg-surface-alt px-2.5 py-1 font-mono text-[12px] text-fg-secondary">
        {message}
      </code>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <AppButton
          tone="secondary"
          icon={<House size={15} />}
          onClick={() => window.location.assign(ROUTES.home)}
        >
          Back to home
        </AppButton>
        <AppButton icon={<RotateCw size={15} />} onClick={() => window.location.reload()}>
          Reload page
        </AppButton>
      </div>
    </div>
  );
}
