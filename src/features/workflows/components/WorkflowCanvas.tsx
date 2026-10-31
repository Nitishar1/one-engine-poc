import {
  useCallback,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import {
  Background,
  BackgroundVariant,
  MiniMap,
  Panel,
  ReactFlow,
  useReactFlow,
  type Connection,
  type Edge,
  type IsValidConnection,
} from '@xyflow/react';
import {
  Copy,
  Maximize2,
  Settings2,
  Trash2,
  Unlink,
  CirclePlay,
  CircleStop,
  MousePointerClick,
  Split,
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import type { Agent } from '@/features/agentRepository/types/agent.types';
import { DRAG_MIME, EDGE_TYPES, NODE_TYPES } from '../config/nodeRegistry';
import { NODE_ACCENT_TOKEN } from '../config/nodeAccents';
import { NodeIssuesContext } from '../hooks/useNodeIssues';
import { useWorkflow } from '../hooks/useWorkflow';
import { useWorkflowStore } from '../stores/workflowStore';
import type { PaletteDragPayload, WorkflowEdge, WorkflowNode } from '../types/workflow.types';
import { getConnectionError } from '../utils/connectionRules';
import { NodePropertiesPanel } from './NodePropertiesPanel';
import { WorkflowContextMenu, type ContextMenuItem } from './WorkflowContextMenu';
import { WorkflowToolbar } from './WorkflowToolbar';
import { toast } from '@/components/feedback/toastStore';

type MenuTarget =
  | { kind: 'node'; id: string }
  | { kind: 'edge'; id: string }
  | { kind: 'pane'; screen: { x: number; y: number } };

interface MenuState {
  x: number;
  y: number;
  target: MenuTarget;
}

interface WorkflowCanvasProps {
  agents: Agent[];
  invalidNodeIds: Set<string>;
  onValidate: () => void;
  onExport: () => void;
  onImport: (json: string) => void;
}

/** Interactive React Flow surface for editing a runbook. */
export function WorkflowCanvas({
  agents,
  invalidNodeIds,
  onValidate,
  onExport,
  onImport,
}: WorkflowCanvasProps) {
  const { mode, tokens } = useTheme();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const { addNodeAtScreen, fitView } = useWorkflow();
  const { zoomIn, zoomOut } = useReactFlow();

  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const onNodesChange = useWorkflowStore((s) => s.onNodesChange);
  const onEdgesChange = useWorkflowStore((s) => s.onEdgesChange);
  const connect = useWorkflowStore((s) => s.connect);
  const setEditingNode = useWorkflowStore((s) => s.setEditingNode);
  const duplicateNode = useWorkflowStore((s) => s.duplicateNode);
  const removeNodes = useWorkflowStore((s) => s.removeNodes);
  const removeEdges = useWorkflowStore((s) => s.removeEdges);
  const disconnectNode = useWorkflowStore((s) => s.disconnectNode);

  const hasSelection = nodes.some((n) => n.selected) || edges.some((e) => e.selected);
  const isEmpty = edges.length === 0 && nodes.length <= 1;

  const isValidConnection = useCallback<IsValidConnection<WorkflowEdge>>((connection) => {
    const { nodes: n, edges: e } = useWorkflowStore.getState();
    return getConnectionError(connection as Connection | Edge, n, e) === null;
  }, []);

  const onConnect = useCallback(
    (connection: Connection) => {
      const error = connect(connection);
      if (error) void toast.warning(error);
    },
    [connect],
  );

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      const raw = event.dataTransfer.getData(DRAG_MIME);
      if (!raw) return;
      const payload = JSON.parse(raw) as PaletteDragPayload;
      const agent = payload.agentId ? agents.find((a) => a.id === payload.agentId) : undefined;
      if (payload.type === 'action' && !agent) {
        void toast.error('This agent is no longer available');
        return;
      }
      addNodeAtScreen(
        payload.type,
        { x: event.clientX, y: event.clientY },
        wrapperRef.current,
        agent,
      );
    },
    [agents, addNodeAtScreen],
  );

  const openMenu = (event: ReactMouseEvent | MouseEvent, target: MenuTarget) => {
    event.preventDefault();
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMenu({
      x: Math.min(event.clientX - rect.left, rect.width - 200),
      y: Math.min(event.clientY - rect.top, rect.height - 200),
      target,
    });
  };

  const deleteSelected = () => {
    const state = useWorkflowStore.getState();
    removeNodes(state.nodes.filter((n) => n.selected && n.type !== 'start').map((n) => n.id));
    removeEdges(state.edges.filter((e) => e.selected).map((e) => e.id));
  };

  const menuItems = (target: MenuTarget): ContextMenuItem[] => {
    if (target.kind === 'node') {
      const node = nodes.find((n) => n.id === target.id);
      const isStart = node?.type === 'start';
      return [
        {
          key: 'configure',
          label: 'Configure',
          icon: Settings2,
          onSelect: () => setEditingNode(target.id),
        },
        {
          key: 'duplicate',
          label: 'Duplicate',
          icon: Copy,
          disabled: isStart,
          onSelect: () => duplicateNode(target.id),
        },
        {
          key: 'disconnect',
          label: 'Remove connections',
          icon: Unlink,
          onSelect: () => disconnectNode(target.id),
        },
        {
          key: 'delete',
          label: 'Delete step',
          icon: Trash2,
          danger: true,
          disabled: isStart,
          onSelect: () => removeNodes([target.id]),
        },
      ];
    }
    if (target.kind === 'edge') {
      return [
        {
          key: 'delete',
          label: 'Delete connection',
          icon: Trash2,
          danger: true,
          onSelect: () => removeEdges([target.id]),
        },
      ];
    }
    const add = (type: 'start' | 'end' | 'condition') => () =>
      addNodeAtScreen(type, target.screen, null);
    return [
      {
        key: 'start',
        label: 'Add Start',
        icon: CirclePlay,
        disabled: nodes.some((n) => n.type === 'start'),
        onSelect: add('start'),
      },
      { key: 'condition', label: 'Add Condition', icon: Split, onSelect: add('condition') },
      { key: 'end', label: 'Add End', icon: CircleStop, onSelect: add('end') },
      {
        key: 'fit',
        label: 'Fit to view',
        icon: Maximize2,
        onSelect: () => void fitView({ duration: 300 }),
      },
    ];
  };

  return (
    <NodeIssuesContext.Provider value={invalidNodeIds}>
      <div
        ref={wrapperRef}
        className="oe-flow oe-flow-canvas relative h-full min-h-[420px] w-full overflow-hidden"
        aria-label="Runbook canvas"
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }}
        onDrop={onDrop}
      >
        {/* Arrowheads shared by every connection (see WorkflowEdge). */}
        <svg aria-hidden width="0" height="0" className="absolute">
          <defs>
            {(['oe-arrow', 'oe-arrow-active'] as const).map((markerId) => (
              <marker
                key={markerId}
                id={markerId}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path
                  d="M1 1.5 8 5 1 8.5z"
                  className={`oe-arrowhead ${markerId === 'oe-arrow-active' ? 'is-active' : ''}`}
                />
              </marker>
            ))}
          </defs>
        </svg>
        <ReactFlow<WorkflowNode, WorkflowEdge>
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          edgeTypes={EDGE_TYPES}
          defaultEdgeOptions={{ type: 'workflow' }}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
          onNodeDoubleClick={(_, node) => setEditingNode(node.id)}
          onNodeContextMenu={(e, node) => openMenu(e, { kind: 'node', id: node.id })}
          onEdgeContextMenu={(e, edge) => openMenu(e, { kind: 'edge', id: edge.id })}
          onPaneContextMenu={(e) =>
            openMenu(e, { kind: 'pane', screen: { x: e.clientX, y: e.clientY } })
          }
          onPaneClick={() => setMenu(null)}
          onBeforeDelete={async ({ nodes: toDelete, edges: edgesToDelete }) => ({
            nodes: toDelete.filter((n) => n.type !== 'start'),
            edges: edgesToDelete,
          })}
          deleteKeyCode={['Delete', 'Backspace']}
          colorMode={mode}
          snapToGrid
          snapGrid={[10, 10]}
          proOptions={{ hideAttribution: true }}
          fitView
          fitViewOptions={{ maxZoom: 1.1, padding: 0.12 }}
          minZoom={0.2}
          maxZoom={2}
        >
          <Background
            id="minor"
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1.2}
            color={tokens.canvasGrid}
          />
          <Background
            id="major"
            variant={BackgroundVariant.Lines}
            gap={200}
            lineWidth={1}
            color={tokens.chartGrid}
          />
          <MiniMap
            position="bottom-right"
            pannable
            zoomable
            className="!hidden md:!block"
            nodeColor={(n) =>
              tokens[NODE_ACCENT_TOKEN[n.type as WorkflowNode['type']] ?? 'nodeAction']
            }
            nodeBorderRadius={4}
            nodeStrokeWidth={0}
            bgColor={tokens.surfaceElevated}
            maskColor={mode === 'dark' ? 'rgba(3, 7, 18, 0.55)' : 'rgba(239, 244, 252, 0.72)'}
            maskStrokeColor={tokens.primary}
            maskStrokeWidth={1}
          />
          <Panel position="top-center" className="!mt-3">
            <WorkflowToolbar
              onValidate={onValidate}
              onFitView={() => void fitView({ duration: 300, maxZoom: 1.1, padding: 0.12 })}
              onZoomIn={() => void zoomIn({ duration: 200 })}
              onZoomOut={() => void zoomOut({ duration: 200 })}
              onDeleteSelected={deleteSelected}
              onExport={onExport}
              onImport={onImport}
              hasSelection={hasSelection}
            />
          </Panel>
          {isEmpty && (
            <Panel position="bottom-center" className="pointer-events-none !mb-6">
              <div className="oe-animate-in oe-glass flex items-center gap-2.5 rounded-full border border-line px-4 py-2 text-[12.5px] text-fg-muted shadow-card">
                <MousePointerClick size={14} className="shrink-0 text-primary" />
                Drag steps from the palette, connect handles, then double-click a step to configure
                it.
              </div>
            </Panel>
          )}
        </ReactFlow>
        {menu && (
          <WorkflowContextMenu
            x={menu.x}
            y={menu.y}
            items={menuItems(menu.target)}
            onClose={() => setMenu(null)}
          />
        )}
        <NodePropertiesPanel />
      </div>
    </NodeIssuesContext.Provider>
  );
}
