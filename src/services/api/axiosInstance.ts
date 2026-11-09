import axios, {
  AxiosHeaders,
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { env } from '@/config/env';
import type { LoginResponse } from '@/features/auth/types/auth.types';
import { useAuthStore } from '@/stores/authStore';
import {
  ApiError,
  type ApiErrorBody,
  type ApiResponse,
  type RequestOptions,
} from '@/types/api.types';
import { API_ENDPOINTS } from './apiEndpoints';

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
  // Sends the httpOnly refresh/session cookie issued by the backend.
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    // Lets the backend reject cross-site form posts and avoid SSO HTML redirects for API calls.
    'X-Requested-With': 'XMLHttpRequest',
  },
  // CSRF double-submit: the backend sets a readable XSRF-TOKEN cookie and checks that every
  // state-changing request echoes it in X-XSRF-TOKEN. Only this client's API calls carry it.
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  withXSRFToken: true,
});

const REQUEST_ID_HEADER = 'X-Request-Id';

/** Calls that must not trigger a token refresh when they fail with 401. */
const PUBLIC_ENDPOINTS: string[] = [
  API_ENDPOINTS.auth.login,
  API_ENDPOINTS.auth.domains,
  API_ENDPOINTS.auth.session,
];

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  config.headers.set(REQUEST_ID_HEADER, crypto.randomUUID?.() ?? String(Date.now()));
  return config;
});

const headerValue = (headers: AxiosResponse['headers'] | undefined, name: string) =>
  headers ? String(AxiosHeaders.from(headers as AxiosHeaders).get(name) ?? '') : '';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isEnvelope = (body: unknown): body is ApiResponse<unknown> =>
  isRecord(body) && body.success !== false && 'data' in body;

const isErrorBody = (body: unknown): body is ApiErrorBody =>
  isRecord(body) && typeof body.message === 'string';

const STATUS_MESSAGES: Record<number, string> = {
  400: 'The request was not valid.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested item was not found.',
  409: 'This item was changed by someone else. Reload and try again.',
  413: 'The request is too large.',
};

/** Maps any Axios failure to an ApiError whose message is safe to show to the user. */
function toApiError(error: AxiosError): ApiError {
  const status = error.response?.status ?? 0;
  const body = isErrorBody(error.response?.data) ? error.response.data : undefined;

  if (status === 0) {
    const timedOut = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
    return new ApiError(
      timedOut
        ? 'The server took too long to respond. Please try again.'
        : 'Unable to reach the OneEngine server. Check your connection.',
      0,
      error.code,
    );
  }
  if (status >= 500) {
    // Server messages for 5xx may contain internals (stack traces, SQL); never show them.
    const ref = String(error.config?.headers?.[REQUEST_ID_HEADER] ?? '').slice(0, 8);
    return new ApiError(
      `The server ran into a problem. Please try again later.${ref ? ` (Ref: ${ref})` : ''}`,
      status,
      body?.code,
    );
  }
  if (status === 429) {
    const wait = Number(headerValue(error.response?.headers, 'retry-after'));
    return new ApiError(
      `Too many requests. Please wait ${wait > 0 ? `${wait} seconds` : 'a moment'} and try again.`,
      status,
      body?.code,
    );
  }
  const message = (body?.message ?? STATUS_MESSAGES[status] ?? 'The request failed.').slice(0, 300);
  return new ApiError(message, status, body?.code, body?.errors);
}

/** Unwraps the `{ success, data }` envelope, rejecting anything that is not JSON from the API. */
function unwrap<T>(response: AxiosResponse<unknown>): T {
  if (response.status === 204) return undefined as T;
  const body = response.data;
  // An HTML body usually means an SSO / proxy login page answered instead of the API.
  if (!headerValue(response.headers, 'content-type').includes('json') || !isEnvelope(body)) {
    throw new ApiError(
      'Received an unexpected response from the server.',
      response.status,
      'INVALID_RESPONSE',
    );
  }
  return body.data as T;
}

let refreshing: Promise<string | null> | null = null;

/**
 * Exchanges the httpOnly session cookie for a new access token. Concurrent 401s share one
 * refresh call; resolves to null when the session can't be renewed.
 */
function refreshAccessToken(): Promise<string | null> {
  refreshing ??= apiClient
    .get<unknown>(API_ENDPOINTS.auth.session)
    .then((response) => {
      const { user, accessToken } = unwrap<LoginResponse>(response);
      useAuthStore.getState().setSession(user, accessToken);
      return accessToken;
    })
    .catch(() => null)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Cancelled requests (navigation, unmount) are not failures; TanStack Query ignores them.
    if (axios.isCancel(error)) throw error;

    const config = error.config as RetriableConfig | undefined;
    const url = config?.url ?? '';
    const isPublic = PUBLIC_ENDPOINTS.some((p) => url.startsWith(p));

    if (error.response?.status === 401 && config && !isPublic) {
      if (!config._retried && useAuthStore.getState().status === 'authenticated') {
        config._retried = true;
        // The request interceptor attaches the new token on retry.
        if (await refreshAccessToken()) return apiClient(config);
      }
      useAuthStore.getState().clearSession({ expired: true });
    }
    throw toApiError(error);
  },
);

export const http = {
  get: <T>(url: string, params?: object, options?: RequestOptions) =>
    apiClient.get<unknown>(url, { params, signal: options?.signal }).then(unwrap<T>),
  post: <T, B = unknown>(url: string, body?: B, options?: RequestOptions) =>
    apiClient.post<unknown>(url, body, { signal: options?.signal }).then(unwrap<T>),
  put: <T, B = unknown>(url: string, body?: B, options?: RequestOptions) =>
    apiClient.put<unknown>(url, body, { signal: options?.signal }).then(unwrap<T>),
  delete: <T = void>(url: string, options?: RequestOptions) =>
    apiClient.delete<unknown>(url, { signal: options?.signal }).then(unwrap<T>),
};
