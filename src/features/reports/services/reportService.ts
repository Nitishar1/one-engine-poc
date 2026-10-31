import { http } from '@/services/api/axiosInstance';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import type { ExecutionRecord, ExecutionReportFilters } from '../types/report.types';

export const reportService = {
  getExecutions: (filters: ExecutionReportFilters) =>
    http.get<ExecutionRecord[]>(API_ENDPOINTS.reports.executions, filters),
};
