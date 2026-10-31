import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { useAuthStore } from '@/stores/authStore';
import { ApiError, type ApiErrorBody, type ApiResponse } from '@/types/api.types';

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
  // Sends the httpOnly refresh/session cookie issued by the backend.
  withCredentials: true,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

const PUBLIC_ENDPOINTS = ['/auth/login', '/auth/domains', '/auth/session'];

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  config.headers.set('X-Request-Id', crypto.randomUUID?.() ?? String(Date.now()));
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status ?? 0;
    const url = error.config?.url ?? '';

    if (status === 401 && !PUBLIC_ENDPOINTS.some((p) => url.startsWith(p))) {
      useAuthStore.getState().clearSession({ expired: true });
    }

    const body = error.response?.data;
    const message =
      body?.message ??
      (status === 0
        ? 'Unable to reach the OneEngine server. Check your connection.'
        : error.message);
    return Promise.reject(new ApiError(message, status, body?.code, body?.errors));
  },
);

/** Unwraps the `{ success, data }` envelope. */
const unwrap = <T>(response: AxiosResponse<ApiResponse<T>>): T => response.data.data;

export const http = {
  get: <T>(url: string, params?: object) =>
    apiClient.get<ApiResponse<T>>(url, { params }).then(unwrap),
  post: <T, B = unknown>(url: string, body?: B) =>
    apiClient.post<ApiResponse<T>>(url, body).then(unwrap),
  put: <T, B = unknown>(url: string, body?: B) =>
    apiClient.put<ApiResponse<T>>(url, body).then(unwrap),
  delete: <T = void>(url: string) => apiClient.delete<ApiResponse<T>>(url).then(unwrap),
};
