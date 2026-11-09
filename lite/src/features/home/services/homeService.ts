import { http } from '@/services/api/axiosInstance';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import type { RequestOptions } from '@/types/api.types';
import type { HomeSummary } from '../types/home.types';

export const homeService = {
  getSummary: (options?: RequestOptions) =>
    http.get<HomeSummary>(API_ENDPOINTS.dashboard.summary, undefined, options),
};
