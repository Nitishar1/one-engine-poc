import { Suspense, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { LoadingState } from '@/components/common/LoadingState';
import { findNavMatch } from '@/config/navigation';
import { AppFooter } from './AppFooter';
import { PageBackdrop } from './PageBackdrop';

/** Scrollable page region. Resets scroll position and plays a short entrance on navigation. */
export function MainContent() {
  const { pathname } = useLocation();
  const ref = useRef<HTMLElement>(null);
  // Animate when the section changes, not on every sub-route (e.g. new → edit after saving).
  const sectionKey = findNavMatch(pathname)?.item.key ?? pathname;

  useEffect(() => {
    ref.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <main
      ref={ref}
      id="main-content"
      className="relative isolate min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
    >
      <PageBackdrop pathname={pathname} />
      <div className="mx-auto flex min-h-full w-full max-w-[var(--oe-page-max-width)] flex-col px-4 pb-6 pt-6 sm:px-[var(--oe-page-padding)] sm:pt-7">
        <div key={sectionKey} className="oe-page min-w-0">
          <Suspense fallback={<LoadingState fullHeight />}>
            <Outlet />
          </Suspense>
        </div>
        <AppFooter />
      </div>
    </main>
  );
}
