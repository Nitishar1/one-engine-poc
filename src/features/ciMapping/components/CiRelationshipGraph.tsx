import { useMemo } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react';
import { ICON_REGISTRY } from '@/components/common/iconRegistry';
import { EmptyState } from '@/components/common/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import type { CiMaster, CiRelationship, CiType } from '../types/ciMapping.types';

interface CiRelationshipGraphProps {
  relationships: CiRelationship[];
  masters: CiMaster[];
  types: CiType[];
}

/** Read-only topology view of configuration items, laid out in columns by CI type. */
export function CiRelationshipGraph({ relationships, masters, types }: CiRelationshipGraphProps) {
  const { mode, tokens } = useTheme();

  const { nodes, edges } = useMemo(() => {
    const used = new Set(relationships.flatMap((r) => [r.sourceCiId, r.targetCiId]));
    const typeIndex = new Map(types.map((t, i) => [t.id, i]));
    const rowsPerColumn = new Map<number, number>();

    const nodes: Node[] = masters
      .filter((m) => used.has(m.id))
      .map((m) => {
        const column = typeIndex.get(m.ciTypeId) ?? types.length;
        const row = rowsPerColumn.get(column) ?? 0;
        rowsPerColumn.set(column, row + 1);
        const type = types.find((t) => t.id === m.ciTypeId);
        const Icon = ICON_REGISTRY[type?.icon ?? 'server'].icon;
        return {
          id: m.id,
          position: { x: column * 290, y: row * 96 },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
          data: {
            label: (
              <div className="oe-topology-node">
                <span
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-alt text-fg-secondary"
                  aria-hidden
                >
                  <Icon size={15} />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[10.5px] font-medium uppercase tracking-[0.04em] text-fg-muted">
                    {type?.name ?? 'CI'}
                  </span>
                  <strong className="truncate text-[13px] font-semibold">{m.name}</strong>
                  <span className="truncate font-mono text-[11px] text-fg-muted">
                    {m.ipAddress}
                  </span>
                </span>
              </div>
            ),
          },
        };
      });

    const edges: Edge[] = relationships.map((r) => ({
      id: r.id,
      source: r.sourceCiId,
      target: r.targetCiId,
      label: r.relationshipType,
      animated: r.relationshipType === 'Backs Up',
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed, color: tokens.edge, width: 16, height: 16 },
      labelBgPadding: [6, 3] as [number, number],
      labelBgBorderRadius: 5,
    }));
    return { nodes, edges };
  }, [relationships, masters, types, tokens]);

  if (!edges.length)
    return (
      <EmptyState
        title="No relationships to display"
        description="Relationships you add between configuration items appear here as a topology."
      />
    );

  return (
    <div
      className="oe-flow oe-flow-canvas oe-topology-graph h-[480px] overflow-hidden rounded-[10px] border border-line"
      aria-label="CI relationship topology"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.15, maxZoom: 1.1 }}
        colorMode={mode}
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color={tokens.canvasGrid}
          gap={20}
          size={1.2}
        />
        <Controls showInteractive={false} position="bottom-right" />
      </ReactFlow>
    </div>
  );
}
