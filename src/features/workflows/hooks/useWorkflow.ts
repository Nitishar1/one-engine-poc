import { useCallback } from 'react';
import { useReactFlow, type XYPosition } from '@xyflow/react';
import type { Agent } from '@/features/agentRepository/types/agent.types';
import { getNodeDefinition } from '../config/nodeRegistry';
import { useWorkflowStore } from '../stores/workflowStore';
import type { WorkflowNodeType } from '../types/workflow.types';
import { toast } from '@/components/feedback/toastStore';

const NODE_OFFSET = { x: 80, y: 24 };

/** Builder-level operations that combine the store, the node registry and the React Flow viewport. */
export function useWorkflow() {
  const { screenToFlowPosition, setCenter, getZoom, fitView } = useReactFlow();
  const addNode = useWorkflowStore((s) => s.addNode);

  const addNodeOfType = useCallback(
    (type: WorkflowNodeType, position: XYPosition, agent?: Agent): string | null => {
      const def = getNodeDefinition(type);
      const count = useWorkflowStore.getState().nodes.filter((n) => n.type === type).length;
      if (def.maxInstances !== undefined && count >= def.maxInstances) {
        void toast.warning(`Only ${def.maxInstances} ${def.label} step is allowed`);
        return null;
      }
      return addNode(type, position, def.createData({ agent }));
    },
    [addNode],
  );

  /** Adds a node at the given screen point (drag & drop) or near the viewport centre (click). */
  const addNodeAtScreen = useCallback(
    (
      type: WorkflowNodeType,
      screen: XYPosition | null,
      container: HTMLElement | null,
      agent?: Agent,
    ) => {
      let position: XYPosition;
      if (screen) {
        position = screenToFlowPosition(screen);
      } else {
        const rect = container?.getBoundingClientRect();
        const stagger = (useWorkflowStore.getState().nodes.length % 6) * 16;
        position = screenToFlowPosition({
          x: (rect ? rect.left + rect.width / 2 : window.innerWidth / 2) + stagger,
          y: (rect ? rect.top + rect.height / 2 : window.innerHeight / 2) + stagger,
        });
      }
      return addNodeOfType(
        type,
        { x: position.x - NODE_OFFSET.x, y: position.y - NODE_OFFSET.y },
        agent,
      );
    },
    [addNodeOfType, screenToFlowPosition],
  );

  const focusNode = useCallback(
    (id: string) => {
      const node = useWorkflowStore.getState().nodes.find((n) => n.id === id);
      if (!node) return;
      useWorkflowStore
        .getState()
        .onNodesChange(
          useWorkflowStore
            .getState()
            .nodes.map((n) => ({ type: 'select', id: n.id, selected: n.id === id })),
        );
      void setCenter(node.position.x + 100, node.position.y + 25, {
        zoom: Math.max(getZoom(), 1),
        duration: 400,
      });
    },
    [setCenter, getZoom],
  );

  return { addNodeOfType, addNodeAtScreen, focusNode, fitView };
}
