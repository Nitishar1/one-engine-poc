import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/components/common/PageHeader';
import { FormCard } from '@/components/common/FormCard';
import { AppInput, AppNumberInput } from '@/components/common/AppInput';
import { AppSelect } from '@/components/common/AppSelect';
import { IconSelect } from '@/components/common/IconSelect';
import { ErrorState } from '@/components/common/ErrorState';
import { useEntityFormPage } from '@/hooks/useEntityFormPage';
import { ROUTES } from '@/config/routes';
import { agentHooks } from '../hooks/useAgents';
import { AgentParametersField } from '../components/AgentParametersField';
import { FormSection, FormSections } from '@/components/common/FormSection';
import {
  CATEGORY_OPTIONS,
  PLATFORM_OPTIONS,
  SCRIPT_TYPES,
  agentSchema,
  type AgentFormValues,
} from '../utils/agent.schemas';

const grid = 'grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2';

export default function AgentFormPage() {
  const page = useEntityFormPage(agentHooks, ROUTES.agentRepository);
  const e = page.entity;

  const { control, handleSubmit, formState } = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: '',
      description: '',
      platform: 'windows',
      category: 'agents',
      scriptType: 'PowerShell',
      timeoutSeconds: 60,
      script: '',
      parameters: [],
    },
    values: e
      ? {
          name: e.name,
          description: e.description,
          platform: e.platform,
          category: e.category,
          icon: e.icon,
          scriptType: e.scriptType,
          timeoutSeconds: e.timeoutSeconds,
          script: e.script,
          parameters: e.parameters,
        }
      : undefined,
  });

  return (
    <>
      <PageHeader
        title={page.isEdit ? 'Edit agent' : 'New agent'}
        description="An agent wraps a script that runbooks can execute on configuration items."
      />
      {page.loadError ? (
        <ErrorState error={page.loadError} />
      ) : (
        <FormCard
          title="Agent"
          onSubmit={handleSubmit(page.submit)}
          onBack={page.back}
          saving={page.isSaving}
          loading={page.isLoading}
          submitLabel={page.isEdit ? 'Save changes' : 'Create agent'}
        >
          <FormSections>
            <FormSection
              title="Basics"
              description="Name, description and how the agent is listed in the repository."
            >
              <div className={grid}>
                <AppInput
                  control={control}
                  name="name"
                  label="Agent Name"
                  required
                  placeholder="e.g. Restart Windows Service"
                />
                <IconSelect control={control} name="icon" required />
                <AppSelect
                  control={control}
                  name="category"
                  label="Category"
                  required
                  options={[...CATEGORY_OPTIONS]}
                />
                <AppInput
                  control={control}
                  name="description"
                  label="Description"
                  required
                  kind="textarea"
                  rows={3}
                  className="md:col-span-2"
                  placeholder="What does this agent do?"
                />
              </div>
            </FormSection>
            <FormSection title="Execution" description="Where and how long the script may run.">
              <div className={grid}>
                <AppSelect
                  control={control}
                  name="platform"
                  label="Platform"
                  required
                  options={[...PLATFORM_OPTIONS]}
                />
                <AppSelect
                  control={control}
                  name="scriptType"
                  label="Script Type"
                  required
                  options={SCRIPT_TYPES.map((s) => ({ label: s, value: s }))}
                />
                <AppNumberInput
                  control={control}
                  name="timeoutSeconds"
                  label="Timeout (seconds)"
                  required
                  min={5}
                  max={3600}
                  hint="Between 5 and 3600 seconds."
                />
              </div>
            </FormSection>
            <FormSection
              title="Script & parameters"
              description="Inputs supplied by the runbook, and the script body executed on the target."
            >
              <div className="flex flex-col gap-5">
                <AgentParametersField control={control} errors={formState.errors} />
                <AppInput
                  control={control}
                  name="script"
                  label="Script"
                  required
                  kind="textarea"
                  rows={12}
                  spellCheck={false}
                  className="[&_textarea]:!bg-surface-sunken [&_textarea]:font-mono [&_textarea]:!text-[12.5px] [&_textarea]:leading-relaxed"
                  placeholder="Script body executed on the target"
                />
              </div>
            </FormSection>
          </FormSections>
        </FormCard>
      )}
    </>
  );
}
