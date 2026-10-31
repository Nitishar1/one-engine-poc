import {
  Bot,
  Cloud,
  Cog,
  Cpu,
  Database,
  FileText,
  Globe,
  HardDrive,
  Mail,
  Monitor,
  Network,
  Play,
  ScanText,
  Server,
  ShieldCheck,
  Terminal,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import type { SelectOption } from '@/types/common.types';

/** Icons selectable for agents, CI types and AI agents. Keys are what the backend stores. */
export const ICON_REGISTRY = {
  globe: { label: 'Globe', icon: Globe, color: '#f5c242' },
  gear: { label: 'Gear', icon: Cog, color: '#ffffff' },
  play: { label: 'Play', icon: Play, color: '#f5c242' },
  server: { label: 'Server', icon: Server, color: '#ffffff' },
  database: { label: 'Database', icon: Database, color: '#ffffff' },
  monitor: { label: 'Monitor', icon: Monitor, color: '#ffffff' },
  network: { label: 'Network', icon: Network, color: '#ffffff' },
  cloud: { label: 'Cloud', icon: Cloud, color: '#ffffff' },
  shield: { label: 'Shield', icon: ShieldCheck, color: '#ffffff' },
  terminal: { label: 'Terminal', icon: Terminal, color: '#ffffff' },
  user: { label: 'User', icon: UserRound, color: '#ffffff' },
  file: { label: 'Document', icon: FileText, color: '#ffffff' },
  cpu: { label: 'Processor', icon: Cpu, color: '#ffffff' },
  bot: { label: 'Bot', icon: Bot, color: '#ffffff' },
  scan: { label: 'Scanner', icon: ScanText, color: '#ffffff' },
  mail: { label: 'Mail', icon: Mail, color: '#ffffff' },
  storage: { label: 'Storage', icon: HardDrive, color: '#ffffff' },
} as const satisfies Record<string, { label: string; icon: LucideIcon; color: string }>;

export type IconKey = keyof typeof ICON_REGISTRY;

export const ICON_KEYS = Object.keys(ICON_REGISTRY) as [IconKey, ...IconKey[]];

export const ICON_OPTIONS: SelectOption<IconKey>[] = ICON_KEYS.map((key) => ({
  value: key,
  label: ICON_REGISTRY[key].label,
}));
