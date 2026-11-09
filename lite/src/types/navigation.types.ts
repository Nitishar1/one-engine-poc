import type { LucideIcon } from 'lucide-react';

/** One menu entry as sent by the backend (GET /navigation), already filtered for the user. */
export interface NavigationMenu {
  id: string;
  label: string;
  /** Key from src/components/common/iconRegistry.ts. */
  icon?: string | null;
  /** In-app path; empty for groups that only expand. */
  path?: string | null;
  children?: NavigationMenu[];
}

/** A menu entry ready for the sidebar and breadcrumbs. */
export interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  path?: string;
  children?: NavItem[];
}

export interface NavMatch {
  item: NavItem;
  /** Groups above the item, outermost first. */
  parents: NavItem[];
}

export interface BreadcrumbEntry {
  label: string;
  path?: string;
}
