import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { Plus } from 'lucide-react';
import { IconAvatar } from '@/components/common/IconAvatar';
import { PageHeader } from '@/components/common/PageHeader';
import { AppCard } from '@/components/common/AppCard';
import { AppTable } from '@/components/common/AppTable';
import { AppButton } from '@/components/common/AppButton';
import { RowActions } from '@/components/common/RowActions';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';
import { ROUTES } from '@/config/routes';
import { aiAgentHooks } from '../hooks/useAi';
import type { AiAgentConfig } from '../types/ai.types';

export default function AiConfigurationListPage() {
  const navigate = useNavigate();
  const list = aiAgentHooks.useList();
  const remove = aiAgentHooks.useRemove();
  const confirmDelete = useConfirmDelete();

  const columns = useMemo<ColumnsType<AiAgentConfig>>(
    () => [
      {
        title: 'Agent Name',
        dataIndex: 'name',
        width: 200,
        sorter: (a, b) => a.name.localeCompare(b.name),
        render: (name: string, row) => (
          <span className="flex items-center gap-2.5">
            <IconAvatar icon={row.icon} size={28} />
            <button
              type="button"
              className="oe-link"
              onClick={() => navigate(ROUTES.aiConfigurationEdit(row.id))}
            >
              {name}
            </button>
          </span>
        ),
      },
      {
        title: 'Short Description',
        dataIndex: 'shortDescription',
        width: 230,
        sorter: (a, b) => a.shortDescription.localeCompare(b.shortDescription),
      },
      {
        title: 'Full Description',
        dataIndex: 'fullDescription',
        render: (d: string) => (
          <span className="line-clamp-2" title={d}>
            {d}
          </span>
        ),
        sorter: (a, b) => a.fullDescription.localeCompare(b.fullDescription),
      },
      {
        title: 'Prerequisites',
        dataIndex: 'prerequisites',
        width: 200,
        render: (d: string) => (
          <span className="line-clamp-2" title={d}>
            {d}
          </span>
        ),
        sorter: (a, b) => a.prerequisites.localeCompare(b.prerequisites),
      },
      {
        title: <span className="sr-only">Actions</span>,
        key: 'actions',
        width: 90,
        align: 'right',
        render: (_, row) => (
          <RowActions
            entityName={row.name}
            onEdit={() => navigate(ROUTES.aiConfigurationEdit(row.id))}
            onDelete={() => confirmDelete('AI Agent', row.name, () => remove.mutateAsync(row.id))}
          />
        ),
      },
    ],
    [navigate, confirmDelete, remove],
  );

  const searchValues = useCallback(
    (r: AiAgentConfig) => [r.name, r.shortDescription, r.fullDescription, r.prerequisites],
    [],
  );

  return (
    <>
      <PageHeader
        title="AI Configuration"
        description="Define AI agents: their purpose, the model they use and what they need to run."
        actions={
          <AppButton icon={<Plus size={15} />} onClick={() => navigate(ROUTES.aiConfigurationNew)}>
            Add Agent
          </AppButton>
        }
      />
      <AppCard bodyClassName="p-4">
        <AppTable<AiAgentConfig>
          rowKey="id"
          columns={columns}
          data={list.data}
          loading={list.isLoading}
          error={list.error}
          onRetry={() => void list.refetch()}
          searchValues={searchValues}
          searchPlaceholder="Search AI agents…"
          emptyText="No AI agents configured"
          emptyDescription="Configure an agent to make it available in the AI Agents workspace."
          scroll={{ x: 960 }}
        />
      </AppCard>
    </>
  );
}
