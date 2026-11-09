import { http } from '@/services/api/axiosInstance';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import type { RequestOptions } from '@/types/api.types';
import type { DashboardSummary } from '../types/dashboard.types';

export const dashboardService = {
  getSummary: (options?: RequestOptions) =>
    http.get<DashboardSummary>(API_ENDPOINTS.dashboard.summary, undefined, options),
};
