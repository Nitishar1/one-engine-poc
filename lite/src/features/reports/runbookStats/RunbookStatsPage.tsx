/**
 * Reports > Runbook Stats > Stats.
 *
 * Functionality:
 * - Filter: Tools Name (optional, narrows the runbooks) and Runbook (required), then Submit.
 * - Nothing is loaded until Submit. The chosen runbook is kept in the URL (?runbook=101), so the
 *   result survives a reload and the Dashboard can link straight to a run.
 * - Result: an overview of the run, then its stages collapsed; open a stage for its timeline
 *   and logs (see RunbookActivityView).
 */
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Activity, Send } from 'lucide-react';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppSelect } from '@/components/common/AppSelect';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { PageHeader } from '@/components/common/PageHeader';
import { Skeleton } from '@/components/common/Skeleton';
import { runbookLabel, useRunbookActivity, useRunbooks, useRunbookTools } from './runbookStats.api';
import { statsFilterSchema, type StatsFilterValues } from './runbookStats.schema';
import { RunbookActivityView } from './RunbookActivityView';

function ActivitySkeleton() {
  return (
    <div className="flex flex-col gap-3" role="status" aria-label="Loading">
      <Skeleton className="h-[260px] w-full rounded-[var(--oe-radius-lg)]" />
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-[62px] w-full rounded-[var(--oe-radius-lg)]" />
      ))}
    </div>
  );
}

export default function RunbookStatsPage() {
  const [params, setParams] = useSearchParams();
  const submittedId = params.get('runbook') ?? undefined;

  const tools = useRunbookTools();
  const { control, handleSubmit, setValue, getValues } = useForm<StatsFilterValues>({
    resolver: zodResolver(statsFilterSchema),
    defaultValues: { toolId: '', runbookId: submittedId ?? '' },
  });

  const toolId = useWatch({ control, name: 'toolId' });
  const runbooks = useRunbooks(toolId);
  const activity = useRunbookActivity(submittedId);

  // A runbook from another tool is cleared when the tool changes.
  useEffect(() => {
    const current = getValues('runbookId');
    if (current && runbooks.data && !runbooks.data.some((r) => String(r.runbookID) === current))
      setValue('runbookId', '');
  }, [runbooks.data, getValues, setValue]);

  const onSubmit = (values: StatsFilterValues) => {
    if (values.runbookId === submittedId) void activity.refetch();
    else setParams({ runbook: values.runbookId });
  };

  return (
    <>
      <PageHeader
        title="Runbook Stats"
        description="Pick a runbook run to see an overview, then open any stage for its timeline and logs."
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mb-5">
        <AppCard bodyClassName="px-5 py-5">
          <div className="grid grid-cols-1 items-start gap-x-5 gap-y-4 md:grid-cols-[1fr_1.4fr_auto]">
            <AppSelect
              control={control}
              name="toolId"
              label="Tools Name"
              placeholder="All tools"
              allowClear
              loading={tools.isLoading}
              options={(tools.data ?? []).map((t) => ({
                label: t.toolName,
                value: String(t.toolID),
              }))}
            />
            <AppSelect
              control={control}
              name="runbookId"
              label="Runbook"
              required
              placeholder="Select Runbook"
              loading={runbooks.isLoading}
              notFoundContent="No runbooks for this tool"
              options={(runbooks.data ?? []).map((r) => ({
                label: runbookLabel(r),
                value: String(r.runbookID),
              }))}
            />
            <AppButton
              htmlType="submit"
              icon={<Send size={15} />}
              loading={activity.isFetching}
              className="md:mt-[26px]"
            >
              Submit
            </AppButton>
          </div>
        </AppCard>
      </form>

      {!submittedId ? (
        <AppCard>
          <EmptyState
            icon={Activity}
            title="No runbook selected"
            description="Choose a runbook above and press Submit to see how its run went."
          />
        </AppCard>
      ) : activity.error ? (
        <AppCard>
          <ErrorState error={activity.error} onRetry={() => void activity.refetch()} />
        </AppCard>
      ) : !activity.data ? (
        <ActivitySkeleton />
      ) : (
        // key: a new run starts with its own expanded / collapsed state.
        <RunbookActivityView key={activity.data.runbookID} activity={activity.data} />
      )}
    </>
  );
}
