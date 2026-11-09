import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button, Layout, Menu, Spin } from 'antd';
import { menuApi } from '../api/menuApi';
import { useApi } from '../hooks/useApi';
import { AppFooter } from './AppFooter';
import { AppHeader } from './AppHeader';
import { groupKeys, menuPages, toMenuItems } from './menu';

/** Sidebar (menu from the backend), header, the current page and footer. */
export function AppLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const menus = useApi(menuApi.list);

  if (menus.loading) return <Spin fullscreen description="Loading menu..." />;
  if (menus.error || !menus.data) {
    return (
      <div className="centered">
        <Alert
          type="error"
          showIcon
          title="Could not load the menu"
          description={menus.error}
          action={<Button onClick={menus.reload}>Retry</Button>}
        />
      </div>
    );
  }

  const current = menuPages(menus.data).find((page) => page.path === pathname);

  return (
    <Layout className="app">
      <Layout.Sider width={240} breakpoint="lg" collapsedWidth={0}>
        <div className="brand">OneEngine</div>
        <Menu
          theme="dark"
          mode="inline"
          items={toMenuItems(menus.data)}
          selectedKeys={[pathname]}
          defaultOpenKeys={groupKeys(menus.data)}
          onClick={({ key }) => navigate(key)}
        />
      </Layout.Sider>
      <Layout>
        <AppHeader title={current?.label} />
        <Layout.Content className="app-content">
          {/* The pages get the menu so they can check the URL against it. */}
          <Outlet context={menus.data} />
        </Layout.Content>
        <AppFooter />
      </Layout>
    </Layout>
  );
}
