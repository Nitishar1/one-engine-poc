import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Avatar, Button, Dropdown, Layout, Menu, Spin } from 'antd';
import { LogOut } from 'lucide-react';
import { menuApi } from '../api/menuApi';
import { useAuth } from '../auth/AuthContext';
import { useApi } from '../hooks/useApi';
import { groupKeys, menuPages, toMenuItems } from './menu';

/** Sidebar (menu from the backend), top bar with the user, and the current page. */
export function AppLayout() {
  const { user, logout } = useAuth();
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
        <Layout.Header className="app-header">
          <span className="app-header-title">{current?.label}</span>
          <Dropdown
            menu={{
              items: [{ key: 'logout', label: 'Sign out', icon: <LogOut size={14} /> }],
              onClick: () => void logout(),
            }}
          >
            <Button type="text">
              <Avatar size="small">{user?.displayName.charAt(0).toUpperCase()}</Avatar>
              {user?.displayName}
            </Button>
          </Dropdown>
        </Layout.Header>
        <Layout.Content className="app-content">
          {/* The pages get the menu so they can check the URL against it. */}
          <Outlet context={menus.data} />
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
