import { useMemo } from 'react';
import { Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CrudListPage } from '@/components/common/CrudListPage';
import { ROUTES } from '@/config/routes';
import { domainHooks } from '../domains/domain.api';
import { useRoleNames } from '../roles/role.api';
import { userHooks } from './user.api';
import type { AppUser } from './user.schema';

const nameOf = (row: AppUser) => row.userName;
const searchValues = (row: AppUser) => [row.userName, row.timeZone, row.modifiedBy];

export default function UserListPage() {
  const domains = domainHooks.useList();
  const roleName = useRoleNames();
  const columns = useMemo<ColumnsType<AppUser>>(() => {
    const domainName = new Map((domains.data ?? []).map((d) => [d.id, d.domainName]));
    return [
      {
        title: 'User Name',
        dataIndex: 'userName',
        sorter: (a, b) => a.userName.localeCompare(b.userName),
      },
      {
        title: 'Domain Name',
        dataIndex: 'domainId',
        render: (id: string) => domainName.get(id) ?? '-',
      },
      { title: 'Time Zone', dataIndex: 'timeZone', ellipsis: true },
      {
        title: 'Roles',
        dataIndex: 'roleIds',
        render: (ids: string[]) => (
          <span className="flex flex-wrap gap-1">
            {ids.map((id) => (
              <Tag key={id}>{roleName(id)}</Tag>
            ))}
          </span>
        ),
      },
    ];
  }, [domains.data, roleName]);

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
