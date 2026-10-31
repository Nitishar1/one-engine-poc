import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { AppCard } from '@/components/common/AppCard';
import { AppTable } from '@/components/common/AppTable';
import { AppButton } from '@/components/common/AppButton';
import { IconAvatar } from '@/components/common/IconAvatar';
import { RowActions } from '@/components/common/RowActions';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';
import { ROUTES } from '@/config/routes';
import { formatDateTime } from '@/utils/formatters';
import { ciTypeHooks } from '../hooks/useCiMapping';
import type { CiType } from '../types/ciMapping.types';

export default function CiTypeListPage() {
  const navigate = useNavigate();
  const list = ciTypeHooks.useList();
  const remove = ciTypeHooks.useRemove();
  const confirmDelete = useConfirmDelete();

  const columns = useMemo<ColumnsType<CiType>>(
    () => [
      {
        title: 'CI Type',
        dataIndex: 'name',
        sorter: (a, b) => a.name.localeCompare(b.name),
        width: '34%',
        render: (name: string, row) => (
          <span className="flex items-center gap-3">
            <IconAvatar icon={row.icon} size={28} />
            <button
              type="button"
              className="oe-link"
              onClick={() => navigate(ROUTES.ciTypeEdit(row.id))}
            >
              {name}
            </button>
          </span>
        ),
      },
      {
        title: 'Modified By',
        dataIndex: 'modifiedBy',
        sorter: (a, b) => a.modifiedBy.localeCompare(b.modifiedBy),
        width: '30%',
      },
      {
        title: 'Modified On',
        dataIndex: 'modifiedOn',
        render: (v: string) => <span className="tabular-nums">{formatDateTime(v)}</span>,
        sorter: (a, b) => a.modifiedOn.localeCompare(b.modifiedOn),
        width: '30%',
      },
      {
        title: <span className="sr-only">Actions</span>,
        key: 'actions',
        width: 90,
        align: 'right',
        render: (_, row) => (
          <RowActions
            entityName={row.name}
            onEdit={() => navigate(ROUTES.ciTypeEdit(row.id))}
            onDelete={() => confirmDelete('CI Type', row.name, () => remove.mutateAsync(row.id))}
          />
        ),
      },
    ],
    [navigate, confirmDelete, remove],
  );

  const searchValues = useCallback(
    (r: CiType) => [r.name, r.modifiedBy, formatDateTime(r.modifiedOn)],
    [],
  );

  const addButton = (
    <AppButton icon={<Plus size={15} />} onClick={() => navigate(ROUTES.ciTypeNew)}>
      Add CI Type
    </AppButton>
  );

  return (
    <>
      <PageHeader
        title="CI Types"
        description="Categories used to classify configuration items, such as servers, databases and network devices."
        actions={addButton}
      />
      <AppCard bodyClassName="p-4">
        <AppTable<CiType>
          rowKey="id"
          columns={columns}
          data={list.data}
          loading={list.isLoading}
          error={list.error}
          onRetry={() => void list.refetch()}
          searchValues={searchValues}
          searchPlaceholder="Search CI types…"
          emptyText="No CI types yet"
          emptyDescription="Create a CI type before registering configuration items."
        />
      </AppCard>
    </>
  );
}
