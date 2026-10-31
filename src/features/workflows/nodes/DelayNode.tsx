import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { Timer } from 'lucide-react';
import { formatDuration } from '@/utils/formatters';
import type { WorkflowNodeOf } from '../types/workflow.types';
import { NodeShell } from './NodeShell';

export const DelayNode = memo(function DelayNode({
  id,
  data,
  selected,
}: NodeProps<WorkflowNodeOf<'delay'>>) {
  return (
    <NodeShell
      id={id}
      type="delay"
      label={data.label}
      kind="Delay"
      icon={Timer}
      selected={selected}
      subtitle={`Wait ${formatDuration(data.seconds)}`}
    />
  );
});
