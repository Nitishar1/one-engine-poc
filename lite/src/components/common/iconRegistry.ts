import {
  BookOpen,
  Bookmark,
  Bot,
  Briefcase,
  Cloud,
  Cog,
  Database,
  FileBarChart,
  FileText,
  Globe,
  House,
  KeyRound,
  LayoutList,
  List,
  LockKeyhole,
  Megaphone,
  MonitorSmartphone,
  Network,
  Server,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  SquareMenu,
  UserRound,
  Users,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import type { SelectOption } from '@/types/common.types';

/**
 * Icons the backend can reference by key (menus, reports). The key is what is stored; an
 * unknown key falls back to a neutral icon, so the backend can never inject markup here.
 */
export const ICON_REGISTRY = {
  home: { label: 'Home', icon: House },
  bookmark: { label: 'Bookmark', icon: Bookmark },
  monitor: { label: 'Monitor', icon: MonitorSmartphone },
  settings: { label: 'Settings', icon: Settings },
  gear: { label: 'Gear', icon: Cog },
  list: { label: 'List', icon: List },
  book: { label: 'Book', icon: BookOpen },
  megaphone: { label: 'Megaphone', icon: Megaphone },
  cloud: { label: 'Cloud', icon: Cloud },
  sliders: { label: 'Sliders', icon: SlidersHorizontal },
  users: { label: 'Users', icon: Users },
  user: { label: 'User', icon: UserRound },
  shield: { label: 'Shield', icon: ShieldCheck },
  key: { label: 'Key', icon: KeyRound },
  lock: { label: 'Lock', icon: LockKeyhole },
  menu: { label: 'Menu', icon: SquareMenu },
  report: { label: 'Report', icon: FileBarChart },
  database: { label: 'Database', icon: Database },
  globe: { label: 'Globe', icon: Globe },
  server: { label: 'Server', icon: Server },
  network: { label: 'Network', icon: Network },
  workflow: { label: 'Workflow', icon: Workflow },
  briefcase: { label: 'Briefcase', icon: Briefcase },
  file: { label: 'Document', icon: FileText },
  table: { label: 'Table', icon: LayoutList },
  bot: { label: 'Bot', icon: Bot },
} as const satisfies Record<string, { label: string; icon: LucideIcon }>;

export type IconKey = keyof typeof ICON_REGISTRY;

export const ICON_KEYS = Object.keys(ICON_REGISTRY) as [IconKey, ...IconKey[]];

export const ICON_OPTIONS: SelectOption<IconKey>[] = ICON_KEYS.map((key) => ({
  value: key,
  label: ICON_REGISTRY[key].label,
}));

/** Icon component for a key from the backend; unknown keys get a neutral list icon. */
export const resolveIcon = (key?: string | null): LucideIcon =>
  key && key in ICON_REGISTRY ? ICON_REGISTRY[key as IconKey].icon : List;
