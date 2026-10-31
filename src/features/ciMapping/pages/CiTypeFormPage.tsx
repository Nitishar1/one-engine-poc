import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/components/common/PageHeader';
import { FormCard } from '@/components/common/FormCard';
import { AppInput } from '@/components/common/AppInput';
import { IconSelect } from '@/components/common/IconSelect';
import { ErrorState } from '@/components/common/ErrorState';
import { useEntityFormPage } from '@/hooks/useEntityFormPage';
import { ROUTES } from '@/config/routes';
import { ciTypeHooks } from '../hooks/useCiMapping';
import { ciTypeSchema, type CiTypeFormValues } from '../utils/ciMapping.schemas';

export default function CiTypeFormPage() {
  const page = useEntityFormPage(ciTypeHooks, ROUTES.ciType);
  const { control, handleSubmit } = useForm<CiTypeFormValues>({
    resolver: zodResolver(ciTypeSchema),
    defaultValues: { name: '' },
    values: page.entity ? { name: page.entity.name, icon: page.entity.icon } : undefined,
  });

  return (
    <>
      <PageHeader
        title={page.isEdit ? 'Edit CI type' : 'New CI type'}
        description="CI types group configuration items and set the icon shown across OneEngine."
      />
      {page.loadError ? (
        <ErrorState error={page.loadError} />
      ) : (
        <div className="max-w-3xl">
          <FormCard
            title="Details"
            onSubmit={handleSubmit(page.submit)}
            onBack={page.back}
            saving={page.isSaving}
            loading={page.isLoading}
            submitLabel={page.isEdit ? 'Save changes' : 'Create CI type'}
          >
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              <AppInput
                control={control}
                name="name"
                label="CI Type"
                required
                placeholder="e.g. DB Server"
              />
              <IconSelect control={control} name="icon" required />
            </div>
          </FormCard>
        </div>
      )}
    </>
  );
}
