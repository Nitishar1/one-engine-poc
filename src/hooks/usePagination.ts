import { useMemo, useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';

export interface PaginationResult<T> {
  page: number;
  pageSize: number;
  total: number;
  pageItems: T[];
  rangeStart: number;
  rangeEnd: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

/** Client-side pagination that clamps the current page when the data set shrinks. */
export function usePagination<T>(
  items: T[],
  initialPageSize = DEFAULT_PAGE_SIZE,
): PaginationResult<T> {
  const [requestedPage, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const total = items.length;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, lastPage);

  const pageItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize],
  );

  return {
    page,
    pageSize,
    total,
    pageItems,
    rangeStart: total === 0 ? 0 : (page - 1) * pageSize + 1,
    rangeEnd: Math.min(page * pageSize, total),
    setPage,
    setPageSize: (size: number) => {
      setPageSizeState(size);
      setPage(1);
    },
  };
}
