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
import { aiModelHooks } from '../hooks/useAi';
import type { AiModel } from '../types/ai.types';

export default function AiModelListPage() {
  const navigate = useNavigate();
  const list = aiModelHooks.useList();
  const remove = aiModelHooks.useRemove();
  const confirmDelete = useConfirmDelete();

  const columns = useMemo<ColumnsType<AiModel>>(
    () => [
      {
        title: 'Model Name',
        dataIndex: 'name',
        sorter: (a, b) => a.name.localeCompare(b.name),
        render: (name: string, row) => (
          <button
            type="button"
            className="oe-link"
            onClick={() => navigate(ROUTES.aiModelEdit(row.id))}
          >
            {name}
          </button>
        ),
      },
      {
        title: 'Provider',
        dataIndex: 'provider',
        sorter: (a, b) => a.provider.localeCompare(b.provider),
      },
      {
        title: 'Model Id',
        dataIndex: 'modelId',
        render: (id: string) => <span className="font-mono text-[12.5px]">{id}</span>,
      },
      {
        title: 'Max Tokens',
        dataIndex: 'maxTokens',
        align: 'right',
        render: (n: number) => <span className="tabular-nums">{n.toLocaleString()}</span>,
        sorter: (a, b) => a.maxTokens - b.maxTokens,
      },
      {
        title: 'Temperature',
        dataIndex: 'temperature',
        align: 'right',
        render: (n: number) => <span className="tabular-nums">{n.toFixed(1)}</span>,
        sorter: (a, b) => a.temperature - b.temperature,
      },
      { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusTag status={s} /> },
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
            entityName={row.name}
            onEdit={() => navigate(ROUTES.aiModelEdit(row.id))}
            onDelete={() => confirmDelete('AI Model', row.name, () => remove.mutateAsync(row.id))}
          />
        ),
      },
    ],
    [navigate, confirmDelete, remove],
  );

  const searchValues = useCallback((r: AiModel) => [r.name, r.provider, r.modelId, r.status], []);

  return (
    <>
      <PageHeader
        title="AI Models"
        description="Language model endpoints available to AI agents. Credentials stay on the server."
        actions={
          <AppButton icon={<Plus size={15} />} onClick={() => navigate(ROUTES.aiModelNew)}>
            Add Model
          </AppButton>
        }
      />
      <AppCard bodyClassName="p-4">
        <AppTable<AiModel>
          rowKey="id"
          columns={columns}
          data={list.data}
          loading={list.isLoading}
          error={list.error}
          onRetry={() => void list.refetch()}
          searchValues={searchValues}
          searchPlaceholder="Search models…"
          emptyText="No AI models registered"
          emptyDescription="Register a model endpoint before configuring AI agents."
        />
      </AppCard>
    </>
  );
}
