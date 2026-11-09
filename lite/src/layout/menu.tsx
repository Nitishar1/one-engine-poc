import type { MenuProps } from 'antd';
import { Circle, List, Settings, Shield, Users, type LucideIcon } from 'lucide-react';
import type { MenuItem } from '../api/types';

/** Icon names the backend may send in `MenuItem.icon`. Add new ones here. */
const ICONS: Record<string, LucideIcon> = {
  settings: Settings,
  shield: Shield,
  users: Users,
  list: List,
};

function icon(name?: string) {
  const Icon = (name && ICONS[name]) || Circle;
  return <Icon size={16} />;
}

/** Converts the backend menu into Ant Design menu items. A page's key is its path. */
export function toMenuItems(items: MenuItem[]): MenuProps['items'] {
  return items.map((item) =>
    item.children
      ? {
          key: item.key,
          label: item.label,
          icon: icon(item.icon),
          children: toMenuItems(item.children),
        }
      : { key: item.path ?? item.key, label: item.label, icon: icon(item.icon) },
  );
}

/** All items that open a page (the leaves of the menu tree). */
export function menuPages(items: MenuItem[]): MenuItem[] {
  return items.flatMap((item) =>
    item.children ? menuPages(item.children) : item.path ? [item] : [],
  );
}

/** Keys of the groups, so the sidebar can start with every group open. */
export function groupKeys(items: MenuItem[]): string[] {
  return items.flatMap((item) => (item.children ? [item.key, ...groupKeys(item.children)] : []));
}
