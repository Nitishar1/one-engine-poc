import { Drawer, Layout, Tooltip } from 'antd';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { ROUTES } from '@/config/routes';
import { APP_CONFIG } from '@/utils/constants';
import { BrandMark } from './BrandMark';
import { SidebarMenu } from './SidebarMenu';

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <Link
      to={ROUTES.home}
      aria-label={`${APP_CONFIG.name} home`}
      className={`flex h-[var(--oe-header-height)] shrink-0 items-center gap-2.5 !no-underline ${
        collapsed ? 'justify-center px-0' : 'px-4'
      }`}
    >
      <BrandMark size={26} />
      {!collapsed && (
        <span className="flex min-w-0 flex-col leading-none">
          <span className="truncate font-display text-[15px] font-semibold tracking-[-0.01em] text-fg">
            {APP_CONFIG.name}
          </span>
          <span className="mt-1 truncate text-[11px] text-fg-muted">Automation platform</span>
        </span>
      )}
    </Link>
  );
}

function CollapseButton({ collapsed, onClick }: { collapsed: boolean; onClick: () => void }) {
  const Icon = collapsed ? PanelLeftOpen : PanelLeftClose;
  const label = collapsed ? 'Expand sidebar' : 'Collapse sidebar';
  const button = (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-[7px] border-0 bg-transparent text-[13px] font-medium text-fg-muted transition-colors duration-150 hover:bg-hover hover:text-fg ${
        collapsed ? 'justify-center' : 'px-2.5'
      }`}
    >
      <Icon size={16} strokeWidth={1.9} />
      {!collapsed && <span>Collapse</span>}
      {!collapsed && <span className="oe-kbd ml-auto">[</span>}
    </button>
  );
  return collapsed ? (
    <Tooltip title={label} placement="right">
      {button}
    </Tooltip>
  ) : (
    button
  );
}

export function Sidebar({ isMobile }: { isMobile: boolean }) {
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const mobileOpen = useAppStore((s) => s.mobileSidebarOpen);
  const setMobileOpen = useAppStore((s) => s.setMobileSidebarOpen);

  if (isMobile) {
    return (
      <Drawer
        placement="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        size={272}
        closable={false}
        styles={{ body: { padding: 0, background: 'var(--oe-sidebar-bg)' } }}
      >
        <nav aria-label="Main navigation" className="flex h-full flex-col">
          <Brand collapsed={false} />
          <div className="flex-1 overflow-y-auto pb-3 pt-1">
            <SidebarMenu onNavigate={() => setMobileOpen(false)} />
          </div>
        </nav>
      </Drawer>
    );
  }

  return (
    <Layout.Sider
      width={248}
      collapsedWidth={64}
      collapsed={collapsed}
      trigger={null}
      className="oe-sider !sticky top-0 h-screen"
    >
      <nav aria-label="Main navigation" className="flex h-full flex-col">
        <Brand collapsed={collapsed} />
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-3 pt-1">
          <SidebarMenu collapsed={collapsed} />
        </div>
        <div className="border-t border-line p-2">
          <CollapseButton collapsed={collapsed} onClick={toggleSidebar} />
        </div>
      </nav>
    </Layout.Sider>
  );
}
