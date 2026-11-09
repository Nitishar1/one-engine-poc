import { Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CrudListPage } from '@/components/common/CrudListPage';
import { ROUTES } from '@/config/routes';
import { dataSourceHooks } from './dataSource.api';
import type { DataSource } from './dataSource.schema';

const COLUMNS: ColumnsType<DataSource> = [
  {
    title: 'DataSource Name',
    dataIndex: 'dataSourceName',
    sorter: (a, b) => a.dataSourceName.localeCompare(b.dataSourceName),
  },
  {
    title: 'DataSource Type',
    dataIndex: 'dataSourceType',
    render: (type: string) => <Tag color="blue">{type}</Tag>,
  },
];

const nameOf = (row: DataSource) => row.dataSourceName;
const searchValues = (row: DataSource) => [row.dataSourceName, row.dataSourceType];

export default function DataSourceListPage() {
  return (
    <CrudListPage
      title="Data Sources"
      description="Databases that reports read from. Connection strings are stored encrypted and never shown."
      entityLabel="DataSource"
      listPath={ROUTES.dataSources}
      hooks={dataSourceHooks}
      columns={COLUMNS}
      nameOf={nameOf}
      searchValues={searchValues}
    />
  );
}
