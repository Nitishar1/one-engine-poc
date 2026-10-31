import type { Viewport } from '@xyflow/react';
import type {
  SerializedEdge,
  SerializedNode,
  WorkflowDefinition,
  WorkflowEdge,
  WorkflowNode,
} from '../types/workflow.types';

export const CONDITION_HANDLE_LABELS: Record<string, string> = { true: 'Yes', false: 'No' };

export function toDefinition(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  viewport?: Viewport,
): WorkflowDefinition {
  return {
    nodes: nodes.map(
      ({ id, type, position, data }) => ({ id, type, position, data }) as SerializedNode,
    ),
    edges: edges.map(
      ({ id, source, target, sourceHandle, targetHandle, data }): SerializedEdge => ({
        id,
        source,
        target,
        sourceHandle: sourceHandle ?? null,
        targetHandle: targetHandle ?? null,
        ...(data?.label ? { label: data.label } : {}),
      }),
    ),
    viewport,
  };
}

export function fromDefinition(definition: WorkflowDefinition): {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
} {
  return {
    nodes: definition.nodes.map((n) => ({ ...n }) as WorkflowNode),
    edges: definition.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle ?? null,
      targetHandle: e.targetHandle ?? null,
      type: 'workflow',
      data: {
        label: e.label ?? (e.sourceHandle ? CONDITION_HANDLE_LABELS[e.sourceHandle] : undefined),
      },
    })),
  };
}

const NODE_TYPES = new Set(['start', 'end', 'action', 'condition', 'command', 'delay']);

/** Validates an imported JSON document before it is loaded into the builder. */
export function parseDefinition(json: string): WorkflowDefinition {
  const parsed: unknown = JSON.parse(json);
  const candidate = (parsed as { definition?: unknown }).definition ?? parsed;
  const def = candidate as Partial<WorkflowDefinition>;
  if (!Array.isArray(def.nodes) || !Array.isArray(def.edges)) {
    throw new Error('File does not contain a runbook definition');
  }
  for (const node of def.nodes) {
    if (
      !node ||
      typeof node.id !== 'string' ||
      !NODE_TYPES.has(node.type) ||
      !node.position ||
      !node.data
    ) {
      throw new Error('Runbook definition contains an invalid step');
    }
  }
  const ids = new Set(def.nodes.map((n) => n.id));
  for (const edge of def.edges) {
    if (!ids.has(edge.source) || !ids.has(edge.target))
      throw new Error('Runbook definition contains a broken connection');
  }
  return { nodes: def.nodes, edges: def.edges, viewport: def.viewport };
}
