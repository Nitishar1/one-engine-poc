/**
 * Add / Edit User.
 *
 * Functionality:
 * - Domain Name, Time Zone and Allowed Roles are loaded from the API (all rows, every time).
 * - Home URL lists only the pages the checked roles can open: whenever the roles change,
 *   POST /api/menu/byUserRole is called with exactly those role ids. A Home URL the new roles
 *   can't open is cleared. With no role checked, Home URL is disabled.
 * - Edit: every field opens with the saved user's values (GET /api/Users/{id}).
 * - Save sends the OneEngine.Api body (userID 0 = new user, otherwise that user is updated).
 */
import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { AppCheckboxGroup } from '@/components/common/AppCheckbox';
import { AppInput } from '@/components/common/AppInput';
import { AppSelect } from '@/components/common/AppSelect';
import { ErrorState } from '@/components/common/ErrorState';
import { FormCard } from '@/components/common/FormCard';
import { PageHeader } from '@/components/common/PageHeader';

import { ROUTES } from '@/config/routes';
import { useEntityFormPage } from '@/hooks/useEntityFormPage';

import { useHomeUrls, useTimeZones, useUserDomains, userHooks, useUserRoles } from './user.api';
import { userSchema, type AppUser, type UserFormValues } from './user.schema';
import type { EntityInput } from '@/types/common.types';

export default function UserFormPage() {
  const page = useEntityFormPage(userHooks, ROUTES.users);

  const domains = useUserDomains();
  const roles = useUserRoles();
  const timeZones = useTimeZones();

  // Edit: the saved user's values (memoised so the form is filled once, not on every render).
  const values = useMemo<UserFormValues | undefined>(
    () =>
      page.entity
        ? {
            userName: page.entity.userName ?? '',
            domainId: String(page.entity.domainID ?? ''),
            timeZone: String(page.entity.timeZoneID ?? ''),
            homeUrl: page.entity.homeUrl ?? '',
            roleIds: page.entity.roleIds ?? [],
          }
        : undefined,
    [page.entity],
  );

  const { control, handleSubmit, setValue, getValues, formState } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),

    defaultValues: {
      userName: '',
      domainId: '',
      timeZone: '',
      homeUrl: '',
      roleIds: [],
    },

    values,
  });

  // Home URL list follows the checked roles.
  const roleIds = useWatch({ control, name: 'roleIds' });
  const homeUrls = useHomeUrls(roleIds);
  const homeUrlList = useMemo(
    () => (roleIds.length ? (homeUrls.data ?? []) : []),
    [roleIds.length, homeUrls.data],
  );

  // Clears a Home URL that the checked roles can't open (only once their list has loaded).
  const homeUrlsReady = homeUrls.isSuccess && !homeUrls.isPlaceholderData;
  const { isSubmitted } = formState;
  useEffect(() => {
    const current = getValues('homeUrl');
    if (!current) return;
    const stillAllowed = homeUrlList.some((m) => m.menuUrl === current);
    if (!roleIds.length || (homeUrlsReady && !stillAllowed)) {
      setValue('homeUrl', '', { shouldValidate: isSubmitted });
    }
  }, [roleIds.length, homeUrlsReady, homeUrlList, isSubmitted, getValues, setValue]);

  const onSubmit = (values: UserFormValues) => {
    const home = homeUrlList.find((m) => m.menuUrl === values.homeUrl);

    const payload = {
      userID: page.entity?.userID ?? 0,
      userName: values.userName,
      domainID: Number(values.domainId),
      timeZoneID: Number(values.timeZone),
      homeUrl: values.homeUrl,
      homeUrlID: home?.menuID ?? page.entity?.homeUrlID ?? 0,
      allowedRoles: values.roleIds.join(','),
      isActive: page.entity?.isActive ?? true,
    };

    // The API body (userID, domainID, ...) is what POST /api/Users expects.
    page.submit(payload as unknown as EntityInput<AppUser>);
  };

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
          onSubmit={handleSubmit(onSubmit)}
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
              notFoundContent={domains.isError ? 'Could not load domains' : 'No domains found'}
              options={(domains.data ?? []).map((d) => ({
                label: d.domainName,
                value: String(d.domainID),
              }))}
            />

            <AppSelect
              control={control}
              name="timeZone"
              label="Time Zone"
              required
              placeholder="Select Time Zone"
              loading={timeZones.isLoading}
              notFoundContent={
                timeZones.isError ? 'Could not load time zones' : 'No time zones found'
              }
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
              name="homeUrl"
              label="Home URL"
              required
              hint="Pages the checked roles can open."
              placeholder={roleIds.length ? 'Select Home Page' : 'Select roles first'}
              disabled={!roleIds.length}
              loading={homeUrls.isFetching}
              notFoundContent="No pages for the checked roles"
              options={homeUrlList.map((m) => ({
                label: `${m.menuName} (${m.menuUrl})`,
                value: m.menuUrl,
              }))}
            />
          </div>
        </FormCard>
      )}
    </>
  );
}
