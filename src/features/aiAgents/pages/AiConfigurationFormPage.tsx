import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/components/common/PageHeader';
import { FormCard } from '@/components/common/FormCard';
import { AppInput } from '@/components/common/AppInput';
import { AppSelect } from '@/components/common/AppSelect';
import { IconSelect } from '@/components/common/IconSelect';
import { ErrorState } from '@/components/common/ErrorState';
import { useEntityFormPage } from '@/hooks/useEntityFormPage';
import { ROUTES } from '@/config/routes';
import { FormSection, FormSections } from '@/components/common/FormSection';
import { aiAgentHooks, aiModelHooks } from '../hooks/useAi';
import {
  AI_AGENT_KINDS,
  aiAgentConfigSchema,
  type AiAgentConfigFormValues,
} from '../utils/ai.schemas';

export default function AiConfigurationFormPage() {
  const page = useEntityFormPage(aiAgentHooks, ROUTES.aiConfiguration);
  const models = aiModelHooks.useList();
  const e = page.entity;

  const { control, handleSubmit } = useForm<AiAgentConfigFormValues>({
    resolver: zodResolver(aiAgentConfigSchema),
    defaultValues: {
      name: '',
      modelId: '',
      shortDescription: '',
      fullDescription: '',
      prerequisites: '',
    },
    values: e
      ? {
          name: e.name,
          kind: e.kind,
          icon: e.icon,
          modelId: e.modelId,
          shortDescription: e.shortDescription,
          fullDescription: e.fullDescription,
          prerequisites: e.prerequisites,
        }
      : undefined,
  });

  const grid = 'grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2';

  return (
    <>
      <PageHeader
        title={page.isEdit ? 'Edit AI agent' : 'New AI agent'}
        description="Configure what the agent does and which model powers it."
      />
      {page.loadError ? (
        <ErrorState error={page.loadError} />
      ) : (
        <FormCard
          title="AI agent"
          onSubmit={handleSubmit(page.submit)}
          onBack={page.back}
          saving={page.isSaving}
          loading={page.isLoading}
          submitLabel={page.isEdit ? 'Save changes' : 'Create agent'}
        >
          <FormSections>
            <FormSection title="Basics" description="Name, type and appearance.">
              <div className={grid}>
                <AppInput
                  control={control}
                  name="name"
                  label="Agent Name"
                  required
                  placeholder="e.g. Incident Summariser"
                />
                <AppSelect
                  control={control}
                  name="kind"
                  label="Agent Type"
                  required
                  placeholder="Select Agent Type"
                  options={[...AI_AGENT_KINDS]}
                />
                <AppSelect
                  control={control}
                  name="modelId"
                  label="AI Model"
                  required
                  placeholder="Select AI Model"
                  loading={models.isLoading}
                  options={(models.data ?? []).map((m) => ({
                    label: `${m.name} (${m.provider})`,
                    value: m.id,
                  }))}
                />
                <IconSelect control={control} name="icon" required />
              </div>
            </FormSection>
            <FormSection
              title="Descriptions"
              description="The short description appears on cards; the full one in the workspace."
            >
              <div className="flex flex-col gap-5">
                <AppInput
                  control={control}
                  name="shortDescription"
                  label="Short Description"
                  required
                  kind="textarea"
                  rows={2}
                />
                <AppInput
                  control={control}
                  name="fullDescription"
                  label="Full Description"
                  required
                  kind="textarea"
                  rows={5}
                />
              </div>
            </FormSection>
            <FormSection title="Prerequisites" description="What must be in place before running.">
              <AppInput
                control={control}
                name="prerequisites"
                label="Prerequisites"
                required
                kind="textarea"
                rows={3}
                placeholder="1. Oracle Cloud account 2. OCI Generative AI 3. Streamlit"
              />
            </FormSection>
          </FormSections>
        </FormCard>
      )}
    </>
  );
}
