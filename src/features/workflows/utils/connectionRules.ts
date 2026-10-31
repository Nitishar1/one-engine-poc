import type { Connection, Edge } from '@xyflow/react';
import type { WorkflowEdge, WorkflowNode } from '../types/workflow.types';
import { canReach } from './graph';

/**
 * Returns a human readable reason when a connection is not allowed, otherwise null.
 * Used both while dragging (to block the drop) and when the store adds an edge.
 */
export function getConnectionError(
  connection: Connection | Edge,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
): string | null {
  const { source, target } = connection;
  const sourceHandle = connection.sourceHandle ?? null;
  if (!source || !target) return 'Incomplete connection';
  if (source === target) return 'A step cannot connect to itself';

  const sourceNode = nodes.find((n) => n.id === source);
  const targetNode = nodes.find((n) => n.id === target);
  if (!sourceNode || !targetNode) return 'Unknown step';
  if (sourceNode.type === 'end') return 'End has no outgoing connections';
  if (targetNode.type === 'start') return 'Start cannot have incoming connections';

  if (edges.some((e) => e.source === source && (e.sourceHandle ?? null) === sourceHandle)) {
    return sourceNode.type === 'condition'
      ? 'This branch is already connected'
      : 'Each step can only continue to one next step. Use a Condition to branch.';
  }
  if (edges.some((e) => e.source === source && e.target === target))
    return 'These steps are already connected';
  if (canReach(target, source, edges)) return 'This connection would create a loop';
  return null;
}
