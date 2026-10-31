import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { WorkflowNodeOf } from '../types/workflow.types';
import { NodeShell } from './NodeShell';

export const StartNode = memo(function StartNode({
  id,
  data,
  selected,
}: NodeProps<WorkflowNodeOf<'start'>>) {
  return (
    <NodeShell
      id={id}
      type="start"
      label={data.label}
      selected={selected}
      shape="pill"
      input={false}
    />
  );
});
