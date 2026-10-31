import { useCallback, useMemo } from 'react';
import { Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader } from '@/components/common/PageHeader';
import { AppCard } from '@/components/common/AppCard';
import { AppTable } from '@/components/common/AppTable';
import { AppButton } from '@/components/common/AppButton';
import { RowActions } from '@/components/common/RowActions';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';
import { ROUTES } from '@/config/routes';
import { formatDateTime } from '@/utils/formatters';
import { runbookHooks } from '../hooks/useRunbooks';
import type { Runbook } from '../types/workflow.types';

export default function RunbookListPage() {
  const navigate = useNavigate();
  const list = runbookHooks.useList();
  const remove = runbookHooks.useRemove();
  const confirmDelete = useConfirmDelete();

  const columns = useMemo<ColumnsType<Runbook>>(
    () => [
      {
        title: 'Runbook Name',
        dataIndex: 'name',
        sorter: (a, b) => a.name.localeCompare(b.name),
        render: (name: string, row) => (
          <button
            type="button"
            className="oe-link"
            onClick={() => navigate(ROUTES.runbookEdit(row.id))}
          >
            {name}
          </button>
        ),
      },
      {
        title: 'Roles',
        dataIndex: 'roles',
        render: (roles: string[]) => (
          <span className="flex flex-wrap gap-1">
            {roles.map((r) => (
              <Tag key={r} className="!m-0">
                {r}
              </Tag>
            ))}
          </span>
        ),
      },
      {
        title: 'Steps',
        key: 'steps',
        align: 'right',
        render: (_, r) => (
          <span className="font-mono text-[12.5px]">{r.definition.nodes.length}</span>
        ),
        sorter: (a, b) => a.definition.nodes.length - b.definition.nodes.length,
      },
      {
        title: 'Modified By',
        dataIndex: 'modifiedBy',
        sorter: (a, b) => a.modifiedBy.localeCompare(b.modifiedBy),
      },
      {
        title: 'Modified On',
        dataIndex: 'modifiedOn',
        render: formatDateTime,
        sorter: (a, b) => a.modifiedOn.localeCompare(b.modifiedOn),
        defaultSortOrder: 'descend',
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 90,
        align: 'right',
        render: (_, row) => (
          <RowActions
            entityName={row.name}
            onEdit={() => navigate(ROUTES.runbookEdit(row.id))}
            onDelete={() => confirmDelete('Runbook', row.name, () => remove.mutateAsync(row.id))}
          />
        ),
      },
    ],
    [navigate, confirmDelete, remove],
  );

  const searchValues = useCallback((r: Runbook) => [r.name, r.roles.join(' '), r.modifiedBy], []);

  const newRunbook = (
    <AppButton icon={<Plus size={15} />} onClick={() => navigate(ROUTES.runbook)}>
      New runbook
    </AppButton>
  );

  return (
    <>
      <PageHeader
        title="Runbooks"
        description="Automation workflows built in the Orchestrator. Open a runbook to edit its steps on the canvas."
        actions={newRunbook}
      />
      <AppCard>
        <AppTable<Runbook>
          rowKey="id"
          columns={columns}
          data={list.data}
          loading={list.isLoading}
          error={list.error}
          onRetry={() => void list.refetch()}
          searchValues={searchValues}
          searchPlaceholder="Search runbooks, roles or authors…"
          emptyText="No runbooks yet"
          emptyDescription="Build your first runbook by dragging agents and steps onto the canvas."
          emptyAction={newRunbook}
        />
      </AppCard>
    </>
  );
}
