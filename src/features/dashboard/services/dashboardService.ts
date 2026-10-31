import { http } from '@/services/api/axiosInstance';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import type { DashboardSummary } from '../types/dashboard.types';

export const dashboardService = {
  getSummary: () => http.get<DashboardSummary>(API_ENDPOINTS.dashboard.summary),
};
