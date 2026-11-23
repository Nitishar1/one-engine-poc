import { useMemo, useState } from 'react';
import { Menu, type MenuProps } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNavigation } from '@/features/navigation/hooks/useNavigation';
import type { NavItem } from '@/types/navigation.types';

type MenuItem = Required<MenuProps>['items'][number];

/**
 * One colour per top-level menu (cycled). Nested items inherit their group's colour through the
 * `--tone` CSS variable, used by the icon tile, active background, accent bar and dots
 * (see .oe-sidebar-menu in styles/themes.css).
 */
const MENU_TONES = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#f43f5e', // rose
  '#6366f1', // indigo
  '#f97316', // orange
  '#14b8a6', // teal
];

function toMenuItems(items: NavItem[], parentTone?: string): MenuItem[] {
  return items.map(({ key, label, icon: Icon, children }, index) => {
    const tone = parentTone ?? MENU_TONES[index % MENU_TONES.length];
    return {
      key,
      label,
      style: { ['--tone' as string]: tone },
      icon: (
        <span className="oe-nav-icon">
          <Icon size={15} strokeWidth={2} />
        </span>
      ),
      children: children ? toMenuItems(children, tone) : undefined,
    };
  });
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
