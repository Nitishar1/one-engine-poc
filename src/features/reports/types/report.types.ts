import type { ExecutionRecord } from '@/features/dashboard/types/dashboard.types';

export type { ExecutionRecord };

export interface ExecutionReportFilters {
  from?: string;
  to?: string;
  status?: ExecutionRecord['status'];
}
