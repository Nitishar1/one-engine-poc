import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { SquareTerminal } from 'lucide-react';
import type { WorkflowNodeOf } from '../types/workflow.types';
import { useNodeHasIssues } from '../hooks/useNodeIssues';
import { NodeShell } from './NodeShell';

/** Ad-hoc command executed through the Command Center. */
export const CommandNode = memo(function CommandNode({
  id,
  data,
  selected,
}: NodeProps<WorkflowNodeOf<'command'>>) {
  const invalid = useNodeHasIssues(id);
  return (
    <NodeShell
      id={id}
      type="command"
      label={data.label}
      kind={`Command · ${data.shell}`}
      icon={SquareTerminal}
      selected={selected}
      invalid={invalid}
      subtitle={data.target ? `@ ${data.target}` : 'No target selected'}
    />
  );
});
