import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { reportService } from '../services/reportService';
import type { ExecutionReportFilters } from '../types/report.types';

export const useExecutionReport = (filters: ExecutionReportFilters) =>
  useQuery({
    queryKey: ['reports', 'executions', filters],
    queryFn: ({ signal }) => reportService.getExecutions(filters, { signal }),
    placeholderData: keepPreviousData,
  });
