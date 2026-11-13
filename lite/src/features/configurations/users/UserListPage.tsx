/**
 * Users grid.
 *
 * Functionality:
 * - Lists every user from GET /api/Users with search, sort, and Add / Edit / Delete buttons
 *   (Delete calls DELETE /api/Users/{id} after a confirmation).
 * - Domain, time zone and role names come from the user row; when the API leaves a name out,
 *   it is looked up by id in the domain / time zone / role lists.
 * - Modified By / Modified On columns are added by CrudListPage.
 */
import { useMemo } from 'react';
import { Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CrudListPage } from '@/components/common/CrudListPage';
import { ROUTES } from '@/config/routes';
import { useTimeZones, useUserDomains, userHooks, useUserRoles } from './user.api';
import type { AppUser } from './user.schema';

const nameOf = (row: AppUser) => row.userName;

export default function UserListPage() {
  const domains = useUserDomains();
  const timeZones = useTimeZones();
  const roles = useUserRoles();

  // id -> name, for rows that only carry ids.
  const names = useMemo(
    () => ({
      domain: new Map((domains.data ?? []).map((d) => [String(d.domainID), d.domainName])),
      timeZone: new Map((timeZones.data ?? []).map((t) => [String(t.timezoneID), t.timezoneName])),
      role: new Map((roles.data ?? []).map((r) => [String(r.roleID), r.roleName])),
    }),
    [domains.data, timeZones.data, roles.data],
  );

  const domainName = (row: AppUser) =>
    row.domainName || names.domain.get(String(row.domainID)) || '-';
  const timeZoneName = (row: AppUser) =>
    row.timeZoneName || names.timeZone.get(String(row.timeZoneID)) || '-';

  const searchValues = (row: AppUser) => [
    row.userName,
    domainName(row),
    timeZoneName(row),
    row.homeUrl,
    row.modifiedBy,
  ];

  const columns: ColumnsType<AppUser> = [
    {
      title: 'User Name',
      dataIndex: 'userName',
      sorter: (a, b) => a.userName.localeCompare(b.userName),
    },
    {
      title: 'Domain Name',
      dataIndex: 'domainName',
      render: (_, row) => domainName(row),
    },
    {
      title: 'Time Zone',
      dataIndex: 'timeZoneName',
      width: 220,
      ellipsis: { showTitle: true },
      render: (_, row) => timeZoneName(row),
    },
    {
      title: 'Allowed Roles',
      dataIndex: 'roleIds',
      render: (ids: string[] = []) => (
        <span className="flex flex-wrap gap-1">
          {ids.map((id) => (
            <Tag key={id}>{names.role.get(id) ?? id}</Tag>
          ))}
        </span>
      ),
    },
    { title: 'Home URL', dataIndex: 'homeUrl', ellipsis: true },
  ];

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
