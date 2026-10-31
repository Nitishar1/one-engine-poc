import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { IconAvatar } from '@/components/common/IconAvatar';
import { Skeleton } from '@/components/common/Skeleton';
import { ROUTES } from '@/config/routes';
import { aiAgentHooks, aiModelHooks } from '@/features/aiAgents/hooks/useAi';

const KIND_LABEL = { summarization: 'Summarisation', extraction: 'Extraction', generic: 'General' };

/** Configured AI agents (each opens its workspace) and the model providers they connect to. */
export function AiAutomationPanel() {
  const agents = aiAgentHooks.useList();
  const models = aiModelHooks.useList();

  if (agents.isLoading || models.isLoading)
    return (
      <div className="flex flex-col gap-2" role="status" aria-label="Loading AI agents">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  if (agents.error || models.error)
    return <p className="m-0 text-[13px] text-fg-muted">AI configuration is unavailable.</p>;

  const modelById = new Map((models.data ?? []).map((m) => [m.id, m]));
  const providers = [...new Set((models.data ?? []).map((m) => m.provider))].map((provider) => ({
    provider,
    active: (models.data ?? []).some((m) => m.provider === provider && m.status === 'Active'),
  }));

  return (
    <div className="flex flex-col gap-4">
      <ul className="m-0 -mx-2 flex list-none flex-col p-0">
        {(agents.data ?? []).map((agent) => (
          <li key={agent.id}>
            <Link
              to={ROUTES.aiAgentRun(agent.id)}
              className="group flex items-center gap-3 rounded-lg px-2 py-2 !no-underline transition-colors duration-150 hover:bg-hover"
            >
              <IconAvatar icon={agent.icon} size={34} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-medium text-fg">
                  {agent.name}
                </span>
                <span className="block truncate text-[12px] text-fg-muted">
                  {KIND_LABEL[agent.kind]} · {modelById.get(agent.modelId)?.name ?? 'No model'}
                </span>
              </span>
              <ArrowRight
                size={15}
                className="shrink-0 text-primary opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
              />
            </Link>
          </li>
        ))}
      </ul>
      {providers.length > 0 && (
        <div className="border-t border-line pt-3.5">
          <p className="m-0 mb-2 text-[11px] font-medium uppercase tracking-[0.06em] text-fg-muted">
            Connected model providers
          </p>
          <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
            {providers.map(({ provider, active }) => (
              <li
                key={provider}
                className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-alt px-2 py-0.5 text-[12px] font-medium text-fg-secondary"
                title={active ? 'At least one active model' : 'No active models'}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-success' : 'bg-[var(--oe-text-muted)]'}`}
                />
                {provider}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
