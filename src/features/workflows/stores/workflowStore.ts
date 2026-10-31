import { create } from 'zustand';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type XYPosition,
} from '@xyflow/react';
import { generateId } from '@/utils/helpers';
import type {
  WorkflowDefinition,
  WorkflowEdge,
  WorkflowNode,
  WorkflowNodeDataMap,
  WorkflowNodeType,
} from '../types/workflow.types';
import { getConnectionError } from '../utils/connectionRules';
import { CONDITION_HANDLE_LABELS, fromDefinition } from '../utils/serialization';

const NON_DIRTY_CHANGES = new Set(['select', 'dimensions']);

export const createStartNode = (): WorkflowNode => ({
  id: generateId('node'),
  type: 'start',
  position: { x: 40, y: 80 },
  data: { label: 'Start' },
});

export interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  /** Node whose properties panel is open. */
  editingNodeId: string | null;
  dirty: boolean;

  onNodesChange: (changes: NodeChange<WorkflowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<WorkflowEdge>[]) => void;
  /** Adds an edge; returns an error message when the connection is rejected. */
  connect: (connection: Connection) => string | null;
  addNode: <K extends WorkflowNodeType>(
    type: K,
    position: XYPosition,
    data: WorkflowNodeDataMap[K],
  ) => string;
  updateNodeData: <K extends WorkflowNodeType>(
    id: string,
    data: Partial<WorkflowNodeDataMap[K]>,
  ) => void;
  duplicateNode: (id: string) => void;
  removeNodes: (ids: string[]) => void;
  removeEdges: (ids: string[]) => void;
  disconnectNode: (id: string) => void;
  setEditingNode: (id: string | null) => void;
  load: (definition: WorkflowDefinition) => void;
  reset: () => void;
  /** Removes every step except a fresh Start (marks the runbook as changed). */
  clear: () => void;
  markSaved: () => void;
}

export const useWorkflowStore = create<WorkflowState>()((set, get) => ({
  nodes: [createStartNode()],
  edges: [],
  editingNodeId: null,
  dirty: false,

  onNodesChange: (changes) =>
    set((s) => ({
      nodes: applyNodeChanges(changes, s.nodes),
      dirty: s.dirty || changes.some((c) => !NON_DIRTY_CHANGES.has(c.type)),
      editingNodeId: changes.some((c) => c.type === 'remove' && c.id === s.editingNodeId)
        ? null
        : s.editingNodeId,
    })),

  onEdgesChange: (changes) =>
    set((s) => ({
      edges: applyEdgeChanges(changes, s.edges),
      dirty: s.dirty || changes.some((c) => c.type !== 'select'),
    })),

  connect: (connection) => {
    const { nodes, edges } = get();
    const error = getConnectionError(connection, nodes, edges);
    if (error) return error;
    const label = connection.sourceHandle
      ? CONDITION_HANDLE_LABELS[connection.sourceHandle]
      : undefined;
    set({
      edges: addEdge<WorkflowEdge>(
        { ...connection, id: generateId('edge'), type: 'workflow', data: { label } },
        edges,
      ),
      dirty: true,
    });
    return null;
  },

  addNode: (type, position, data) => {
    const id = generateId('node');
    set((s) => ({
      nodes: [...s.nodes, { id, type, position, data } as WorkflowNode],
      dirty: true,
    }));
    return id;
  },

  updateNodeData: (id, data) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? ({ ...n, data: { ...n.data, ...data } } as WorkflowNode) : n,
      ),
      dirty: true,
    })),

  duplicateNode: (id) => {
    const node = get().nodes.find((n) => n.id === id);
    if (!node || node.type === 'start') return;
    const copy = {
      ...node,
      id: generateId('node'),
      selected: false,
      position: { x: node.position.x + 40, y: node.position.y + 60 },
      data: structuredClone(node.data),
    } as WorkflowNode;
    set((s) => ({ nodes: [...s.nodes, copy], dirty: true }));
  },

  removeNodes: (ids) =>
    set((s) => ({
      nodes: s.nodes.filter((n) => !ids.includes(n.id)),
      edges: s.edges.filter((e) => !ids.includes(e.source) && !ids.includes(e.target)),
      editingNodeId: s.editingNodeId && ids.includes(s.editingNodeId) ? null : s.editingNodeId,
      dirty: true,
    })),

  removeEdges: (ids) =>
    set((s) => ({ edges: s.edges.filter((e) => !ids.includes(e.id)), dirty: true })),

  disconnectNode: (id) =>
    set((s) => ({ edges: s.edges.filter((e) => e.source !== id && e.target !== id), dirty: true })),

  setEditingNode: (editingNodeId) => set({ editingNodeId }),

  load: (definition) => set({ ...fromDefinition(definition), editingNodeId: null, dirty: false }),

  reset: () => set({ nodes: [createStartNode()], edges: [], editingNodeId: null, dirty: false }),

  clear: () => set({ nodes: [createStartNode()], edges: [], editingNodeId: null, dirty: true }),

  markSaved: () => set({ dirty: false }),
}));
