import { useState } from 'react';
import { Layout, Tooltip } from 'antd';
import { Maximize, Menu as MenuIcon, Minimize, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useAppStore } from '@/stores/appStore';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useHotkey } from '@/hooks/useHotkey';
import { Breadcrumb } from './Breadcrumb';
import { CommandPalette } from './CommandPalette';
import { UserMenu } from './UserMenu';

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

/** Top bar: breadcrumb, search (Ctrl+K), theme switch, full screen and the user menu. */
export function Header({ isMobile }: { isMobile: boolean }) {
  const { pathname } = useLocation();
  const setMobileOpen = useAppStore((s) => s.setMobileSidebarOpen);
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
  const [searchOpen, setSearchOpen] = useState(false);
  // Each opening gets a fresh search box (new key), even while the last one is still closing.
  const [searchKey, setSearchKey] = useState(0);
  const openSearch = () => {
    setSearchKey((k) => k + 1);
    setSearchOpen(true);
  };

  useHotkey('k', () => (searchOpen ? setSearchOpen(false) : openSearch()), { mod: true });

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

      <button
        type="button"
        onClick={openSearch}
        aria-label="Search pages and actions"
        aria-keyshortcuts={IS_MAC ? 'Meta+K' : 'Control+K'}
        className="oe-search-trigger group hidden h-8 w-[240px] cursor-pointer items-center gap-2 rounded-[8px] border border-line bg-surface/70 px-2.5 text-[13px] text-fg-muted shadow-sm hover:text-fg-secondary md:flex lg:w-[280px]"
      >
        <Search size={14} className="transition-colors duration-150" />
        <span className="flex-1 text-left">Search...</span>
        <span className="oe-kbd">{IS_MAC ? 'Cmd' : 'Ctrl'}</span>
        <span className="oe-kbd -ml-1">K</span>
      </button>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className="oe-icon-btn md:!hidden"
          aria-label="Search pages and actions"
          onClick={openSearch}
        >
          <Search size={17} />
        </button>
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

      <CommandPalette key={searchKey} open={searchOpen} onClose={() => setSearchOpen(false)} />
    </Layout.Header>
  );
}
