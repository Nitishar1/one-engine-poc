import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { Split } from 'lucide-react';
import type { WorkflowNodeOf } from '../types/workflow.types';
import { useNodeHasIssues } from '../hooks/useNodeIssues';
import { NodeShell } from './NodeShell';

/** Branches on an expression evaluated against the previous step's output. */
export const ConditionNode = memo(function ConditionNode({
  id,
  data,
  selected,
}: NodeProps<WorkflowNodeOf<'condition'>>) {
  const invalid = useNodeHasIssues(id);
  return (
    <NodeShell
      id={id}
      type="condition"
      label={data.label}
      kind="Condition"
      icon={Split}
      selected={selected}
      invalid={invalid}
      subtitle={data.expression ? <code>{data.expression}</code> : <em>No expression</em>}
      outputs={[
        { id: 'true', label: 'Yes', top: 32 },
        { id: 'false', label: 'No', top: 70 },
      ]}
    />
  );
});
