import { http } from '@/services/api/axiosInstance';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import type { RequestOptions } from '@/types/api.types';
import type { NavigationMenu } from '@/types/navigation.types';

export const navigationService = {
  get: (options?: RequestOptions) =>
    http.get<NavigationMenu[]>(API_ENDPOINTS.navigation, undefined, options),
};
