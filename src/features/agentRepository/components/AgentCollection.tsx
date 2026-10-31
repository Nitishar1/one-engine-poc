import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { AppButton } from '@/components/common/AppButton';
import { Skeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';
import { ROUTES } from '@/config/routes';
import { agentHooks } from '../hooks/useAgents';
import type { Agent, AgentCategory, AgentPlatform } from '../types/agent.types';
import { AgentCard } from './AgentCard';
import { AgentDetailsDrawer } from './AgentDetailsDrawer';
import { AgentGrid } from './AgentGrid';
import { AgentPlatformList } from './AgentPlatformList';

/** Platform selector + card grid for one agent category ("Agents" or "Others"). */
export function AgentCollection({ category }: { category: AgentCategory }) {
  const navigate = useNavigate();
  const list = agentHooks.useList();
  const remove = agentHooks.useRemove();
  const confirmDelete = useConfirmDelete();
  const [platform, setPlatform] = useState<AgentPlatform>('windows');
  const [selected, setSelected] = useState<Agent | null>(null);

  const inCategory = useMemo(
    () => (list.data ?? []).filter((a) => a.category === category),
    [list.data, category],
  );
  const visible = inCategory.filter((a) => a.platform === platform);
  const counts = {
    windows: inCategory.filter((a) => a.platform === 'windows').length,
    nonWindows: inCategory.filter((a) => a.platform === 'nonWindows').length,
  };

  const edit = (agent: Agent) => navigate(ROUTES.agentEdit(agent.id));

  let content;
  if (list.isLoading)
    content = (
      <AgentGrid>
        {[0, 1, 2].map((i) => (
          <div key={i} className="oe-card flex flex-col gap-3 p-4" aria-hidden>
            <Skeleton className="h-10 w-10 !rounded-[10px]" />
            <Skeleton className="mt-2 h-3.5 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        ))}
      </AgentGrid>
    );
  else if (list.error)
    content = <ErrorState error={list.error} onRetry={() => void list.refetch()} />;
  else if (!visible.length)
    content = (
      <div className="rounded-[var(--oe-radius-lg)] border border-dashed border-line-strong">
        <EmptyState
          title={`No ${platform === 'windows' ? 'Windows' : 'non-Windows'} agents yet`}
          description="Agents wrap a script that runbooks can execute on a configuration item."
          action={
            <AppButton
              tone="secondary"
              icon={<Plus size={15} />}
              onClick={() => navigate(ROUTES.agentNew)}
            >
              New agent
            </AppButton>
          }
        />
      </div>
    );
  else
    content = (
      <AgentGrid>
        {visible.map((agent) => (
          <AgentCard
            key={agent.id}
            name={agent.name}
            description={agent.description}
            icon={agent.icon}
            meta={[
              agent.scriptType,
              `${agent.parameters.length} param${agent.parameters.length === 1 ? '' : 's'}`,
              `${agent.timeoutSeconds}s timeout`,
            ]}
            onOpen={() => setSelected(agent)}
            onEdit={() => edit(agent)}
            onDelete={() => confirmDelete('Agent', agent.name, () => remove.mutateAsync(agent.id))}
          />
        ))}
      </AgentGrid>
    );

  return (
    <div className="flex flex-col gap-4 md:flex-row md:gap-6">
      <AgentPlatformList value={platform} onChange={setPlatform} counts={counts} />
      <div className="min-w-0 flex-1">{content}</div>
      <AgentDetailsDrawer agent={selected} onClose={() => setSelected(null)} onEdit={edit} />
    </div>
  );
}
