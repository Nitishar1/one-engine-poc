import type { LucideIcon } from 'lucide-react';

/** A single entry of the centralized navigation tree that drives the sidebar and breadcrumbs. */
export interface NavItem {
  key: string;
  label: string;
  icon?: LucideIcon;
  /** Route path. Group items without a path only expand/collapse. */
  path?: string;
  children?: NavItem[];
  /** Breadcrumb label for `<path>/:id` detail routes (defaults to "Details"). */
  detailLabel?: string;
  /** Extra paths (e.g. create/edit screens) that should highlight this item. */
  matchPaths?: string[];
}

export interface BreadcrumbEntry {
  label: string;
  path?: string;
}
