import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button } from 'antd';
import { AppCheckbox, AppCheckboxGroup } from '@/components/common/AppCheckbox';
import { AppInput } from '@/components/common/AppInput';
import { AppSelect } from '@/components/common/AppSelect';
import { ErrorState } from '@/components/common/ErrorState';
import { FormCard } from '@/components/common/FormCard';
import { PageHeader } from '@/components/common/PageHeader';
import { ROUTES } from '@/config/routes';
import { useEntityFormPage } from '@/hooks/useEntityFormPage';
import { useHomeUrls, useTimeZones, useUserDomains, userHooks, useUserRoles } from './user.api';
import { userSchema, type AppUser, type RoleOption, type UserFormValues } from './user.schema';

const EMPTY: UserFormValues = {
  userName: '',
  domainId: '',
  timeZoneId: '',
  roleIds: [],
  homeUrlId: '',
  isActive: true,
};

/** Role ids of a user; `allowedRoles` may hold ids or role names, both are accepted. */
function resolveRoleIds(user: AppUser, roles: RoleOption[]): string[] {
  const ids = user.roleIds.map((token) => {
    const role = roles.find(
      (r) => String(r.roleID) === token || r.roleName.toLowerCase() === token.toLowerCase(),
    );
    return role ? String(role.roleID) : token;
  });
  return [...new Set(ids)];
}

export default function UserFormPage() {
  const page = useEntityFormPage(userHooks, ROUTES.users);
  const domains = useUserDomains();
  const roles = useUserRoles();
  const timeZones = useTimeZones();

  // Edit: the form opens with the user's saved values (once roles are known, so the
  // role checkboxes can be matched).
  const values = useMemo<UserFormValues | undefined>(
    () =>
      page.entity && roles.data
        ? {
            userName: page.entity.userName,
            domainId: page.entity.domainId,
            timeZoneId: page.entity.timeZoneId,
            roleIds: resolveRoleIds(page.entity, roles.data),
            homeUrlId: page.entity.homeUrlId,
            isActive: page.entity.isActive,
          }
        : undefined,
    [page.entity, roles.data],
  );

  const { control, handleSubmit, setValue, getValues, formState } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: EMPTY,
    values,
  });

  // Home URL list follows the checked roles: POST /menu/byUserRole with those role ids.
  const roleIds = useWatch({ control, name: 'roleIds' });
  const homeUrls = useHomeUrls(roleIds);
  const homeUrlList = useMemo(
    () => (roleIds.length ? (homeUrls.data ?? []) : []),
    [roleIds.length, homeUrls.data],
  );

  // When the roles change, a Home URL those roles can't open is cleared. A saved user whose
  // home URL id is missing gets it matched by URL.
  const homeUrlsReady = homeUrls.isSuccess && !homeUrls.isPlaceholderData;
  const savedHomeUrl = page.entity?.homeUrl ?? '';
  const { isSubmitted } = formState;
  useEffect(() => {
    const current = getValues('homeUrlId');
    if (!roleIds.length) {
      if (current) setValue('homeUrlId', '', { shouldValidate: isSubmitted });
      return;
    }
    if (!homeUrlsReady) return;
    if (current && homeUrlList.some((m) => String(m.menuID) === current)) return;
    const saved = savedHomeUrl
      ? homeUrlList.find((m) => m.menuUrl.toLowerCase() === savedHomeUrl.toLowerCase())
      : undefined;
    const next = saved ? String(saved.menuID) : '';
    if (next !== current) setValue('homeUrlId', next, { shouldValidate: isSubmitted });
  }, [roleIds.length, homeUrlsReady, homeUrlList, savedHomeUrl, isSubmitted, getValues, setValue]);

  const onSubmit = (form: UserFormValues) => {
    const home = homeUrlList.find((m) => String(m.menuID) === form.homeUrlId);
    page.submit({ ...form, homeUrl: home?.menuUrl ?? savedHomeUrl });
  };

  const failedLists = [
    domains.isError && 'domains',
    roles.isError && 'roles',
    timeZones.isError && 'time zones',
    homeUrls.isError && 'home URLs',
  ].filter(Boolean);
  const retryLists = () => {
    if (domains.isError) void domains.refetch();
    if (roles.isError) void roles.refetch();
    if (timeZones.isError) void timeZones.refetch();
    if (homeUrls.isError) void homeUrls.refetch();
  };

  const title = page.isEdit ? 'Edit User' : 'Add User';

  return (
    <>
      <PageHeader
        title={title}
        description="The user signs in with this name on the selected domain."
      />
      {page.loadError ? (
        <ErrorState error={page.loadError} />
      ) : (
        <FormCard
          title={title}
          onSubmit={handleSubmit(onSubmit)}
          onBack={page.back}
          saving={page.isSaving}
          loading={page.isLoading || (page.isEdit && roles.isLoading)}
        >
          {failedLists.length > 0 && (
            <Alert
              type="error"
              showIcon
              className="!mb-5"
              title={`Could not load ${failedLists.join(', ')}.`}
              action={
                <Button size="small" onClick={retryLists}>
                  Retry
                </Button>
              }
            />
          )}
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-[1fr_1fr_1fr_240px]">
            <AppInput control={control} name="userName" label="User Name" required />
            <AppSelect
              control={control}
              name="domainId"
              label="Domain Name"
              required
              placeholder="Select Domain"
              loading={domains.isLoading}
              notFoundContent="No domains found"
              options={(domains.data ?? []).map((d) => ({
                label: d.domainName,
                value: String(d.domainID),
              }))}
            />
            <AppSelect
              control={control}
              name="timeZoneId"
              label="Time Zone"
              required
              placeholder="Select Time Zone"
              loading={timeZones.isLoading}
              notFoundContent="No time zones found"
              options={(timeZones.data ?? []).map((tz) => ({
                label: tz.timezoneName,
                value: String(tz.timezoneID),
              }))}
            />
            <AppCheckboxGroup
              control={control}
              name="roleIds"
              label="Allowed Roles"
              required
              className="lg:row-span-2"
              options={(roles.data ?? []).map((r) => ({
                label: r.roleName,
                value: String(r.roleID),
              }))}
            />
            <AppSelect
              control={control}
              name="homeUrlId"
              label="Home URL"
              required
              hint="Pages the selected roles can open."
              placeholder={roleIds.length ? 'Select Home Page' : 'Select roles first'}
              disabled={!roleIds.length}
              loading={homeUrls.isFetching}
              notFoundContent="No pages for the selected roles"
              options={homeUrlList.map((m) => ({
                label: `${m.menuName} (${m.menuUrl})`,
                value: String(m.menuID),
              }))}
            />
            <AppCheckbox
              control={control}
              name="isActive"
              label="Active"
              hint="Inactive users cannot sign in."
              className="lg:self-end lg:pb-2"
            />
          </div>
        </FormCard>
      )}
    </>
  );
}
