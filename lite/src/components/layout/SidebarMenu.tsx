import { useMemo, useState } from 'react';
import { Menu, type MenuProps } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNavigation } from '@/features/navigation/hooks/useNavigation';
import type { NavItem } from '@/types/navigation.types';

type MenuItem = Required<MenuProps>['items'][number];

function toMenuItems(items: NavItem[]): MenuItem[] {
  return items.map(({ key, label, icon: Icon, children }) => ({
    key,
    label,
    icon: <Icon size={16} strokeWidth={1.9} />,
    children: children ? toMenuItems(children) : undefined,
  }));
}

interface SidebarMenuProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

/** Sidebar menu built from the backend navigation (GET /navigation). */
export function SidebarMenu({ collapsed = false, onNavigate }: SidebarMenuProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const nav = useNavigation();
  const menuItems = useMemo(() => toMenuItems(nav.items), [nav.items]);
  const match = nav.findMatch(pathname);
  const parentKeys = match?.parents.map((p) => p.key) ?? [];

  const [openKeys, setOpenKeys] = useState<string[]>(parentKeys);
  // Keep the active item's group expanded when navigating from outside the menu.
  const [syncedPath, setSyncedPath] = useState(pathname);
  if (syncedPath !== pathname || (parentKeys.length && !openKeys.length)) {
    setSyncedPath(pathname);
    if (parentKeys.some((k) => !openKeys.includes(k)))
      setOpenKeys([...new Set([...openKeys, ...parentKeys])]);
  }

  return (
    <Menu
      mode="inline"
      inlineCollapsed={collapsed}
      inlineIndent={10}
      items={menuItems}
      selectedKeys={match ? [match.item.key] : []}
      {...(collapsed ? {} : { openKeys, onOpenChange: setOpenKeys })}
      onClick={({ key }) => {
        const path = nav.pages.find((page) => page.key === key)?.path;
        if (path) {
          navigate(path);
          onNavigate?.();
        }
      }}
      className="oe-sidebar-menu !border-e-0"
    />
  );
}
