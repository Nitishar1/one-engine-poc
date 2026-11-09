import { useRouteError } from 'react-router-dom';
import { ErrorState } from '@/components/common/ErrorState';

/** Last-resort screen when a page crashes; details stay in the console, not on screen. */
export default function RouteErrorPage() {
  const error = useRouteError();
  console.error(error);
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--oe-page-background)]">
      <ErrorState
        title="Something went wrong"
        error={new Error('The page could not be shown. Reload to try again.')}
        onRetry={() => window.location.reload()}
      />
    </div>
  );
}
