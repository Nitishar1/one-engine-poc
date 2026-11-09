import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppCheckbox } from '@/components/common/AppCheckbox';
import { AppInput } from '@/components/common/AppInput';
import { AppSelect } from '@/components/common/AppSelect';
import { ErrorState } from '@/components/common/ErrorState';
import { FormCard } from '@/components/common/FormCard';
import { PageHeader } from '@/components/common/PageHeader';
import { ROUTES } from '@/config/routes';
import { useEntityFormPage } from '@/hooks/useEntityFormPage';
import { roleHooks } from './role.api';
import { roleSchema, type RoleFormValues } from './role.schema';

export default function RoleFormPage() {
  const page = useEntityFormPage(roleHooks, ROUTES.roles);
  const roles = roleHooks.useList();
  const { control, handleSubmit } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: { roleName: '', description: '', parentRoleId: '', isAdmin: false },
    values: page.entity
      ? {
          roleName: page.entity.roleName,
          description: page.entity.description,
          parentRoleId: page.entity.parentRoleId ?? '',
          isAdmin: page.entity.isAdmin,
        }
      : undefined,
  });

  // A role cannot be its own parent.
  const parentOptions = (roles.data ?? [])
    .filter((r) => r.id !== page.id)
    .map((r) => ({ label: r.roleName, value: r.id }));

  return (
    <>
      <PageHeader
        title={page.isEdit ? 'Edit Role' : 'Add Role'}
        description="A child role inherits the pages of its parent role."
      />
      {page.loadError ? (
        <ErrorState error={page.loadError} />
      ) : (
        <FormCard
          title={page.isEdit ? 'Edit Role' : 'Add Role'}
          onSubmit={handleSubmit((values) =>
            page.submit({ ...values, parentRoleId: values.parentRoleId || null }),
          )}
          onBack={page.back}
          saving={page.isSaving}
          loading={page.isLoading}
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-3">
            <AppInput control={control} name="roleName" label="Role Name" required />
            <AppInput
              control={control}
              name="description"
              label="Role Description"
              required
              placeholder="Maximum of 1000 characters"
            />
            <AppSelect
              control={control}
              name="parentRoleId"
              label="Parent Role Name"
              placeholder="Select Parent Role"
              allowClear
              loading={roles.isLoading}
              options={parentOptions}
            />
            <AppCheckbox control={control} name="isAdmin" label="Is Admin" />
          </div>
        </FormCard>
      )}
    </>
  );
}
