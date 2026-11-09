import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppCheckboxGroup } from '@/components/common/AppCheckbox';
import { AppInput } from '@/components/common/AppInput';
import { AppSelect } from '@/components/common/AppSelect';
import { ErrorState } from '@/components/common/ErrorState';
import { FormCard } from '@/components/common/FormCard';
import { PageHeader } from '@/components/common/PageHeader';
import { ROUTES } from '@/config/routes';
import { useEntityFormPage } from '@/hooks/useEntityFormPage';
import { domainHooks } from '../domains/domain.api';
import { menuHooks } from '../menus/menu.api';
import { roleHooks } from '../roles/role.api';
import { useTimeZones, userHooks } from './user.api';
import { userSchema, type UserFormValues } from './user.schema';

export default function UserFormPage() {
  const page = useEntityFormPage(userHooks, ROUTES.users);
  const domains = domainHooks.useList();
  const roles = roleHooks.useList();
  const menus = menuHooks.useList();
  const timeZones = useTimeZones();

  const { control, handleSubmit } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { userName: '', domainId: '', timeZone: '', homeUrl: '', roleIds: [] },
    values: page.entity
      ? {
          userName: page.entity.userName,
          domainId: page.entity.domainId,
          timeZone: page.entity.timeZone,
          homeUrl: page.entity.homeUrl,
          roleIds: page.entity.roleIds,
        }
      : undefined,
  });

  return (
    <>
      <PageHeader
        title={page.isEdit ? 'Edit User' : 'Add User'}
        description="The user signs in with this name on the selected domain."
      />
      {page.loadError ? (
        <ErrorState error={page.loadError} />
      ) : (
        <FormCard
          title={page.isEdit ? 'Edit User' : 'Add User'}
          onSubmit={handleSubmit(page.submit)}
          onBack={page.back}
          saving={page.isSaving}
          loading={page.isLoading}
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-[1fr_1fr_1fr_220px]">
            <AppInput control={control} name="userName" label="User Name" required />
            <AppSelect
              control={control}
              name="domainId"
              label="Domain Name"
              required
              placeholder="Select Domain"
              loading={domains.isLoading}
              options={(domains.data ?? []).map((d) => ({ label: d.domainName, value: d.id }))}
            />
            <AppSelect
              control={control}
              name="timeZone"
              label="Time Zone"
              required
              placeholder="Select Time Zone"
              loading={timeZones.isLoading}
              options={(timeZones.data ?? []).map((tz) => ({ label: tz, value: tz }))}
            />
            <AppCheckboxGroup
              control={control}
              name="roleIds"
              label="Allowed Roles"
              required
              className="lg:row-span-2"
              options={(roles.data ?? []).map((r) => ({ label: r.roleName, value: r.id }))}
            />
            <AppSelect
              control={control}
              name="homeUrl"
              label="Home URL"
              required
              placeholder="Select Home Page"
              loading={menus.isLoading}
              options={(menus.data ?? [])
                .filter((m) => m.menuUrl)
                .map((m) => ({ label: `${m.menuName} (${m.menuUrl})`, value: m.menuUrl }))}
            />
          </div>
        </FormCard>
      )}
    </>
  );
}
