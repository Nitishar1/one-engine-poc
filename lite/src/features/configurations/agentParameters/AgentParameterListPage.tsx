import { useState } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CrudListPage } from '@/components/common/CrudListPage';
import { DetailsDrawer } from '@/components/common/DetailsDrawer';
import { ROUTES } from '@/config/routes';
import { formatDateTime } from '@/utils/formatters';
import { agentParameterHooks } from './agentParameter.api';
import type { AgentParameterGroup } from './agentParameter.schema';

const COLUMNS: ColumnsType<AgentParameterGroup> = [
  {
    title: 'Group Name',
    dataIndex: 'groupName',
    sorter: (a, b) => a.groupName.localeCompare(b.groupName),
  },
  { title: 'Description', dataIndex: 'description', ellipsis: true },
  {
    title: 'Parameters',
    key: 'parameters',
    render: (_, row) => <span className="tabular-nums">{row.parameters.length}</span>,
  },
];

const nameOf = (row: AgentParameterGroup) => row.groupName;
const searchValues = (row: AgentParameterGroup) => [row.groupName, row.description, row.modifiedBy];

export default function AgentParameterListPage() {
  const [viewing, setViewing] = useState<AgentParameterGroup>();

  return (
    <CrudListPage
      title="Agent Parameters"
      description="Named groups of parameters that agents receive when they run."
      entityLabel="Parameter Group"
      listPath={ROUTES.agentParameters}
      hooks={agentParameterHooks}
      columns={COLUMNS}
      nameOf={nameOf}
      searchValues={searchValues}
      onView={setViewing}
    >
      <DetailsDrawer
        title={viewing?.groupName ?? ''}
        open={Boolean(viewing)}
        onClose={() => setViewing(undefined)}
        items={[
          { label: 'Description', value: viewing?.description || '-' },
          { label: 'Modified By', value: viewing?.modifiedBy },
          { label: 'Modified On', value: formatDateTime(viewing?.modifiedOn) },
        ]}
      >
        <Table
          size="small"
          rowKey="name"
          pagination={false}
          dataSource={viewing?.parameters}
          columns={[
            { title: 'Parameter', dataIndex: 'name' },
            { title: 'Value', dataIndex: 'value' },
          ]}
        />
      </DetailsDrawer>
    </CrudListPage>
  );
}
