import type { ReactNode } from 'react';
import { Tooltip } from 'antd';
import { ArrowUpRight, SquarePen, Trash2 } from 'lucide-react';
import { IconAvatar } from '@/components/common/IconAvatar';
import type { IconKey } from '@/components/common/iconRegistry';

interface AgentCardProps {
  name: string;
  description: string;
  icon: IconKey;
  /** Short facts shown under the description (platform, script type, parameter count…). */
  meta?: string[];
  linkLabel?: string;
  /** Small marker next to the avatar (e.g. the AI chip). */
  badge?: ReactNode;
  onOpen: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

/** Compact agent tile used by the Agent Repository and AI Agents screens. */
export function AgentCard({
  name,
  description,
  icon,
  meta = [],
  linkLabel = 'View details',
  badge,
  onOpen,
  onEdit,
  onDelete,
}: AgentCardProps) {
  return (
    <article className="oe-card oe-card-interactive group flex flex-col" onClick={onOpen}>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <span className="flex items-center gap-2.5">
            <IconAvatar icon={icon} size={40} />
            {badge}
          </span>
          {(onEdit || onDelete) && (
            <div
              className="flex gap-0.5 transition-opacity duration-150 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              {onEdit && (
                <Tooltip title="Edit">
                  <button
                    type="button"
                    className="oe-icon-btn !h-7 !w-7"
                    aria-label={`Edit ${name}`}
                    onClick={onEdit}
                  >
                    <SquarePen size={15} />
                  </button>
                </Tooltip>
              )}
              {onDelete && (
                <Tooltip title="Delete">
                  <button
                    type="button"
                    className="oe-icon-btn is-danger !h-7 !w-7"
                    aria-label={`Delete ${name}`}
                    onClick={onDelete}
                  >
                    <Trash2 size={15} />
                  </button>
                </Tooltip>
              )}
            </div>
          )}
        </div>
        <h3 className="mb-1 mt-4 break-words font-sans text-[14.5px] font-semibold tracking-[-0.005em] text-fg">
          {name}
        </h3>
        <p
          className="m-0 line-clamp-2 break-words text-[13px] leading-relaxed text-fg-muted"
          title={description}
        >
          {description}
        </p>
        {meta.length > 0 && (
          <ul className="m-0 mt-3 flex list-none flex-wrap gap-1.5 p-0">
            {meta.map((item) => (
              <li
                key={item}
                className="rounded-md border border-line bg-surface-alt px-1.5 py-0.5 text-[11.5px] font-medium text-fg-secondary"
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex items-center border-t border-line px-4 py-2.5">
        <button
          type="button"
          className="oe-link text-[13px]"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
        >
          {linkLabel}
        </button>
        <ArrowUpRight
          size={15}
          aria-hidden
          className="ml-auto text-fg-muted transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg"
        />
      </div>
    </article>
  );
}
