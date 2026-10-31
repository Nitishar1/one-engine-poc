import { useNavigate } from 'react-router-dom';
import { Bot, Plus, Sparkles } from 'lucide-react';
import { AppButton } from '@/components/common/AppButton';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Skeleton } from '@/components/common/Skeleton';
import { AgentCard } from '@/features/agentRepository/components/AgentCard';
import { AgentGrid } from '@/features/agentRepository/components/AgentGrid';
import { ROUTES } from '@/config/routes';
import { AI_AGENT_KINDS } from '../utils/ai.schemas';
import { aiAgentHooks, aiModelHooks } from '../hooks/useAi';

const KIND_LABEL = Object.fromEntries(AI_AGENT_KINDS.map((k) => [k.value, k.label]));

/** Card grid of configured AI agents; each card opens the agent workspace. */
export function AiAgentCollection({ linkLabel = 'Open workspace' }: { linkLabel?: string }) {
  const navigate = useNavigate();
  const list = aiAgentHooks.useList();
  const models = aiModelHooks.useList();
  const modelName = (id: string) => models.data?.find((m) => m.id === id)?.name;

  if (list.isLoading)
    return (
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
  if (list.error) return <ErrorState error={list.error} onRetry={() => void list.refetch()} />;
  if (!list.data?.length)
    return (
      <div className="rounded-[var(--oe-radius-lg)] border border-dashed border-line-strong">
        <EmptyState
          icon={Bot}
          title="No AI agents configured"
          description="Configure an agent and the model it uses, then run it from here."
          action={
            <AppButton
              tone="secondary"
              icon={<Plus size={15} />}
              onClick={() => navigate(ROUTES.aiConfigurationNew)}
            >
              Configure an AI agent
            </AppButton>
          }
        />
      </div>
    );

  return (
    <AgentGrid>
      {list.data.map((agent) => (
        <AgentCard
          key={agent.id}
          badge={
            <span className="oe-ai-chip">
              <Sparkles size={10} strokeWidth={2.4} /> AI
            </span>
          }
          name={agent.name}
          description={agent.shortDescription}
          icon={agent.icon}
          meta={[KIND_LABEL[agent.kind] ?? agent.kind, modelName(agent.modelId)].filter(
            (m): m is string => Boolean(m),
          )}
          linkLabel={linkLabel}
          onOpen={() => navigate(ROUTES.aiAgentRun(agent.id))}
        />
      ))}
    </AgentGrid>
  );
}
