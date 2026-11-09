import { useMemo, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { Plus } from 'lucide-react';
import { editPath, newPath } from '@/config/routes';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';
import type { createCrudHooks } from '@/hooks/useCrudQueries';
import type { BaseEntity } from '@/types/common.types';
import { formatDateTime } from '@/utils/formatters';
import { AppButton } from './AppButton';
import { AppCard } from './AppCard';
import { AppTable } from './AppTable';
import { PageHeader } from './PageHeader';
import { RowActions } from './RowActions';

interface CrudListPageProps<T extends BaseEntity> {
  title: string;
  description: string;
  /** Singular name used in buttons and messages, e.g. "Role". */
  entityLabel: string;
  /** The list page path; create / edit pages live below it. */
  listPath: string;
  hooks: ReturnType<typeof createCrudHooks<T>>;
  /** Data columns; Modified By, Modified On and Actions are added automatically. */
  columns: ColumnsType<T>;
  /** Display name of a row (delete confirmation, accessibility labels). */
  nameOf: (row: T) => string;
  searchValues: (row: T) => Array<string | number | undefined | null>;
  onView?: (row: T) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  /** Extra content under the grid (e.g. a details drawer). */
  children?: ReactNode;
}

/**
 * Standard "View <entity>(s)" screen: header with an Add button, searchable sortable grid and
 * view / edit / delete actions. Every Configurations list page is built from this.
 */
export function CrudListPage<T extends BaseEntity>({
  title,
  description,
  entityLabel,
  listPath,
  hooks,
  columns,
  nameOf,
  searchValues,
  onView,
  canEdit = true,
  canDelete = true,
  children,
}: CrudListPageProps<T>) {
  const navigate = useNavigate();
  const list = hooks.useList();
  const remove = hooks.useRemove();
  const confirmDelete = useConfirmDelete();

  const allColumns = useMemo<ColumnsType<T>>(
    () => [
      ...columns,
      {
        title: 'Modified By',
        dataIndex: 'modifiedBy',
        sorter: (a, b) => a.modifiedBy.localeCompare(b.modifiedBy),
      },
      {
        title: 'Modified On',
        dataIndex: 'modifiedOn',
        render: (value: string) => <span className="tabular-nums">{formatDateTime(value)}</span>,
        sorter: (a, b) => a.modifiedOn.localeCompare(b.modifiedOn),
        defaultSortOrder: 'descend',
      },
      {
        title: <span className="sr-only">Actions</span>,
        key: 'actions',
        width: 110,
        align: 'right',
        render: (_, row) => (
          <RowActions
            entityName={nameOf(row)}
            onView={onView ? () => onView(row) : undefined}
            onEdit={canEdit ? () => navigate(editPath(listPath, row.id)) : undefined}
            onDelete={
              canDelete
                ? () => confirmDelete(entityLabel, nameOf(row), () => remove.mutateAsync(row.id))
                : undefined
            }
          />
        ),
      },
    ],
    [
      columns,
      nameOf,
      onView,
      canEdit,
      canDelete,
      navigate,
      listPath,
      confirmDelete,
      entityLabel,
      remove,
    ],
  );

  const addButton = (
    <AppButton icon={<Plus size={15} />} onClick={() => navigate(newPath(listPath))}>
      Add {entityLabel}
    </AppButton>
  );

  return (
    <>
      <PageHeader title={title} description={description} actions={addButton} />
      <AppCard title={`View ${title}`} bodyClassName="p-4">
        <AppTable<T>
          rowKey="id"
          columns={allColumns}
          data={list.data}
          loading={list.isLoading}
          error={list.error}
          onRetry={() => void list.refetch()}
          searchValues={searchValues}
          searchPlaceholder={`Search ${title.toLowerCase()}...`}
          emptyAction={addButton}
        />
      </AppCard>
      {children}
    </>
  );
}
