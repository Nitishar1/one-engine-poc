import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppCheckbox } from '@/components/common/AppCheckbox';
import { AppInput } from '@/components/common/AppInput';
import { ErrorState } from '@/components/common/ErrorState';
import { FormCard } from '@/components/common/FormCard';
import { PageHeader } from '@/components/common/PageHeader';
import { ROUTES } from '@/config/routes';
import { useEntityFormPage } from '@/hooks/useEntityFormPage';
import { appSettingHooks } from './appSetting.api';
import { makeAppSettingSchema, type AppSettingFormValues } from './appSetting.schema';

export default function AppSettingFormPage() {
  const page = useEntityFormPage(appSettingHooks, ROUTES.appSettings);
  const keepExistingSecret = Boolean(page.entity?.isSecret);
  const schema = useMemo(() => makeAppSettingSchema(keepExistingSecret), [keepExistingSecret]);

  const { control, handleSubmit } = useForm<AppSettingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { appKey: '', appValue: '', isSecret: false },
    values: page.entity
      ? {
          appKey: page.entity.appKey,
          // Secret values never come back from the backend.
          appValue: page.entity.isSecret ? '' : (page.entity.appValue ?? ''),
          isSecret: page.entity.isSecret,
        }
      : undefined,
  });

  const submit = (values: AppSettingFormValues) =>
    page.submit({
      ...values,
      // Empty value while editing a secret: keep the stored value.
      appValue: keepExistingSecret && !values.appValue ? null : values.appValue,
    });

  return (
    <>
      <PageHeader
        title={page.isEdit ? 'Edit AppSetting' : 'Add AppSetting'}
        description="Settings are read by OneEngine services at start-up."
      />
      {page.loadError ? (
        <ErrorState error={page.loadError} />
      ) : (
        <FormCard
          title={page.isEdit ? 'Edit AppSetting' : 'Add AppSetting'}
          onSubmit={handleSubmit(submit)}
          onBack={page.back}
          saving={page.isSaving}
          loading={page.isLoading}
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
            <AppInput
              control={control}
              name="appKey"
              label="App Key"
              required
              placeholder="e.g. oe_pythonpath"
            />
            <AppInput
              control={control}
              name="appValue"
              label="App Value"
              required={!keepExistingSecret}
              kind="password"
              autoComplete="off"
              hint={
                keepExistingSecret
                  ? 'Leave empty to keep the current value.'
                  : 'Hidden while typing; stored encrypted when marked as secret.'
              }
            />
            <AppCheckbox
              control={control}
              name="isSecret"
              label="Secret value"
              hint="Secret values are encrypted and never shown again."
            />
          </div>
        </FormCard>
      )}
    </>
  );
}
