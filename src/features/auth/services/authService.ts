import { http } from '@/services/api/axiosInstance';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import type { RequestOptions } from '@/types/api.types';
import type { ChangePasswordRequest, LoginRequest, LoginResponse } from '../types/auth.types';

export const authService = {
  getDomains: (options?: RequestOptions) =>
    http.get<string[]>(API_ENDPOINTS.auth.domains, undefined, options),
  login: (request: LoginRequest) => http.post<LoginResponse>(API_ENDPOINTS.auth.login, request),
  /** Exchanges the httpOnly session cookie for a fresh access token. */
  restoreSession: () => http.get<LoginResponse>(API_ENDPOINTS.auth.session),
  logout: () => http.post<null>(API_ENDPOINTS.auth.logout),
  changePassword: (request: ChangePasswordRequest) =>
    http.post<null>(API_ENDPOINTS.auth.changePassword, request),
};
