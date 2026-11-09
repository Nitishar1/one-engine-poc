import { Layout } from 'antd';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useHotkey } from '@/hooks/useHotkey';
import { useAppStore } from '@/stores/appStore';
import { MOBILE_BREAKPOINT } from '@/utils/constants';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MainContent } from './MainContent';

/** Authenticated application shell: sidebar + header + routed content. */
export function AppLayout() {
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  useHotkey('[', () => !isMobile && toggleSidebar());

  return (
    <Layout className="oe-shell h-screen overflow-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-md focus:bg-surface-elevated focus:px-3 focus:py-2 focus:text-fg"
      >
        Skip to content
      </a>
      <Sidebar isMobile={isMobile} />
      <Layout className="flex h-screen min-w-0 flex-col !bg-transparent">
        <Header isMobile={isMobile} />
        <MainContent />
      </Layout>
    </Layout>
  );
}
