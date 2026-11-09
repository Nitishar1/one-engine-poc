import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/components/feedback/toastStore';
import { AppInput } from '@/components/common/AppInput';
import { AppSelect } from '@/components/common/AppSelect';
import { ErrorState } from '@/components/common/ErrorState';
import { FormCard } from '@/components/common/FormCard';
import { PageHeader } from '@/components/common/PageHeader';
import { ROUTES } from '@/config/routes';
import { useEntityFormPage } from '@/hooks/useEntityFormPage';
import { getErrorMessage } from '@/utils/helpers';
import { dataSourceHooks, dataSourceService } from './dataSource.api';
import {
  CONNECTION_STRING_SAMPLE,
  DATA_SOURCE_TYPES,
  makeDataSourceSchema,
  type DataSourceFormValues,
} from './dataSource.schema';

export default function DataSourceFormPage() {
  const page = useEntityFormPage(dataSourceHooks, ROUTES.dataSources);
  const schema = useMemo(() => makeDataSourceSchema(page.isEdit), [page.isEdit]);
  const [validating, setValidating] = useState(false);

  const { control, handleSubmit } = useForm<DataSourceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { dataSourceName: '', connectionString: '' },
    values: page.entity
      ? {
          dataSourceName: page.entity.dataSourceName,
          dataSourceType: page.entity.dataSourceType,
          // Never returned by the backend; empty keeps the stored value.
          connectionString: '',
        }
      : undefined,
  });

  /** Validate & Save: test the new connection string first, then save. */
  const submit = async (values: DataSourceFormValues) => {
    if (values.connectionString) {
      setValidating(true);
      try {
        const result = await dataSourceService.validate({
          dataSourceType: values.dataSourceType,
          connectionString: values.connectionString,
        });
        if (!result.valid) {
          toast.error(result.message);
          return;
        }
      } catch (error) {
        toast.error(getErrorMessage(error));
        return;
      } finally {
        setValidating(false);
      }
    }
    page.submit(values);
  };

  return (
    <>
      <PageHeader
        title={page.isEdit ? 'Edit DataSource' : 'Add DataSource'}
        description="The connection is tested before it is saved."
      />
      {page.loadError ? (
        <ErrorState error={page.loadError} />
      ) : (
        <FormCard
          title={page.isEdit ? 'Edit DataSource' : 'Add DataSource'}
          onSubmit={handleSubmit(submit)}
          onBack={page.back}
          saving={page.isSaving || validating}
          loading={page.isLoading}
          submitLabel="Validate & Save"
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
            <AppInput
              control={control}
              name="dataSourceName"
              label="DataSource Name"
              required
              placeholder="Enter DataSource Name"
            />
            <AppSelect
              control={control}
              name="dataSourceType"
              label="DataSource Type"
              required
              placeholder="Select DataSource Type"
              options={DATA_SOURCE_TYPES.map((t) => ({ label: t, value: t }))}
            />
            <AppInput
              control={control}
              name="connectionString"
              label="Connection String"
              required={!page.isEdit}
              kind="password"
              autoComplete="off"
              className="md:col-span-2"
              placeholder="Enter Connection String"
              hint={page.isEdit ? 'Leave empty to keep the current connection string.' : undefined}
            />
          </div>
          <div className="mt-5 rounded-[var(--oe-radius)] border border-line bg-surface-alt px-4 py-3">
            <p className="m-0 text-[13px] font-semibold text-fg">Connection String Sample</p>
            <code className="mt-1 block break-all text-[12.5px] text-fg-secondary">
              {CONNECTION_STRING_SAMPLE}
            </code>
          </div>
        </FormCard>
      )}
    </>
  );
}
