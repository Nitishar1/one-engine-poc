import type { ReactNode } from 'react';
import { Handle, NodeToolbar, Position } from '@xyflow/react';
import { Tooltip } from 'antd';
import { Copy, Settings2, Trash2, TriangleAlert, type LucideIcon } from 'lucide-react';
import { nodeAccentVar } from '../config/nodeAccents';
import { useWorkflowStore } from '../stores/workflowStore';
import type { WorkflowNodeType } from '../types/workflow.types';

interface OutputHandle {
  id?: string;
  label?: string;
  /** Vertical position as a percentage of the node height. */
  top?: number;
}

interface NodeShellProps {
  id: string;
  type: WorkflowNodeType;
  label: string;
  /** Short type caption shown above the label (e.g. "Agent · Windows"). */
  kind?: string;
  icon?: LucideIcon;
  selected?: boolean;
  shape?: 'pill' | 'box';
  input?: boolean;
  outputs?: OutputHandle[];
  subtitle?: ReactNode;
  invalid?: boolean;
}

function ToolbarButton({
  label,
  icon: Icon,
  onClick,
  danger,
}: {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <Tooltip title={label}>
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className={`oe-icon-btn !h-7 !w-7 ${danger ? 'is-danger' : ''}`}
      >
        <Icon size={14} />
      </button>
    </Tooltip>
  );
}

/** Contextual actions floating above the selected step. */
function NodeActions({ id, removable }: { id: string; removable: boolean }) {
  const setEditingNode = useWorkflowStore((s) => s.setEditingNode);
  const duplicateNode = useWorkflowStore((s) => s.duplicateNode);
  const removeNodes = useWorkflowStore((s) => s.removeNodes);
  return (
    <NodeToolbar position={Position.Top} offset={8} className="oe-node-toolbar">
      <ToolbarButton label="Configure" icon={Settings2} onClick={() => setEditingNode(id)} />
      {removable && (
        <>
          <ToolbarButton label="Duplicate" icon={Copy} onClick={() => duplicateNode(id)} />
          <ToolbarButton
            label="Delete step"
            icon={Trash2}
            danger
            onClick={() => removeNodes([id])}
          />
        </>
      )}
    </NodeToolbar>
  );
}

/**
 * Visual frame shared by every runbook step: a compact card with a type-tinted icon tile.
 * Start / End render as pills. Selected steps show a contextual action toolbar.
 */
export function NodeShell({
  id,
  type,
  label,
  kind,
  icon: Icon,
  selected,
  shape = 'box',
  input = true,
  outputs = [{}],
  subtitle,
  invalid,
}: NodeShellProps) {
  const accent = nodeAccentVar(type);
  const state = invalid ? 'is-invalid' : selected ? 'is-selected' : '';
  const setEditingNode = useWorkflowStore((s) => s.setEditingNode);
  return (
    <>
      <NodeActions id={id} removable={type !== 'start'} />
      <div
        className={`oe-node ${shape === 'pill' ? 'oe-node--pill' : 'oe-node--box'} ${state}`}
        style={{ ['--accent' as string]: accent }}
      >
        {input && <Handle type="target" position={Position.Left} />}
        {shape === 'pill' ? (
          <>
            <span className="oe-node__pulse" aria-hidden />
            <span className="truncate" title={label}>
              {label}
            </span>
          </>
        ) : (
          <>
            {Icon && (
              <span className="oe-node__icon" aria-hidden>
                <Icon size={15} strokeWidth={2} />
              </span>
            )}
            <div className="min-w-0 flex-1">
              {kind && <div className="oe-node__kind">{kind}</div>}
              {!selected && (
                <button
                  type="button"
                  aria-label={`Configure ${label}`}
                  className="oe-node__configure nodrag"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingNode(id);
                  }}
                >
                  <Settings2 size={12} />
                </button>
              )}
              <div className="oe-node__label" title={label}>
                {label}
              </div>
              {subtitle && <div className="oe-node__subtitle">{subtitle}</div>}
            </div>
          </>
        )}
        {invalid && (
          <TriangleAlert size={14} className="oe-node__warning" aria-label="Step has errors" />
        )}
        {outputs.map((o) => (
          <Handle
            key={o.id ?? 'out'}
            id={o.id}
            type="source"
            position={Position.Right}
            style={o.top ? { top: `${o.top}%` } : undefined}
          >
            {o.label && <span className="oe-node__handle-label">{o.label}</span>}
          </Handle>
        ))}
      </div>
    </>
  );
}
