import {
  Bookmark,
  BookOpen,
  Briefcase,
  Cog,
  Cpu,
  FileBarChart,
  House,
  List,
  Megaphone,
  Network,
  Sparkles,
  Workflow,
  Bot,
  KeyRound,
  Settings,
  Layers,
  ListChecks,
  MonitorSmartphone,
} from 'lucide-react';
import type { BreadcrumbEntry, NavItem } from '@/types/navigation.types';
import { ROUTES } from './routes';

/**
 * Single source of truth for the sidebar. Order and labels mirror the reference screens.
 * Breadcrumbs and active-menu state are derived from this tree.
 */
export const NAVIGATION: NavItem[] = [
  {
    key: 'ci-mapping',
    label: 'CIMapping',
    icon: Bookmark,
    children: [
      { key: 'ci-type', label: 'CI Type', icon: Briefcase, path: ROUTES.ciType },
      { key: 'ci-master', label: 'CI Master', icon: Cog, path: ROUTES.ciMaster },
      { key: 'ci-relationship', label: 'CI Relationship', icon: List, path: ROUTES.ciRelationship },
    ],
  },
  { key: 'home', label: 'Home', icon: House, path: ROUTES.home },
  {
    key: 'agent-repository',
    label: 'Agent Repository',
    icon: MonitorSmartphone,
    path: ROUTES.agentRepository,
  },
  {
    key: 'orchestrator',
    label: 'Orchestrator',
    icon: Settings,
    children: [
      {
        key: 'runbook',
        label: 'Runbook',
        icon: Workflow,
        path: ROUTES.runbook,
        detailLabel: 'Edit',
      },
      { key: 'runbook-list', label: 'Runbook List', icon: ListChecks, path: ROUTES.runbookList },
    ],
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: List,
    children: [
      {
        key: 'execution-report',
        label: 'Execution Report',
        icon: FileBarChart,
        path: ROUTES.executionReport,
      },
    ],
  },
  {
    key: 'ai-repository',
    label: 'Agent Repository',
    icon: BookOpen,
    children: [
      { key: 'ai-model', label: 'AI Model', icon: Cpu, path: ROUTES.aiModel },
      {
        key: 'ai-configuration',
        label: 'AIConfiguration',
        icon: Layers,
        path: ROUTES.aiConfiguration,
      },
      {
        key: 'ai-agents',
        label: 'AI Agents',
        icon: Bot,
        path: ROUTES.aiAgents,
        detailLabel: 'Workspace',
      },
    ],
  },
  {
    key: 'certificate-monitoring',
    label: 'Certificate Monitoring',
    icon: Megaphone,
    path: ROUTES.certificateMonitoring,
  },
  { key: 'india-cloud', label: 'India Cloud', icon: Network, path: ROUTES.indiaCloud },
  { key: 'configurations', label: 'Configurations', icon: KeyRound, path: ROUTES.configurations },
  { key: 'it-assistant', label: 'ITAssistant', icon: Sparkles, path: ROUTES.itAssistant },
];

/** Groups that should be expanded when no item is active yet. */
export const DEFAULT_OPEN_KEYS: string[] = ['ci-mapping'];

interface NavMatch {
  item: NavItem;
  parents: NavItem[];
}

function flatten(items: NavItem[], parents: NavItem[] = []): NavMatch[] {
  return items.flatMap((item) => [
    { item, parents },
    ...(item.children ? flatten(item.children, [...parents, item]) : []),
  ]);
}

const FLAT_NAV = flatten(NAVIGATION).filter((m) => m.item.path);

/** Finds the menu item owning a pathname (longest matching path prefix wins). */
export function findNavMatch(pathname: string): NavMatch | undefined {
  return FLAT_NAV.filter(
    ({ item }) => pathname === item.path || pathname.startsWith(`${item.path}/`),
  ).sort((a, b) => (b.item.path?.length ?? 0) - (a.item.path?.length ?? 0))[0];
}

/** Label for a sub-page below a menu item, derived from the URL ("…/new", "…/:id/edit", "…/:id"). */
function subPageLabel(pathname: string, item: NavItem): string {
  if (pathname.endsWith('/new')) return 'New';
  if (pathname.endsWith('/edit')) return 'Edit';
  return item.detailLabel ?? 'Details';
}

/**
 * Breadcrumb trail shown in the app header: "Home / <Group> / <Page> / <New|Edit>". Group crumbs
 * have no link (groups only expand in the sidebar); the page crumb links back to its list on
 * sub-pages. `pageTitle` overrides the sub-page label.
 */
export function buildBreadcrumbs(pathname: string, pageTitle?: string): BreadcrumbEntry[] {
  const crumbs: BreadcrumbEntry[] = [{ label: 'Home', path: ROUTES.home }];
  const match = findNavMatch(pathname);
  if (!match) return pageTitle ? [...crumbs, { label: pageTitle }] : crumbs;
  if (match.item.path === ROUTES.home) return crumbs;

  match.parents.forEach((parent) => crumbs.push({ label: parent.label }));
  const isSubPage = pathname !== match.item.path;
  crumbs.push({ label: match.item.label, path: isSubPage ? match.item.path : undefined });
  if (isSubPage) crumbs.push({ label: pageTitle ?? subPageLabel(pathname, match.item) });
  return crumbs;
}

/** Every navigable page, flattened with its group label — used by the command palette. */
export const NAV_PAGES = FLAT_NAV.map(({ item, parents }) => ({
  key: item.key,
  label: item.label,
  group: parents.map((p) => p.label).join(' / '),
  path: item.path as string,
  icon: item.icon,
}));
