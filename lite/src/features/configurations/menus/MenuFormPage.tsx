import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppInput, AppNumberInput } from '@/components/common/AppInput';
import { AppSelect } from '@/components/common/AppSelect';
import { ErrorState } from '@/components/common/ErrorState';
import { FormCard } from '@/components/common/FormCard';
import { IconSelect } from '@/components/common/IconSelect';
import { PageHeader } from '@/components/common/PageHeader';
import { ROUTES } from '@/config/routes';
import { useEntityFormPage } from '@/hooks/useEntityFormPage';
import { menuHooks } from './menu.api';
import { menuSchema, type MenuFormValues } from './menu.schema';

export default function MenuFormPage() {
  const page = useEntityFormPage(menuHooks, ROUTES.menus);
  const menus = menuHooks.useList();
  const { control, handleSubmit } = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema),
    defaultValues: { menuName: '', menuUrl: '', parentId: '' },
    values: page.entity
      ? {
          menuName: page.entity.menuName,
          menuUrl: page.entity.menuUrl,
          parentId: page.entity.parentId ?? '',
          icon: page.entity.icon,
          displayOrder: page.entity.displayOrder,
        }
      : undefined,
  });

  // Only groups (menus without a URL) can be parents, and never the menu itself.
  const parentOptions = (menus.data ?? [])
    .filter((m) => !m.menuUrl && m.id !== page.id)
    .map((m) => ({ label: m.menuName, value: m.id }));

  return (
    <>
      <PageHeader
        title={page.isEdit ? 'Edit Menu' : 'Add Menu'}
        description="Changes appear in the sidebar as soon as they are saved."
      />
      {page.loadError ? (
        <ErrorState error={page.loadError} />
      ) : (
        <FormCard
          title={page.isEdit ? 'Edit Menu' : 'Add Menu'}
          onSubmit={handleSubmit((values) =>
            page.submit({ ...values, parentId: values.parentId || null }),
          )}
          onBack={page.back}
          saving={page.isSaving}
          loading={page.isLoading}
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-3">
            <AppInput control={control} name="menuName" label="Menu Name" required />
            <AppInput
              control={control}
              name="menuUrl"
              label="Menu URL"
              placeholder="e.g. /configurations/users"
              hint="Leave empty for a group that only holds other menus."
            />
            <AppSelect
              control={control}
              name="parentId"
              label="Parent Menu Name"
              placeholder="Select Parent Menu"
              allowClear
              loading={menus.isLoading}
              options={parentOptions}
            />
            <IconSelect control={control} name="icon" required />
            <AppNumberInput
              control={control}
              name="displayOrder"
              label="Display Order"
              required
              min={1}
              max={999}
              placeholder="Number, e.g. 10"
            />
          </div>
        </FormCard>
      )}
    </>
  );
}
