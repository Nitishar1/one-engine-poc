import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/components/common/PageHeader';
import { FormCard } from '@/components/common/FormCard';
import { AppInput } from '@/components/common/AppInput';
import { AppSelect } from '@/components/common/AppSelect';
import { ErrorState } from '@/components/common/ErrorState';
import { useEntityFormPage } from '@/hooks/useEntityFormPage';
import { ROUTES } from '@/config/routes';
import { FormSection, FormSections } from '@/components/common/FormSection';
import { ciMasterHooks } from '../hooks/useCiMapping';
import { useCiLookups } from '../hooks/useCiLookups';
import {
  CI_ENVIRONMENTS,
  CI_STATUSES,
  ciMasterSchema,
  type CiMasterFormValues,
} from '../utils/ciMapping.schemas';

const toOptions = (values: readonly string[]) => values.map((v) => ({ label: v, value: v }));
const grid = 'grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2';

export default function CiMasterFormPage() {
  const page = useEntityFormPage(ciMasterHooks, ROUTES.ciMaster);
  const { types } = useCiLookups();
  const e = page.entity;

  const { control, handleSubmit } = useForm<CiMasterFormValues>({
    resolver: zodResolver(ciMasterSchema),
    defaultValues: {
      name: '',
      ciTypeId: '',
      hostName: '',
      ipAddress: '',
      operatingSystem: '',
      status: 'Active',
    },
    values: e
      ? {
          name: e.name,
          ciTypeId: e.ciTypeId,
          hostName: e.hostName,
          ipAddress: e.ipAddress,
          operatingSystem: e.operatingSystem,
          environment: e.environment,
          status: e.status,
        }
      : undefined,
  });

  return (
    <>
      <PageHeader
        title={page.isEdit ? 'Edit configuration item' : 'New configuration item'}
        description="Configuration items are the targets runbooks and agents operate on."
      />
      {page.loadError ? (
        <ErrorState error={page.loadError} />
      ) : (
        <FormCard
          title="Configuration item"
          onSubmit={handleSubmit(page.submit)}
          onBack={page.back}
          saving={page.isSaving}
          loading={page.isLoading}
          submitLabel={page.isEdit ? 'Save changes' : 'Create CI'}
        >
          <FormSections>
            <FormSection title="Identity" description="How this item is named and classified.">
              <div className={grid}>
                <AppInput
                  control={control}
                  name="name"
                  label="CI Name"
                  required
                  placeholder="e.g. Billing DB primary"
                />
                <AppSelect
                  control={control}
                  name="ciTypeId"
                  label="CI Type"
                  required
                  placeholder="Select CI Type"
                  options={types.map((t) => ({ label: t.name, value: t.id }))}
                />
              </div>
            </FormSection>
            <FormSection title="Network" description="Where agents connect to reach the host.">
              <div className={grid}>
                <AppInput
                  control={control}
                  name="hostName"
                  label="Host Name"
                  required
                  placeholder="e.g. db-prod-01"
                />
                <AppInput
                  control={control}
                  name="ipAddress"
                  label="IP Address"
                  required
                  placeholder="e.g. 10.131.33.157"
                  className="[&_input]:font-mono"
                />
                <AppInput
                  control={control}
                  name="operatingSystem"
                  label="Operating System"
                  required
                  placeholder="e.g. Windows Server 2022"
                  className="md:col-span-2"
                />
              </div>
            </FormSection>
            <FormSection title="Lifecycle" description="Deployment environment and current state.">
              <div className={grid}>
                <AppSelect
                  control={control}
                  name="environment"
                  label="Environment"
                  required
                  placeholder="Select Environment"
                  options={toOptions(CI_ENVIRONMENTS)}
                />
                <AppSelect
                  control={control}
                  name="status"
                  label="Status"
                  required
                  options={toOptions(CI_STATUSES)}
                />
              </div>
            </FormSection>
          </FormSections>
        </FormCard>
      )}
    </>
  );
}
