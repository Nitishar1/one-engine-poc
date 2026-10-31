import type { ComponentType } from 'react';
import type { EdgeTypes, NodeProps, NodeTypes } from '@xyflow/react';
import {
  CirclePlay,
  CircleStop,
  ListTree,
  Split,
  SquareTerminal,
  Timer,
  type LucideIcon,
} from 'lucide-react';
import type { Agent } from '@/features/agentRepository/types/agent.types';
import type {
  WorkflowNodeDataMap,
  WorkflowNodeOf,
  WorkflowNodeType,
} from '../types/workflow.types';
import { StartNode } from '../nodes/StartNode';
import { EndNode } from '../nodes/EndNode';
import { ActionNode } from '../nodes/ActionNode';
import { ConditionNode } from '../nodes/ConditionNode';
import { CommandNode } from '../nodes/CommandNode';
import { DelayNode } from '../nodes/DelayNode';
import { WorkflowEdge } from '../edges/WorkflowEdge';
import { LabelPropertiesForm } from '../components/properties/LabelPropertiesForm';
import { ActionPropertiesForm } from '../components/properties/ActionPropertiesForm';
import { ConditionPropertiesForm } from '../components/properties/ConditionPropertiesForm';
import { CommandPropertiesForm } from '../components/properties/CommandPropertiesForm';
import { DelayPropertiesForm } from '../components/properties/DelayPropertiesForm';
import type { NodePropertiesFormProps } from '../components/properties/types';

export interface NodeDefinition<K extends WorkflowNodeType> {
  type: K;
  label: string;
  description: string;
  icon: LucideIcon;
  component: ComponentType<NodeProps<WorkflowNodeOf<K>>>;
  propertiesForm: ComponentType<NodePropertiesFormProps<K>>;
  /** Builds the initial data for a node dropped on the canvas. `agent` is set for action nodes. */
  createData: (context: { agent?: Agent }) => WorkflowNodeDataMap[K];
  maxInstances?: number;
}

/**
 * Every node type the builder knows about. To add a node type: extend `WorkflowNodeDataMap`,
 * create its node component and properties form, then register it here.
 */
export const NODE_REGISTRY: { [K in WorkflowNodeType]: NodeDefinition<K> } = {
  start: {
    type: 'start',
    label: 'Start',
    description: 'Entry point of the runbook',
    icon: CirclePlay,
    component: StartNode,
    propertiesForm: LabelPropertiesForm<'start'>,
    createData: () => ({ label: 'Start' }),
    maxInstances: 1,
  },
  end: {
    type: 'end',
    label: 'End',
    description: 'Marks the runbook as complete',
    icon: CircleStop,
    component: EndNode,
    propertiesForm: LabelPropertiesForm<'end'>,
    createData: () => ({ label: 'End' }),
  },
  condition: {
    type: 'condition',
    label: 'Condition',
    description: 'Branch on the previous step output',
    icon: Split,
    component: ConditionNode,
    propertiesForm: ConditionPropertiesForm,
    createData: () => ({ label: 'Condition', expression: '' }),
  },
  delay: {
    type: 'delay',
    label: 'Delay',
    description: 'Wait before continuing',
    icon: Timer,
    component: DelayNode,
    propertiesForm: DelayPropertiesForm,
    createData: () => ({ label: 'Wait', seconds: 30 }),
  },
  command: {
    type: 'command',
    label: 'Run Command',
    description: 'Execute an ad-hoc command on a CI',
    icon: SquareTerminal,
    component: CommandNode,
    propertiesForm: CommandPropertiesForm,
    createData: () => ({ label: 'Run Command', shell: 'PowerShell', command: '', target: '' }),
  },
  action: {
    type: 'action',
    label: 'Agent',
    description: 'Run an agent from the repository',
    icon: ListTree,
    component: ActionNode,
    propertiesForm: ActionPropertiesForm,
    createData: ({ agent }) => {
      if (!agent) throw new Error('Action nodes require an agent');
      return {
        label: agent.name,
        agentId: agent.id,
        platform: agent.platform,
        parameters: Object.fromEntries(agent.parameters.map((p) => [p.name, p.defaultValue ?? ''])),
        timeoutSeconds: agent.timeoutSeconds,
        retries: 0,
        continueOnError: false,
      };
    },
  },
};

export const getNodeDefinition = <K extends WorkflowNodeType>(type: K) =>
  NODE_REGISTRY[type] as unknown as NodeDefinition<K>;

export const NODE_TYPES = Object.fromEntries(
  Object.values(NODE_REGISTRY).map((def) => [def.type, def.component]),
) as NodeTypes;

export const EDGE_TYPES: EdgeTypes = { workflow: WorkflowEdge } as EdgeTypes;

/** Palette groups, in the order shown in the reference screen. */
export type PaletteSection =
  | { key: string; label: string; kind: 'agents'; platform: Agent['platform'] }
  | { key: string; label: string; kind: 'nodes'; types: WorkflowNodeType[] };

export const PALETTE_SECTIONS: PaletteSection[] = [
  { key: 'nonWindows', label: 'Non Windows', kind: 'agents', platform: 'nonWindows' },
  { key: 'start', label: 'Start', kind: 'nodes', types: ['start', 'end', 'condition', 'delay'] },
  { key: 'commandCenter', label: 'Command Center', kind: 'nodes', types: ['command'] },
  { key: 'windows', label: 'Windows', kind: 'agents', platform: 'windows' },
];

export const DRAG_MIME = 'application/oneengine-node';
