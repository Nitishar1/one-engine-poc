import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { AppCard } from '@/components/common/AppCard';
import { AppTable } from '@/components/common/AppTable';
import { AppButton } from '@/components/common/AppButton';
import { RowActions } from '@/components/common/RowActions';
import { StatusTag } from '@/components/common/StatusTag';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';
import { ROUTES } from '@/config/routes';
import { formatDateTime } from '@/utils/formatters';
import { ciMasterHooks } from '../hooks/useCiMapping';
import { useCiLookups } from '../hooks/useCiLookups';
import type { CiMaster } from '../types/ciMapping.types';

const text = (key: keyof CiMaster) => (a: CiMaster, b: CiMaster) =>
  String(a[key]).localeCompare(String(b[key]));

export default function CiMasterListPage() {
  const navigate = useNavigate();
  const list = ciMasterHooks.useList();
  const remove = ciMasterHooks.useRemove();
  const confirmDelete = useConfirmDelete();
  const { typeName } = useCiLookups();

  const columns = useMemo<ColumnsType<CiMaster>>(
    () => [
      {
        title: 'CI Name',
        dataIndex: 'name',
        sorter: text('name'),
        render: (name: string, row) => (
          <button
            type="button"
            className="oe-link"
            onClick={() => navigate(ROUTES.ciMasterEdit(row.id))}
          >
            {name}
          </button>
        ),
      },
      {
        title: 'CI Type',
        dataIndex: 'ciTypeId',
        render: typeName,
        sorter: (a, b) => typeName(a.ciTypeId).localeCompare(typeName(b.ciTypeId)),
      },
      { title: 'Host Name', dataIndex: 'hostName', sorter: text('hostName') },
      {
        title: 'IP Address',
        dataIndex: 'ipAddress',
        sorter: text('ipAddress'),
        render: (ip: string) => <span className="font-mono text-[12.5px]">{ip}</span>,
      },
      { title: 'Operating System', dataIndex: 'operatingSystem', sorter: text('operatingSystem') },
      { title: 'Environment', dataIndex: 'environment', sorter: text('environment') },
      {
        title: 'Status',
        dataIndex: 'status',
        render: (s: string) => <StatusTag status={s} />,
        sorter: text('status'),
      },
      {
        title: 'Modified On',
        dataIndex: 'modifiedOn',
        render: (v: string) => <span className="tabular-nums">{formatDateTime(v)}</span>,
        sorter: text('modifiedOn'),
      },
      {
        title: <span className="sr-only">Actions</span>,
        key: 'actions',
        width: 90,
        align: 'right',
        fixed: 'right',
        render: (_, row) => (
          <RowActions
            entityName={row.name}
            onEdit={() => navigate(ROUTES.ciMasterEdit(row.id))}
            onDelete={() =>
              confirmDelete('Configuration Item', row.name, () => remove.mutateAsync(row.id))
            }
          />
        ),
      },
    ],
    [navigate, confirmDelete, remove, typeName],
  );

  const searchValues = useCallback(
    (r: CiMaster) => [
      r.name,
      typeName(r.ciTypeId),
      r.hostName,
      r.ipAddress,
      r.operatingSystem,
      r.environment,
      r.status,
    ],
    [typeName],
  );

  return (
    <>
      <PageHeader
        title="CI Master"
        description="Inventory of configuration items: hosts, addresses, environments and their current status."
        actions={
          <AppButton icon={<Plus size={15} />} onClick={() => navigate(ROUTES.ciMasterNew)}>
            Add CI
          </AppButton>
        }
      />
      <AppCard bodyClassName="p-4">
        <AppTable<CiMaster>
          rowKey="id"
          columns={columns}
          data={list.data}
          loading={list.isLoading}
          error={list.error}
          onRetry={() => void list.refetch()}
          searchValues={searchValues}
          searchPlaceholder="Search by name, host, IP or status…"
          emptyText="No configuration items yet"
          emptyDescription="Register the hosts and services that runbooks will act on."
        />
      </AppCard>
    </>
  );
}
