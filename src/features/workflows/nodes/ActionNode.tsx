import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { ListTree, Terminal } from 'lucide-react';
import type { WorkflowNodeOf } from '../types/workflow.types';
import { useNodeHasIssues } from '../hooks/useNodeIssues';
import { NodeShell } from './NodeShell';

/** Runs an agent from the Agent Repository. */
export const ActionNode = memo(function ActionNode({
  id,
  data,
  selected,
}: NodeProps<WorkflowNodeOf<'action'>>) {
  const invalid = useNodeHasIssues(id);
  const isWindows = data.platform === 'windows';
  return (
    <NodeShell
      id={id}
      type="action"
      label={data.label}
      kind={`Agent · ${isWindows ? 'Windows' : 'Non Windows'}`}
      icon={isWindows ? ListTree : Terminal}
      selected={selected}
      invalid={invalid}
      subtitle={[
        `${data.timeoutSeconds}s timeout`,
        data.retries > 0 ? `${data.retries} retr${data.retries === 1 ? 'y' : 'ies'}` : null,
        data.continueOnError ? 'continues on error' : null,
      ]
        .filter(Boolean)
        .join(' · ')}
    />
  );
});
