import { useMemo } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { CrudListPage } from '@/components/common/CrudListPage';
import { IconAvatar } from '@/components/common/IconAvatar';
import { ROUTES } from '@/config/routes';
import { menuHooks, useMenuNames } from './menu.api';
import type { MenuEntity } from './menu.schema';

const nameOf = (row: MenuEntity) => row.menuName;
const searchValues = (row: MenuEntity) => [row.menuName, row.menuUrl, row.icon];

export default function MenuListPage() {
  const menuName = useMenuNames();
  const columns = useMemo<ColumnsType<MenuEntity>>(
    () => [
      {
        title: 'Menu Name',
        dataIndex: 'menuName',
        sorter: (a, b) => a.menuName.localeCompare(b.menuName),
        render: (name: string, row) => (
          <span className="flex items-center gap-2.5">
            <IconAvatar icon={row.icon} size={26} />
            {name}
          </span>
        ),
      },
      {
        title: 'Menu URL',
        dataIndex: 'menuUrl',
        render: (url: string) =>
          url ? (
            <code className="text-[12.5px]">{url}</code>
          ) : (
            <span className="text-fg-muted">Group</span>
          ),
      },
      { title: 'Parent Menu', dataIndex: 'parentId', render: (id: string | null) => menuName(id) },
      {
        title: 'Display Order',
        dataIndex: 'displayOrder',
        sorter: (a, b) => a.displayOrder - b.displayOrder,
        render: (v: number) => <span className="tabular-nums">{v}</span>,
      },
    ],
    [menuName],
  );

  return (
    <CrudListPage
      title="Menus"
      description="The sidebar is built from these entries. Authorization decides which roles see each one."
      entityLabel="Menu"
      listPath={ROUTES.menus}
      hooks={menuHooks}
      columns={columns}
      nameOf={nameOf}
      searchValues={searchValues}
    />
  );
}
