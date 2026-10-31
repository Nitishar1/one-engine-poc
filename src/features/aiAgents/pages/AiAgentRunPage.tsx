import type { ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Play, Sparkles, Upload } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { AppCard } from '@/components/common/AppCard';
import { AppButton } from '@/components/common/AppButton';
import { AppInput } from '@/components/common/AppInput';
import { ErrorState } from '@/components/common/ErrorState';
import { IconAvatar } from '@/components/common/IconAvatar';
import { LoadingState } from '@/components/common/LoadingState';
import { Skeleton } from '@/components/common/Skeleton';
import { getErrorMessage } from '@/utils/helpers';
import { aiAgentHooks, useRunAiAgent } from '../hooks/useAi';
import { AiRunResult } from '../components/AiRunResult';
import { MAX_RUN_INPUT, aiRunSchema, type AiRunFormValues } from '../utils/ai.schemas';
import { toast } from '@/components/feedback/toastStore';

const ACCEPTED_FILES = '.txt,.md,.csv,.log,.json';

function RunningState() {
  return (
    <div role="status" aria-label="Agent is working" className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5 text-[12.5px] font-medium text-fg-secondary">
        <span className="oe-ai-orb is-active h-5 w-5">
          <Sparkles size={10} strokeWidth={2.4} />
        </span>
        Agent is working…
      </div>
      <div className="oe-ai-shimmer mb-1" aria-hidden />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-11/12" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export default function AiAgentRunPage() {
  const { id = '' } = useParams<{ id: string }>();
  const agent = aiAgentHooks.useDetail(id);
  const run = useRunAiAgent(id);

  const { control, handleSubmit, setValue } = useForm<AiRunFormValues>({
    resolver: zodResolver(aiRunSchema),
    defaultValues: { input: '', instructions: '' },
  });
  const input = useWatch({ control, name: 'input' }) ?? '';

  const loadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > MAX_RUN_INPUT * 4) {
      void toast.error('File is too large for this agent');
      return;
    }
    setValue('input', (await file.text()).slice(0, MAX_RUN_INPUT), { shouldValidate: true });
    void toast.info(`Loaded ${file.name}`);
  };

  if (agent.isLoading) return <LoadingState fullHeight />;
  if (agent.error || !agent.data)
    return <ErrorState error={agent.error ?? new Error('AI agent not found')} />;

  const a = agent.data;
  const isExtraction = a.kind === 'extraction';

  return (
    <>
      <PageHeader
        title={a.name}
        description={a.shortDescription}
        leading={<IconAvatar icon={a.icon} size={44} />}
      />
      {a.prerequisites && (
        <div className="mb-5 flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-[10px] border border-[color-mix(in_srgb,var(--oe-primary)_20%,transparent)] bg-primary-soft px-4 py-3 text-[13px]">
          <span className="font-medium text-fg">Prerequisites</span>
          <span className="text-fg-secondary">{a.prerequisites}</span>
        </div>
      )}
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        <form onSubmit={handleSubmit((values) => run.mutate(values))} noValidate>
          <AppCard
            title="Input"
            description={isExtraction ? 'Text to extract fields from' : 'Text to process'}
            extra={
              <label className="oe-icon-btn is-outlined !h-8 !w-auto cursor-pointer gap-1.5 !px-2.5 text-[13px] font-medium focus-within:outline focus-within:outline-2 focus-within:outline-[var(--oe-primary)]">
                <Upload size={14} /> Load file
                <input
                  type="file"
                  accept={ACCEPTED_FILES}
                  className="sr-only"
                  onChange={(e) => void loadFile(e)}
                />
              </label>
            }
            footer={
              <>
                <span className="mr-auto text-[12.5px] tabular-nums text-fg-muted">
                  {input.length.toLocaleString()} / {MAX_RUN_INPUT.toLocaleString()} characters
                </span>
                <AppButton htmlType="submit" loading={run.isPending} icon={<Play size={14} />}>
                  {isExtraction ? 'Extract' : 'Run Agent'}
                </AppButton>
              </>
            }
          >
            <div className="flex flex-col gap-5">
              <AppInput
                control={control}
                name="input"
                label={isExtraction ? 'Content to extract from' : 'Content'}
                required
                kind="textarea"
                rows={12}
                placeholder={
                  isExtraction
                    ? 'Paste an email, ticket or document…'
                    : 'Paste the text to summarise…'
                }
              />
              <AppInput
                control={control}
                name="instructions"
                label="Additional instructions"
                placeholder="Optional guidance for the agent"
              />
            </div>
          </AppCard>
        </form>
        <AppCard
          variant="tinted"
          title={
            <span className="flex items-center gap-2.5">
              <span className={`oe-ai-orb h-6 w-6 ${run.isPending ? 'is-active' : ''}`}>
                <Sparkles size={12} strokeWidth={2.2} />
              </span>
              <span className="text-[14px] font-semibold text-fg">Output</span>
            </span>
          }
          description={run.data ? 'Latest run' : 'Results of the latest run appear here'}
          className="xl:!sticky xl:top-4"
        >
          <div aria-live="polite">
            {run.isPending ? (
              <RunningState />
            ) : run.isError ? (
              <ErrorState title="Agent run failed" error={new Error(getErrorMessage(run.error))} />
            ) : (
              <AiRunResult
                result={run.data}
                expectation={a.fullDescription || a.shortDescription}
              />
            )}
          </div>
        </AppCard>
      </div>
    </>
  );
}
