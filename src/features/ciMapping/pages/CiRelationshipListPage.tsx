import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Segmented } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ArrowRight, Network, Plus, Rows3 } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { AppCard } from '@/components/common/AppCard';
import { AppTable } from '@/components/common/AppTable';
import { AppButton } from '@/components/common/AppButton';
import { RowActions } from '@/components/common/RowActions';
import { LoadingState } from '@/components/common/LoadingState';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';
import { ROUTES } from '@/config/routes';
import { formatDateTime } from '@/utils/formatters';
import { ciRelationshipHooks } from '../hooks/useCiMapping';
import { useCiLookups } from '../hooks/useCiLookups';
import { CiRelationshipGraph } from '../components/CiRelationshipGraph';
import type { CiRelationship } from '../types/ciMapping.types';

type View = 'table' | 'graph';

export default function CiRelationshipListPage() {
  const navigate = useNavigate();
  const list = ciRelationshipHooks.useList();
  const remove = ciRelationshipHooks.useRemove();
  const confirmDelete = useConfirmDelete();
  const lookups = useCiLookups();
  const { ciName } = lookups;
  const [view, setView] = useState<View>('table');

  const columns = useMemo<ColumnsType<CiRelationship>>(
    () => [
      {
        title: 'Source CI',
        dataIndex: 'sourceCiId',
        render: (id: string) => <span className="font-medium text-fg">{ciName(id)}</span>,
        sorter: (a, b) => ciName(a.sourceCiId).localeCompare(ciName(b.sourceCiId)),
      },
      {
        title: 'Relationship',
        dataIndex: 'relationshipType',
        render: (type: string) => (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-line bg-surface-alt px-2 py-0.5 text-[12px] font-medium text-fg-secondary">
            {type}
            <ArrowRight size={12} className="text-fg-muted" />
          </span>
        ),
        sorter: (a, b) => a.relationshipType.localeCompare(b.relationshipType),
      },
      {
        title: 'Target CI',
        dataIndex: 'targetCiId',
        render: (id: string) => <span className="font-medium text-fg">{ciName(id)}</span>,
        sorter: (a, b) => ciName(a.targetCiId).localeCompare(ciName(b.targetCiId)),
      },
      {
        title: 'Description',
        dataIndex: 'description',
        render: (d: string) => (
          <span className="line-clamp-2 max-w-[320px]" title={d}>
            {d || '—'}
          </span>
        ),
      },
      {
        title: 'Modified By',
        dataIndex: 'modifiedBy',
        sorter: (a, b) => a.modifiedBy.localeCompare(b.modifiedBy),
      },
      {
        title: 'Modified On',
        dataIndex: 'modifiedOn',
        render: (v: string) => <span className="tabular-nums">{formatDateTime(v)}</span>,
        sorter: (a, b) => a.modifiedOn.localeCompare(b.modifiedOn),
      },
      {
        title: <span className="sr-only">Actions</span>,
        key: 'actions',
        width: 90,
        align: 'right',
        render: (_, row) => (
          <RowActions
            entityName="relationship"
            onEdit={() => navigate(ROUTES.ciRelationshipEdit(row.id))}
            onDelete={() =>
              confirmDelete(
                'CI Relationship',
                `${ciName(row.sourceCiId)} → ${ciName(row.targetCiId)}`,
                () => remove.mutateAsync(row.id),
              )
            }
          />
        ),
      },
    ],
    [navigate, confirmDelete, remove, ciName],
  );

  const searchValues = useCallback(
    (r: CiRelationship) => [
      ciName(r.sourceCiId),
      r.relationshipType,
      ciName(r.targetCiId),
      r.description,
    ],
    [ciName],
  );

  const viewSwitch = (
    <Segmented<View>
      value={view}
      onChange={setView}
      aria-label="View"
      options={[
        {
          value: 'table',
          label: (
            <span className="flex items-center gap-1.5">
              <Rows3 size={14} /> Table
            </span>
          ),
        },
        {
          value: 'graph',
          label: (
            <span className="flex items-center gap-1.5">
              <Network size={14} /> Graph
            </span>
          ),
        },
      ]}
    />
  );

  return (
    <>
      <PageHeader
        title="CI Relationships"
        description="How configuration items depend on, host and connect to each other."
        actions={
          <>
            {viewSwitch}
            <AppButton icon={<Plus size={15} />} onClick={() => navigate(ROUTES.ciRelationshipNew)}>
              Add CI Relationship
            </AppButton>
          </>
        }
      />
      <AppCard bodyClassName={view === 'table' ? 'p-4' : 'p-0 overflow-hidden rounded-[inherit]'}>
        {view === 'table' ? (
          <AppTable<CiRelationship>
            rowKey="id"
            columns={columns}
            data={list.data}
            loading={list.isLoading}
            error={list.error}
            onRetry={() => void list.refetch()}
            searchValues={searchValues}
            searchPlaceholder="Search relationships…"
            emptyText="No relationships mapped yet"
            emptyDescription="Link configuration items to visualise dependencies in the graph view."
          />
        ) : list.isLoading || lookups.isLoading ? (
          <LoadingState />
        ) : (
          <CiRelationshipGraph
            relationships={list.data ?? []}
            masters={lookups.masters}
            types={lookups.types}
          />
        )}
      </AppCard>
    </>
  );
}
