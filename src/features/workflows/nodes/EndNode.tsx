import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { WorkflowNodeOf } from '../types/workflow.types';
import { NodeShell } from './NodeShell';

export const EndNode = memo(function EndNode({
  id,
  data,
  selected,
}: NodeProps<WorkflowNodeOf<'end'>>) {
  return (
    <NodeShell
      id={id}
      type="end"
      label={data.label}
      selected={selected}
      shape="pill"
      outputs={[]}
    />
  );
});
