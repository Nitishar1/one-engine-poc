import type { Edge, Node, Viewport, XYPosition } from '@xyflow/react';
import type { AgentPlatform } from '@/features/agentRepository/types/agent.types';
import type { BaseEntity } from '@/types/common.types';

/* -------------------------------------------------------------------------- */
/* Node data contracts — one per node type.                                    */
/* React Flow requires node data to be a plain record, hence the index types. */
/* -------------------------------------------------------------------------- */

export interface StartNodeData extends Record<string, unknown> {
  label: string;
}

export interface EndNodeData extends Record<string, unknown> {
  label: string;
}

export interface ActionNodeData extends Record<string, unknown> {
  label: string;
  agentId: string;
  platform: AgentPlatform;
  parameters: Record<string, string>;
  timeoutSeconds: number;
  retries: number;
  continueOnError: boolean;
}

export interface ConditionNodeData extends Record<string, unknown> {
  label: string;
  expression: string;
}

export interface CommandNodeData extends Record<string, unknown> {
  label: string;
  shell: 'PowerShell' | 'Shell';
  command: string;
  target: string;
}

export interface DelayNodeData extends Record<string, unknown> {
  label: string;
  seconds: number;
}

/** Maps every node type to its data shape. Add new node types here first. */
export interface WorkflowNodeDataMap {
  start: StartNodeData;
  end: EndNodeData;
  action: ActionNodeData;
  condition: ConditionNodeData;
  command: CommandNodeData;
  delay: DelayNodeData;
}

export type WorkflowNodeType = keyof WorkflowNodeDataMap;

export type WorkflowNodeOf<K extends WorkflowNodeType> = Node<WorkflowNodeDataMap[K], K>;

export type WorkflowNode = { [K in WorkflowNodeType]: WorkflowNodeOf<K> }[WorkflowNodeType];

export type WorkflowEdge = Edge<{ label?: string }, 'workflow'>;

/* -------------------------------------------------------------------------- */
/* Persistence                                                                 */
/* -------------------------------------------------------------------------- */

export type SerializedNode = {
  [K in WorkflowNodeType]: {
    id: string;
    type: K;
    position: XYPosition;
    data: WorkflowNodeDataMap[K];
  };
}[WorkflowNodeType];

export interface SerializedEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  label?: string;
}

export interface WorkflowDefinition {
  nodes: SerializedNode[];
  edges: SerializedEdge[];
  viewport?: Viewport;
}

export interface Runbook extends BaseEntity {
  name: string;
  roles: string[];
  description: string;
  definition: WorkflowDefinition;
}

/** Payload dragged from the palette onto the canvas. */
export interface PaletteDragPayload {
  type: WorkflowNodeType;
  agentId?: string;
}

export interface WorkflowIssue {
  severity: 'error' | 'warning';
  message: string;
  nodeId?: string;
}
