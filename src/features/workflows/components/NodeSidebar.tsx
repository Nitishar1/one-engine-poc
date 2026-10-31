import { useState, type DragEvent } from 'react';
import { Input, Tooltip } from 'antd';
import { ChevronRight, GripVertical, KeyRound, Search } from 'lucide-react';
import { agentHooks } from '@/features/agentRepository/hooks/useAgents';
import type { Agent } from '@/features/agentRepository/types/agent.types';
import { useDebounce } from '@/hooks/useDebounce';
import { matchesSearch } from '@/utils/helpers';
import {
  DRAG_MIME,
  NODE_REGISTRY,
  PALETTE_SECTIONS,
  type PaletteSection,
} from '../config/nodeRegistry';
import { nodeAccentVar } from '../config/nodeAccents';
import type { PaletteDragPayload, WorkflowNodeType } from '../types/workflow.types';

interface PaletteEntry {
  key: string;
  label: string;
  hint: string;
  payload: PaletteDragPayload;
  icon: typeof KeyRound;
}

function sectionEntries(section: PaletteSection, agents: Agent[]): PaletteEntry[] {
  if (section.kind === 'agents') {
    return agents
      .filter((a) => a.platform === section.platform)
      .map((a) => ({
        key: a.id,
        label: a.name,
        hint: a.description,
        payload: { type: 'action', agentId: a.id },
        icon: KeyRound,
      }));
  }
  return section.types.map((type) => {
    const def = NODE_REGISTRY[type];
    return {
      key: type,
      label: def.label,
      hint: def.description,
      payload: { type },
      icon: def.icon,
    };
  });
}

interface NodeSidebarProps {
  /** Called when an entry is clicked (keyboard / touch alternative to drag & drop). */
  onAdd: (type: WorkflowNodeType, agent?: Agent) => void;
}

/**
 * Step palette: searchable, collapsible groups whose entries can be dragged onto the canvas or
 * clicked (Enter / Space) to add near the centre of the view.
 */
export function NodeSidebar({ onAdd }: NodeSidebarProps) {
  const agents = agentHooks.useList();
  const [openKey, setOpenKey] = useState<string>('windows');
  const [query, setQuery] = useState('');
  const search = useDebounce(query, 150);
  const agentList = agents.data ?? [];
  const searching = search.trim().length > 0;

  const onDragStart = (event: DragEvent, payload: PaletteDragPayload) => {
    event.dataTransfer.setData(DRAG_MIME, JSON.stringify(payload));
    event.dataTransfer.effectAllowed = 'move';
  };

  const sections = PALETTE_SECTIONS.map((section) => {
    const all = sectionEntries(section, agentList);
    const entries = searching
      ? all.filter((e) => matchesSearch(search, [e.label, e.hint, section.label]))
      : all;
    return { section, entries, total: all.length };
  }).filter(({ entries }) => !searching || entries.length > 0);

  return (
    <aside
      aria-label="Runbook steps"
      className="flex max-h-[320px] w-full shrink-0 flex-col border-b border-line bg-surface lg:max-h-none lg:w-[264px] lg:border-b-0 lg:border-r"
    >
      <div className="border-b border-line p-2.5">
        <Input
          size="small"
          allowClear
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search steps and agents"
          aria-label="Search steps and agents"
          prefix={<Search size={14} />}
          className="!h-8"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-1.5">
        {searching && sections.length === 0 && (
          <p className="m-0 px-3 py-8 text-center text-[12.5px] text-fg-muted">
            No steps match “{search}”
          </p>
        )}
        {sections.map(({ section, entries, total }) => {
          const open = searching || openKey === section.key;
          const listId = `palette-${section.key}`;
          return (
            <div key={section.key} className="mb-0.5">
              <button
                type="button"
                aria-expanded={open}
                aria-controls={listId}
                onClick={() => setOpenKey(openKey === section.key ? '' : section.key)}
                className="flex h-8 w-full cursor-pointer items-center gap-1.5 rounded-[7px] border-0 bg-transparent px-2 text-left text-[12px] font-medium uppercase tracking-[0.05em] text-fg-muted transition-colors duration-150 hover:bg-hover hover:text-fg"
              >
                <ChevronRight
                  size={14}
                  className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
                />
                <span className="flex-1 truncate">{section.label}</span>
                <span className="font-mono text-[11px] font-normal normal-case tracking-normal">
                  {searching ? entries.length : total}
                </span>
              </button>
              {open && (
                <ul
                  id={listId}
                  className="oe-animate-in m-0 flex list-none flex-col gap-px p-0 pb-1.5"
                >
                  {agents.isLoading && section.kind === 'agents' && (
                    <li className="px-3 py-2 text-[12.5px] text-fg-muted">Loading agents…</li>
                  )}
                  {!agents.isLoading && entries.length === 0 && (
                    <li className="px-3 py-2 text-[12.5px] text-fg-muted">No steps available</li>
                  )}
                  {entries.map((entry) => {
                    const Icon = entry.icon;
                    const agent = entry.payload.agentId
                      ? agentList.find((a) => a.id === entry.payload.agentId)
                      : undefined;
                    return (
                      <li key={entry.key}>
                        <Tooltip title={entry.hint} placement="right" mouseEnterDelay={0.6}>
                          <button
                            type="button"
                            draggable
                            onDragStart={(e) => onDragStart(e, entry.payload)}
                            onClick={() => onAdd(entry.payload.type, agent)}
                            aria-label={`Add ${entry.label}`}
                            className="group flex h-9 w-full cursor-grab items-center gap-2.5 rounded-[7px] border border-transparent bg-transparent px-2 text-left text-[13px] text-fg-secondary transition-colors duration-150 hover:border-[color-mix(in_srgb,var(--oe-primary)_22%,transparent)] hover:bg-primary-soft hover:text-fg active:cursor-grabbing"
                          >
                            <span
                              className="oe-type-tile"
                              style={{ ['--accent' as string]: nodeAccentVar(entry.payload.type) }}
                              aria-hidden
                            >
                              <Icon size={13} />
                            </span>
                            <span className="min-w-0 flex-1 truncate">{entry.label}</span>
                            <GripVertical
                              size={14}
                              aria-hidden
                              className="shrink-0 text-fg-muted opacity-0 transition-opacity group-hover:opacity-100"
                            />
                          </button>
                        </Tooltip>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
      <p className="m-0 hidden border-t border-line px-3 py-2.5 text-[11.5px] leading-relaxed text-fg-muted lg:block">
        Drag onto the canvas, or click to add at the centre.
      </p>
    </aside>
  );
}
