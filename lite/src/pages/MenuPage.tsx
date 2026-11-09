import { Navigate, useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { Button, Result } from 'antd';
import type { MenuItem } from '../api/types';
import { menuPages } from '../layout/menu';
import { PAGES } from './index';

/**
 * Picks the page for the current URL. Only paths that are in the user's menu (from the
 * backend) can be opened, so the menu is the single list of what a user may visit.
 */
export function MenuPage() {
  const menus = useOutletContext<MenuItem[]>();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const pages = menuPages(menus);

  if (pathname === '/') {
    return pages[0]?.path ? (
      <Navigate to={pages[0].path} replace />
    ) : (
      <Result title="No pages are assigned to your account." />
    );
  }

  const item = pages.find((page) => page.path === pathname);
  if (!item) {
    return (
      <Result
        status="404"
        title="Page not found"
        subTitle="This page doesn't exist or isn't in your menu."
        extra={<Button onClick={() => navigate('/')}>Go to start</Button>}
      />
    );
  }

  const Page = PAGES[pathname];
  return Page ? <Page /> : <Result title={`${item.label} is coming soon`} />;
}
