import { useMemo, useState } from 'react';
import { Menu, type MenuProps } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { DEFAULT_OPEN_KEYS, NAVIGATION, findNavMatch } from '@/config/navigation';
import type { NavItem } from '@/types/navigation.types';

type MenuItem = Required<MenuProps>['items'][number];

function toMenuItems(items: NavItem[]): MenuItem[] {
  return items.map((item) => {
    const Icon = item.icon;
    return {
      key: item.key,
      label: item.label,
      icon: Icon ? <Icon size={16} strokeWidth={1.9} /> : undefined,
      children: item.children ? toMenuItems(item.children) : undefined,
    };
  });
}

const PATH_BY_KEY = new Map<string, string>();
const collectPaths = (items: NavItem[]) =>
  items.forEach((i) => {
    if (i.path) PATH_BY_KEY.set(i.key, i.path);
    if (i.children) collectPaths(i.children);
  });
collectPaths(NAVIGATION);

const MENU_ITEMS = toMenuItems(NAVIGATION);

interface SidebarMenuProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function SidebarMenu({ collapsed = false, onNavigate }: SidebarMenuProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const match = useMemo(() => findNavMatch(pathname), [pathname]);
  const parentKeys = match?.parents.map((p) => p.key) ?? [];

  const [openKeys, setOpenKeys] = useState<string[]>(
    parentKeys.length ? parentKeys : DEFAULT_OPEN_KEYS,
  );
  // Keep the active item's group expanded when navigating from outside the menu.
  const [syncedPath, setSyncedPath] = useState(pathname);
  if (syncedPath !== pathname) {
    setSyncedPath(pathname);
    if (parentKeys.some((k) => !openKeys.includes(k)))
      setOpenKeys([...new Set([...openKeys, ...parentKeys])]);
  }

  return (
    <Menu
      mode="inline"
      inlineCollapsed={collapsed}
      inlineIndent={10}
      items={MENU_ITEMS}
      selectedKeys={match ? [match.item.key] : []}
      {...(collapsed ? {} : { openKeys, onOpenChange: setOpenKeys })}
      onClick={({ key }) => {
        const path = PATH_BY_KEY.get(key);
        if (path) {
          navigate(path);
          onNavigate?.();
        }
      }}
      className="oe-sidebar-menu !border-e-0"
    />
  );
}
