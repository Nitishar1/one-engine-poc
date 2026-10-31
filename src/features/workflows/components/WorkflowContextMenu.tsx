import { useEffect, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface ContextMenuItem {
  key: string;
  label: string;
  icon: LucideIcon;
  danger?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

interface WorkflowContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

/** Lightweight themed context menu positioned inside the canvas container. */
export function WorkflowContextMenu({ x, y, items, onClose }: WorkflowContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const onPointer = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && onClose();
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer, true);
    ref.current?.querySelector('button')?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer, true);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="menu"
      className="absolute z-50 min-w-[200px] overflow-hidden rounded-[10px] border border-line-strong bg-surface-elevated p-1 shadow-pop [animation:oe-pop-in_0.14s_var(--oe-ease)_both]"
      style={{ left: x, top: y }}
    >
      {items.map(({ key, label, icon: Icon, danger, disabled, onSelect }) => (
        <button
          key={key}
          type="button"
          role="menuitem"
          disabled={disabled}
          onClick={() => {
            onSelect();
            onClose();
          }}
          className={`flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-[7px] border-0 bg-transparent px-2.5 text-left text-[13.5px] transition-colors duration-100 hover:bg-hover focus-visible:bg-hover disabled:cursor-not-allowed disabled:opacity-40 ${
            danger ? 'text-danger' : 'text-fg-secondary hover:text-fg'
          }`}
        >
          <Icon size={15} className="shrink-0" />
          {label}
        </button>
      ))}
    </div>
  );
}
