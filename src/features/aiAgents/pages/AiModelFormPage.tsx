import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/components/common/PageHeader';
import { FormCard } from '@/components/common/FormCard';
import { AppInput, AppNumberInput } from '@/components/common/AppInput';
import { AppSelect } from '@/components/common/AppSelect';
import { ErrorState } from '@/components/common/ErrorState';
import { useEntityFormPage } from '@/hooks/useEntityFormPage';
import { ROUTES } from '@/config/routes';
import { FormSection, FormSections } from '@/components/common/FormSection';
import { LockKeyhole } from 'lucide-react';
import { aiModelHooks } from '../hooks/useAi';
import { AI_PROVIDERS, aiModelSchema, type AiModelFormValues } from '../utils/ai.schemas';

export default function AiModelFormPage() {
  const page = useEntityFormPage(aiModelHooks, ROUTES.aiModel);
  const e = page.entity;

  const { control, handleSubmit } = useForm<AiModelFormValues>({
    resolver: zodResolver(aiModelSchema),
    defaultValues: {
      name: '',
      modelId: '',
      endpoint: '',
      maxTokens: 4000,
      temperature: 0.3,
      status: 'Active',
    },
    values: e
      ? {
          name: e.name,
          provider: e.provider,
          modelId: e.modelId,
          endpoint: e.endpoint,
          maxTokens: e.maxTokens,
          temperature: e.temperature,
          status: e.status,
        }
      : undefined,
  });

  const grid = 'grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2';

  return (
    <>
      <PageHeader
        title={page.isEdit ? 'Edit AI model' : 'New AI model'}
        description="Register a model endpoint that AI agents can call."
      />
      {page.loadError ? (
        <ErrorState error={page.loadError} />
      ) : (
        <FormCard
          title="Model"
          onSubmit={handleSubmit(page.submit)}
          onBack={page.back}
          saving={page.isSaving}
          loading={page.isLoading}
          submitLabel={page.isEdit ? 'Save changes' : 'Create model'}
        >
          <FormSections>
            <FormSection title="Identity" description="Provider and the model it serves.">
              <div className={grid}>
                <AppInput
                  control={control}
                  name="name"
                  label="Model Name"
                  required
                  placeholder="e.g. Command R+"
                />
                <AppSelect
                  control={control}
                  name="provider"
                  label="Provider"
                  required
                  placeholder="Select Provider"
                  options={AI_PROVIDERS.map((p) => ({ label: p, value: p }))}
                />
                <AppInput
                  control={control}
                  name="modelId"
                  label="Model Id"
                  required
                  placeholder="e.g. cohere.command-r-plus"
                  className="[&_input]:font-mono"
                />
                <AppSelect
                  control={control}
                  name="status"
                  label="Status"
                  required
                  options={[
                    { label: 'Active', value: 'Active' },
                    { label: 'Inactive', value: 'Inactive' },
                  ]}
                />
              </div>
            </FormSection>
            <FormSection title="Connection" description="Where OneEngine sends inference requests.">
              <div className="flex flex-col gap-3">
                <AppInput
                  control={control}
                  name="endpoint"
                  label="Endpoint"
                  required
                  placeholder="https://…"
                  className="[&_input]:font-mono"
                />
                <p className="m-0 flex items-start gap-2 rounded-lg border border-line bg-surface-alt px-3 py-2.5 text-[12.5px] text-fg-muted">
                  <LockKeyhole size={14} className="mt-0.5 shrink-0" />
                  API keys and secrets are configured on the OneEngine server and are never stored
                  in the browser.
                </p>
              </div>
            </FormSection>
            <FormSection title="Generation" description="Defaults applied to every request.">
              <div className={grid}>
                <AppNumberInput
                  control={control}
                  name="maxTokens"
                  label="Max Tokens"
                  required
                  min={1}
                  max={200000}
                  hint="Upper bound on tokens per response."
                />
                <AppNumberInput
                  control={control}
                  name="temperature"
                  label="Temperature"
                  required
                  min={0}
                  max={2}
                  step={0.1}
                  hint="0 is deterministic; higher is more varied (max 2)."
                />
              </div>
            </FormSection>
          </FormSections>
        </FormCard>
      )}
    </>
  );
}
