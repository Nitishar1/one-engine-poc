import { Avatar, Button, Dropdown, Layout } from 'antd';
import { LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { ThemeToggle } from '../theme/ThemeToggle';

/** Top bar: current page title, theme switch and the signed-in user's menu. */
export function AppHeader({ title }: { title?: string }) {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <Layout.Header className="app-header">
      <span className="app-header-title">{title}</span>
      <div className="app-header-actions">
        <ThemeToggle />
        <Dropdown
          menu={{
            items: [
              { key: 'user', label: `${user.displayName} (${user.role})`, disabled: true },
              { type: 'divider' },
              { key: 'logout', label: 'Sign out', icon: <LogOut size={14} /> },
            ],
            onClick: ({ key }) => {
              if (key === 'logout') void logout();
            },
          }}
        >
          <Button type="text">
            <Avatar size="small">{user.displayName.charAt(0).toUpperCase()}</Avatar>
            {user.displayName}
          </Button>
        </Dropdown>
      </div>
    </Layout.Header>
  );
}
