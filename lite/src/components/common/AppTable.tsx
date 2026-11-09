import { useMemo, useState, type ReactNode } from 'react';
import { Input, Table, type TableProps } from 'antd';
import { Search, SearchX } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/utils/constants';
import { matchesSearch } from '@/utils/helpers';
import { AppButton } from './AppButton';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { TableSkeleton } from './Skeleton';

export interface AppTableProps<T extends object> extends Omit<
  TableProps<T>,
  'dataSource' | 'pagination' | 'title'
> {
  data: T[] | undefined;
  /** Values of a row the search box matches against. */
  searchValues: (row: T) => Array<string | number | undefined | null>;
  error?: unknown;
  onRetry?: () => void;
  emptyText?: string;
  /** Shown under the empty-state title when the table has no rows at all. */
  emptyDescription?: ReactNode;
  /** Shown in the empty state when the table has no rows at all (e.g. a "Create" button). */
  emptyAction?: ReactNode;
  /** Extra controls (filters, exports) rendered next to the search box. */
  toolbar?: ReactNode;
  searchPlaceholder?: string;
}

/**
 * Data grid: client-side search, sortable columns, skeleton loading, empty / error states and
 * "Showing x to y of z entries" pagination with a page-size selector.
 */
export function AppTable<T extends object>({
  data,
  searchValues,
  error,
  onRetry,
  emptyText = 'No data available in table',
  emptyDescription,
  emptyAction,
  toolbar,
  searchPlaceholder = 'Search...',
  loading,
  className = '',
  columns,
  ...tableProps
}: AppTableProps<T>) {
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [current, setCurrent] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);

  const filtered = useMemo(
    () => (data ?? []).filter((row) => matchesSearch(debouncedSearch, searchValues(row))),
    [data, debouncedSearch, searchValues],
  );

  if (error) return <ErrorState error={error} onRetry={onRetry} />;

  const isSearching = Boolean(debouncedSearch) && Boolean(data?.length);
  const showSkeleton = Boolean(loading) && !data;

  const empty = isSearching ? (
    <EmptyState
      compact
      icon={SearchX}
      title="No matching results"
      description={`Nothing matches "${debouncedSearch}". Try a different search term.`}
      action={
        <AppButton tone="secondary" size="small" onClick={() => setSearch('')}>
          Clear search
        </AppButton>
      }
    />
  ) : (
    <EmptyState compact title={emptyText} description={emptyDescription} action={emptyAction} />
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Input
          aria-label="Search table"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrent(1);
          }}
          allowClear
          prefix={<Search size={15} />}
          className="!w-full sm:!w-[280px]"
        />
        {toolbar && <div className="flex flex-wrap items-center gap-2">{toolbar}</div>}
      </div>

      {showSkeleton ? (
        <TableSkeleton columns={Math.min(columns?.length ?? 4, 5)} />
      ) : (
        <Table<T>
          className={`oe-table ${className}`}
          dataSource={filtered}
          columns={columns}
          loading={loading ? { indicator: <span className="oe-spinner" /> } : false}
          scroll={{ x: 'max-content' }}
          showSorterTooltip={false}
          locale={{ emptyText: empty }}
          pagination={{
            className: 'oe-pagination',
            current,
            pageSize,
            total: filtered.length,
            onChange: (page, size) => {
              setCurrent(size !== pageSize ? 1 : page);
              setPageSize(size);
            },
            showSizeChanger: filtered.length > PAGE_SIZE_OPTIONS[0],
            pageSizeOptions: PAGE_SIZE_OPTIONS.map(String),
            hideOnSinglePage: false,
            showTotal: (total, [from, to]) =>
              `Showing ${total === 0 ? 0 : from} to ${to} of ${total} entries${
                isSearching && data ? ` (filtered from ${data.length} total entries)` : ''
              }`,
          }}
          {...tableProps}
        />
      )}
    </div>
  );
}
