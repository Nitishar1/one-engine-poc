import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CornerDownLeft,
  FilePlus2,
  Moon,
  Search,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import { NAV_PAGES } from '@/config/navigation';
import { ROUTES } from '@/config/routes';
import { useTheme } from '@/hooks/useTheme';
import { matchesSearch } from '@/utils/helpers';

interface Command {
  id: string;
  label: string;
  hint?: string;
  section: 'Pages' | 'Create' | 'Preferences';
  icon: LucideIcon;
  run: () => void;
}

const CREATE_ACTIONS: Array<{ label: string; path: string }> = [
  { label: 'New runbook', path: ROUTES.runbook },
  { label: 'New agent', path: ROUTES.agentNew },
  { label: 'New CI type', path: ROUTES.ciTypeNew },
  { label: 'New CI master record', path: ROUTES.ciMasterNew },
  { label: 'New CI relationship', path: ROUTES.ciRelationshipNew },
  { label: 'New AI model', path: ROUTES.aiModelNew },
  { label: 'New AI configuration', path: ROUTES.aiConfigurationNew },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

/** ⌘K palette: jump to any page, start a create flow or switch theme. */
export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      destroyOnHidden
      width="min(600px, calc(100vw - 24px))"
      rootClassName="oe-command"
      style={{ top: '12vh' }}
      aria-label="Command palette"
    >
      <PaletteBody onClose={onClose} />
    </Modal>
  );
}

function PaletteBody({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const commands = useMemo<Command[]>(() => {
    const go = (path: string) => () => navigate(path);
    return [
      ...NAV_PAGES.map((p) => ({
        id: `page-${p.key}`,
        label: p.label,
        hint: p.group || undefined,
        section: 'Pages' as const,
        icon: p.icon ?? ArrowRight,
        run: go(p.path),
      })),
      ...CREATE_ACTIONS.map((a) => ({
        id: `create-${a.path}`,
        label: a.label,
        section: 'Create' as const,
        icon: FilePlus2,
        run: go(a.path),
      })),
      {
        id: 'theme',
        label: `Switch to ${isDark ? 'light' : 'dark'} theme`,
        section: 'Preferences',
        icon: isDark ? Sun : Moon,
        run: toggle,
      },
    ];
  }, [navigate, isDark, toggle]);

  const results = useMemo(
    () => commands.filter((c) => matchesSearch(query, [c.label, c.hint, c.section])),
    [commands, query],
  );
  const activeIndex = Math.min(active, Math.max(results.length - 1, 0));

  const execute = (command: Command | undefined) => {
    if (!command) return;
    onClose();
    command.run();
  };

  const move = (delta: number) => {
    if (!results.length) return;
    const next = (activeIndex + delta + results.length) % results.length;
    setActive(next);
    listRef.current?.querySelector(`[data-index="${next}"]`)?.scrollIntoView({ block: 'nearest' });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      move(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      move(-1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      execute(results[activeIndex]);
    }
  };

  let lastSection: string | null = null;

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 border-b border-line px-4">
        <Search size={17} className="shrink-0 text-fg-muted" />
        <input
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search pages and actions…"
          aria-label="Search pages and actions"
          role="combobox"
          aria-expanded
          aria-controls="oe-command-list"
          aria-activedescendant={results[activeIndex] ? `cmd-${activeIndex}` : undefined}
          className="h-[52px] min-w-0 flex-1 border-0 bg-transparent text-[15px] text-fg outline-none placeholder:text-fg-muted"
        />
        <span className="oe-kbd">esc</span>
      </div>
      <div
        ref={listRef}
        id="oe-command-list"
        role="listbox"
        aria-label="Results"
        className="max-h-[min(400px,55vh)] overflow-y-auto p-2"
      >
        {results.length === 0 && (
          <p className="m-0 px-3 py-10 text-center text-[13px] text-fg-muted">
            No results for “{query}”
          </p>
        )}
        {results.map((command, index) => {
          const showSection = command.section !== lastSection;
          lastSection = command.section;
          const Icon = command.icon;
          return (
            <div key={command.id}>
              {showSection && (
                <div className="px-3 pb-1.5 pt-3 text-[11px] font-medium uppercase tracking-[0.06em] text-fg-muted first:pt-1">
                  {command.section}
                </div>
              )}
              <div
                id={`cmd-${index}`}
                data-index={index}
                role="option"
                aria-selected={index === activeIndex}
                onMouseMove={() => index !== activeIndex && setActive(index)}
                onClick={() => execute(command)}
                className="oe-command-item flex h-10 cursor-pointer items-center gap-3 rounded-lg px-3 text-[13.5px] text-fg-secondary"
              >
                <Icon size={16} strokeWidth={1.9} className="shrink-0 text-fg-muted" />
                <span className="truncate text-fg">{command.label}</span>
                {command.hint && (
                  <span className="truncate text-[12.5px] text-fg-muted">{command.hint}</span>
                )}
                {index === activeIndex && (
                  <CornerDownLeft size={14} className="ml-auto shrink-0 text-fg-muted" />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 text-[12px] text-fg-muted">
        <span className="flex items-center gap-1.5">
          <span className="oe-kbd">↑</span>
          <span className="oe-kbd">↓</span> navigate
        </span>
        <span className="flex items-center gap-1.5">
          <span className="oe-kbd">↵</span> open
        </span>
      </div>
    </div>
  );
}
