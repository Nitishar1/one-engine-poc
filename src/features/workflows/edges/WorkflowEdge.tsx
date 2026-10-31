import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from '@xyflow/react';
import { X } from 'lucide-react';
import type { WorkflowEdge as WorkflowEdgeType } from '../types/workflow.types';
import { useWorkflowStore } from '../stores/workflowStore';

/**
 * Rounded step connector with an optional branch label. Selected edges switch to the accent
 * colour, show a flowing dash and an inline delete button.
 */
export function WorkflowEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}: EdgeProps<WorkflowEdgeType>) {
  const removeEdges = useWorkflowStore((s) => s.removeEdges);
  // Connections touching the selected step show their flow direction.
  const adjacentToSelection = useWorkflowStore((s) =>
    s.nodes.some((n) => n.selected && (n.id === source || n.id === target)),
  );
  const active = selected || adjacentToSelection;
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 10,
    offset: 18,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd ?? `url(#${active ? 'oe-arrow-active' : 'oe-arrow'})`}
        className={`oe-edge ${selected ? 'is-selected' : adjacentToSelection ? 'is-flowing' : ''}`}
      />
      {(data?.label || selected) && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan pointer-events-auto absolute flex items-center gap-1"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
          >
            {data?.label && (
              <span className="rounded-md border border-line-strong bg-surface-elevated px-1.5 py-px text-[11px] font-medium text-fg-secondary shadow-sm">
                {data.label}
              </span>
            )}
            {selected && (
              <button
                type="button"
                aria-label="Delete connection"
                onClick={() => removeEdges([id])}
                className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-surface-elevated text-fg-muted shadow-sm transition-colors hover:border-[var(--oe-error)] hover:text-danger"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
