import { Layout, Tooltip } from 'antd';
import { Maximize, Menu as MenuIcon, Minimize } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useAppStore } from '@/stores/appStore';
import { useFullscreen } from '@/hooks/useFullscreen';
import { Breadcrumb } from './Breadcrumb';
import { UserMenu } from './UserMenu';

/** Top bar: breadcrumb, theme switch, full screen and the user menu. */
export function Header({ isMobile }: { isMobile: boolean }) {
  const { pathname } = useLocation();
  const setMobileOpen = useAppStore((s) => s.setMobileSidebarOpen);
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

  return (
    <Layout.Header className="oe-header sticky top-0 z-20 flex !h-[var(--oe-header-height)] items-center gap-3 border-b border-line !px-3 !leading-none sm:!px-5">
      {isMobile && (
        <button
          type="button"
          className="oe-icon-btn"
          aria-label="Open navigation"
          onClick={() => setMobileOpen(true)}
        >
          <MenuIcon size={18} />
        </button>
      )}
      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <Breadcrumb pathname={pathname} />
      </nav>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Tooltip title={isFullscreen ? 'Exit full screen' : 'Full screen'}>
          <button
            type="button"
            className="oe-icon-btn max-sm:!hidden"
            aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
            onClick={() => void toggleFullscreen()}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </Tooltip>
        <span aria-hidden className="mx-1.5 h-5 w-px bg-[var(--oe-border-strong)]" />
        <UserMenu />
      </div>
    </Layout.Header>
  );
}
