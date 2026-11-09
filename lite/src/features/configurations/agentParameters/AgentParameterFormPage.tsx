import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { AppButton } from '@/components/common/AppButton';
import { AppInput } from '@/components/common/AppInput';
import { ErrorState } from '@/components/common/ErrorState';
import { FormCard } from '@/components/common/FormCard';
import { PageHeader } from '@/components/common/PageHeader';
import { ROUTES } from '@/config/routes';
import { useEntityFormPage } from '@/hooks/useEntityFormPage';
import { agentParameterHooks } from './agentParameter.api';
import {
  agentParameterGroupSchema,
  type AgentParameterGroupFormValues,
} from './agentParameter.schema';

const EMPTY: AgentParameterGroupFormValues = {
  groupName: '',
  description: '',
  parameters: [{ name: '', value: '' }],
};

export default function AgentParameterFormPage() {
  const page = useEntityFormPage(agentParameterHooks, ROUTES.agentParameters);
  const { control, handleSubmit, formState } = useForm<AgentParameterGroupFormValues>({
    resolver: zodResolver(agentParameterGroupSchema),
    defaultValues: EMPTY,
    values: page.entity
      ? {
          groupName: page.entity.groupName,
          description: page.entity.description,
          parameters: page.entity.parameters,
        }
      : undefined,
  });
  const parameters = useFieldArray({ control, name: 'parameters' });
  const listError =
    formState.errors.parameters?.root?.message ?? formState.errors.parameters?.message;

  return (
    <>
      <PageHeader
        title={page.isEdit ? 'Edit Parameter Group' : 'Add Parameter Group'}
        description="Parameters are passed to agents as name / value pairs."
      />
      {page.loadError ? (
        <ErrorState error={page.loadError} />
      ) : (
        <FormCard
          title={page.isEdit ? 'Edit Parameter Group' : 'Add Parameter Group'}
          onSubmit={handleSubmit(page.submit)}
          onBack={page.back}
          saving={page.isSaving}
          loading={page.isLoading}
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
            <AppInput control={control} name="groupName" label="Group Name" required />
            <AppInput control={control} name="description" label="Description" />
          </div>

          <h3 className="m-0 mb-3 mt-7 font-sans text-[13px] font-semibold text-fg">Parameters</h3>
          <div className="flex flex-col gap-3">
            {parameters.fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[1fr_1fr_auto] items-start gap-3">
                <AppInput
                  control={control}
                  name={`parameters.${index}.name`}
                  label="Parameter Name"
                  required
                />
                <AppInput
                  control={control}
                  name={`parameters.${index}.value`}
                  label="Value"
                  required
                />
                <button
                  type="button"
                  className="oe-icon-btn is-danger mt-7"
                  aria-label={`Remove parameter ${index + 1}`}
                  disabled={parameters.fields.length === 1}
                  onClick={() => parameters.remove(index)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
          {listError && (
            <p role="alert" className="m-0 mt-2 text-[12.5px] text-danger">
              {listError}
            </p>
          )}
          <AppButton
            tone="secondary"
            className="mt-4"
            icon={<Plus size={15} />}
            onClick={() => parameters.append({ name: '', value: '' })}
          >
            Add parameter
          </AppButton>
        </FormCard>
      )}
    </>
  );
}
