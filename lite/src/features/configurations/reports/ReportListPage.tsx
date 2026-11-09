import { useMemo } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { CrudListPage } from '@/components/common/CrudListPage';
import { IconAvatar } from '@/components/common/IconAvatar';
import { ROUTES } from '@/config/routes';
import { dataSourceHooks } from '../dataSources/dataSource.api';
import { useMenuNames } from '../menus/menu.api';
import { reportHooks } from './report.api';
import type { Report } from './report.schema';

const nameOf = (row: Report) => row.reportName;
const searchValues = (row: Report) => [row.reportName, row.modifiedBy];

export default function ReportListPage() {
  const menuName = useMenuNames();
  const dataSources = dataSourceHooks.useList();
  const columns = useMemo<ColumnsType<Report>>(() => {
    const dataSourceName = new Map((dataSources.data ?? []).map((d) => [d.id, d.dataSourceName]));
    return [
      {
        title: 'Report Name',
        dataIndex: 'reportName',
        sorter: (a, b) => a.reportName.localeCompare(b.reportName),
        render: (name: string, row) => (
          <span className="flex items-center gap-2.5">
            <IconAvatar icon={row.icon} size={26} />
            {name}
          </span>
        ),
      },
      {
        title: 'DataSource',
        dataIndex: 'dataSourceId',
        render: (id: string) => dataSourceName.get(id) ?? '-',
      },
      { title: 'Parent Menu', dataIndex: 'parentMenuId', render: (id: string) => menuName(id) },
    ];
  }, [dataSources.data, menuName]);

  return (
    <CrudListPage
      title="Report Designer"
      description="Reports run a read-only query against a data source and are grouped under a parent menu."
      entityLabel="Report"
      listPath={ROUTES.reports}
      hooks={reportHooks}
      columns={columns}
      nameOf={nameOf}
      searchValues={searchValues}
    />
  );
}
