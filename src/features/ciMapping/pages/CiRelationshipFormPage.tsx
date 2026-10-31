import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/components/common/PageHeader';
import { FormCard } from '@/components/common/FormCard';
import { AppInput } from '@/components/common/AppInput';
import { AppSelect } from '@/components/common/AppSelect';
import { ErrorState } from '@/components/common/ErrorState';
import { useEntityFormPage } from '@/hooks/useEntityFormPage';
import { ROUTES } from '@/config/routes';
import { ciRelationshipHooks } from '../hooks/useCiMapping';
import { useCiLookups } from '../hooks/useCiLookups';
import {
  CI_RELATIONSHIP_TYPES,
  ciRelationshipSchema,
  type CiRelationshipFormValues,
} from '../utils/ciMapping.schemas';

export default function CiRelationshipFormPage() {
  const page = useEntityFormPage(ciRelationshipHooks, ROUTES.ciRelationship);
  const { masters } = useCiLookups();
  const e = page.entity;
  const ciOptions = masters.map((m) => ({ label: `${m.name} (${m.ipAddress})`, value: m.id }));

  const { control, handleSubmit } = useForm<CiRelationshipFormValues>({
    resolver: zodResolver(ciRelationshipSchema),
    defaultValues: { sourceCiId: '', targetCiId: '', description: '' },
    values: e
      ? {
          sourceCiId: e.sourceCiId,
          targetCiId: e.targetCiId,
          relationshipType: e.relationshipType,
          description: e.description,
        }
      : undefined,
  });

  return (
    <>
      <PageHeader
        title={page.isEdit ? 'Edit CI relationship' : 'New CI relationship'}
        description="Describe how one configuration item relates to another, for example “App server Runs On VM host”."
      />
      {page.loadError ? (
        <ErrorState error={page.loadError} />
      ) : (
        <FormCard
          title="Relationship"
          description="Read as: Source CI → Relationship → Target CI. Fields marked * are required."
          submitLabel={page.isEdit ? 'Save changes' : 'Create relationship'}
          onSubmit={handleSubmit(page.submit)}
          onBack={page.back}
          saving={page.isSaving}
          loading={page.isLoading}
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-3">
            <AppSelect
              control={control}
              name="sourceCiId"
              label="Source CI"
              required
              placeholder="Select Source CI"
              options={ciOptions}
            />
            <AppSelect
              control={control}
              name="relationshipType"
              label="Relationship"
              required
              placeholder="Select Relationship"
              options={CI_RELATIONSHIP_TYPES.map((v) => ({ label: v, value: v }))}
            />
            <AppSelect
              control={control}
              name="targetCiId"
              label="Target CI"
              required
              placeholder="Select Target CI"
              options={ciOptions}
            />
            <AppInput
              control={control}
              name="description"
              label="Description"
              kind="textarea"
              rows={3}
              className="md:col-span-3"
              placeholder="Describe the relationship"
            />
          </div>
        </FormCard>
      )}
    </>
  );
}
