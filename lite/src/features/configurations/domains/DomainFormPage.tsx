import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppCheckbox } from '@/components/common/AppCheckbox';
import { AppInput } from '@/components/common/AppInput';
import { ErrorState } from '@/components/common/ErrorState';
import { FormCard } from '@/components/common/FormCard';
import { PageHeader } from '@/components/common/PageHeader';
import { ROUTES } from '@/config/routes';
import { useEntityFormPage } from '@/hooks/useEntityFormPage';
import { domainHooks } from './domain.api';
import { domainSchema, type DomainFormValues } from './domain.schema';

export default function DomainFormPage() {
  const page = useEntityFormPage(domainHooks, ROUTES.domains);
  const { control, handleSubmit } = useForm<DomainFormValues>({
    resolver: zodResolver(domainSchema),
    defaultValues: { domainName: '', domainPath: '', distinguishedName: '', isAdDomain: false },
    values: page.entity
      ? {
          domainName: page.entity.domainName,
          domainPath: page.entity.domainPath,
          distinguishedName: page.entity.distinguishedName,
          isAdDomain: page.entity.isAdDomain,
        }
      : undefined,
  });

  return (
    <>
      <PageHeader
        title={page.isEdit ? 'Edit Domain' : 'Add Domain'}
        description="Users pick their domain on the sign-in page."
      />
      {page.loadError ? (
        <ErrorState error={page.loadError} />
      ) : (
        <FormCard
          title={page.isEdit ? 'Edit Domain' : 'Add Domain'}
          onSubmit={handleSubmit(page.submit)}
          onBack={page.back}
          saving={page.isSaving}
          loading={page.isLoading}
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-3">
            <AppInput control={control} name="domainName" label="Domain Name" required />
            <AppInput
              control={control}
              name="domainPath"
              label="Domain Path"
              required
              placeholder="e.g. corp.example.com"
            />
            <AppInput
              control={control}
              name="distinguishedName"
              label="Distinguished Name"
              required
              placeholder="e.g. DC=corp,DC=example,DC=com"
            />
            <AppCheckbox control={control} name="isAdDomain" label="AD Domain" />
          </div>
        </FormCard>
      )}
    </>
  );
}
