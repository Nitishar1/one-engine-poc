import { api } from './client';
import { ENDPOINTS } from './endpoints';
import type { LoginRequest, LoginResponse } from './types';

export const authApi = {
  domains: () => api.get<string[]>(ENDPOINTS.domains),
  login: (request: LoginRequest) => api.post<LoginResponse>(ENDPOINTS.login, request),
  /** Restores the session after a page reload, using the httpOnly session cookie. */
  session: () => api.get<LoginResponse>(ENDPOINTS.session),
  logout: () => api.post<null>(ENDPOINTS.logout),
};
