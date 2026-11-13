import { useMemo } from 'react';
import { Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CrudListPage } from '@/components/common/CrudListPage';
import { StatusTag } from '@/components/common/StatusTag';
import { ROUTES } from '@/config/routes';
import { useTimeZones, useUserDomains, userHooks, useUserRoles } from './user.api';
import type { AppUser } from './user.schema';

const nameOf = (row: AppUser) => row.userName;

export default function UserListPage() {
  const domains = useUserDomains();
  const roles = useUserRoles();
  const timeZones = useTimeZones();

  // id -> name lookups (role tokens may already be names; those are shown as they are).
  const names = useMemo(
    () => ({
      domain: new Map((domains.data ?? []).map((d) => [String(d.domainID), d.domainName])),
      timeZone: new Map((timeZones.data ?? []).map((t) => [String(t.timezoneID), t.timezoneName])),
      role: new Map((roles.data ?? []).map((r) => [String(r.roleID), r.roleName])),
    }),
    [domains.data, timeZones.data, roles.data],
  );

  const columns = useMemo<ColumnsType<AppUser>>(
    () => [
      {
        title: 'User Name',
        dataIndex: 'userName',
        sorter: (a, b) => a.userName.localeCompare(b.userName),
      },
      {
        title: 'Domain Name',
        dataIndex: 'domainId',
        render: (id: string) => names.domain.get(id) ?? '-',
      },
      {
        title: 'Time Zone',
        dataIndex: 'timeZoneId',
        width: 220,
        ellipsis: { showTitle: true },
        render: (id: string) => names.timeZone.get(id) ?? '-',
      },
      {
        title: 'Roles',
        dataIndex: 'roleIds',
        render: (ids: string[]) => (
          <span className="flex flex-wrap gap-1">
            {ids.map((id) => (
              <Tag key={id}>{names.role.get(id) ?? id}</Tag>
            ))}
          </span>
        ),
      },
      { title: 'Home URL', dataIndex: 'homeUrl', ellipsis: true },
      {
        title: 'Status',
        dataIndex: 'isActive',
        render: (active: boolean) => <StatusTag status={active ? 'Active' : 'Inactive'} />,
      },
    ],
    [names],
  );

  const searchValues = useMemo(
    () => (row: AppUser) => [
      row.userName,
      row.homeUrl,
      row.modifiedBy,
      names.domain.get(row.domainId),
      names.timeZone.get(row.timeZoneId),
      ...row.roleIds.map((id) => names.role.get(id) ?? id),
    ],
    [names],
  );

  return (
    <CrudListPage
      title="Users"
      description="People who can sign in to OneEngine, their domain, time zone and roles."
      entityLabel="User"
      listPath={ROUTES.users}
      hooks={userHooks}
      columns={columns}
      nameOf={nameOf}
      searchValues={searchValues}
    />
  );
}
