import { useMemo } from 'react';
import { Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CrudListPage } from '@/components/common/CrudListPage';
import { ROUTES } from '@/config/routes';
import { roleHooks, useRoleNames } from './role.api';
import type { Role } from './role.schema';

const nameOf = (row: Role) => row.roleName;
const searchValues = (row: Role) => [row.roleName, row.description, row.modifiedBy];

export default function RoleListPage() {
  const roleName = useRoleNames();
  const columns = useMemo<ColumnsType<Role>>(
    () => [
      {
        title: 'Role Name',
        dataIndex: 'roleName',
        sorter: (a, b) => a.roleName.localeCompare(b.roleName),
        render: (name: string, row) => (
          <span className="flex items-center gap-2">
            {name}
            {row.isAdmin && <Tag color="blue">Admin</Tag>}
          </span>
        ),
      },
      { title: 'Role Description', dataIndex: 'description', ellipsis: true },
      {
        title: 'Parent Role Name',
        dataIndex: 'parentRoleId',
        render: (id: string | null) => roleName(id),
      },
    ],
    [roleName],
  );

  return (
    <CrudListPage
      title="Roles"
      description="Roles group users; Authorization decides which pages each role can open."
      entityLabel="Role"
      listPath={ROUTES.roles}
      hooks={roleHooks}
      columns={columns}
      nameOf={nameOf}
      searchValues={searchValues}
    />
  );
}
