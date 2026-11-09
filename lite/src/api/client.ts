import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { config } from '../config';
import { ENDPOINTS } from './endpoints';
import { ApiError, type ApiResponse, type LoginResponse } from './types';

/**
 * The access token lives only in this variable (memory), never in localStorage, so a script
 * injected into the page can't read it from storage. The backend keeps the login session in
 * an httpOnly cookie, which is used to get a new token after a reload or when it expires.
 */
let accessToken: string | null = null;
let onSessionEnd = () => {};

export const session = {
  setToken: (token: string | null) => {
    accessToken = token;
  },
  /** Registers what to do when the backend ends the session (shows the login page). */
  onEnd: (callback: () => void) => {
    onSessionEnd = callback;
  },
};

export const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.apiTimeoutMs,
  // Send the httpOnly session cookie with every call.
  withCredentials: true,
  headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
  // CSRF protection: copy the backend's XSRF-TOKEN cookie into the X-XSRF-TOKEN header.
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  withXSRFToken: true,
});

// Step 1: attach the access token to every request.
apiClient.interceptors.request.use((request) => {
  if (accessToken) request.headers.set('Authorization', `Bearer ${accessToken}`);
  return request;
});

// Step 2: when a call fails with 401, get a new token once and retry the call.
let refreshing: Promise<string | null> | null = null;

function refreshToken() {
  // If several calls fail at the same time, they all wait for the same refresh.
  refreshing ??= apiClient
    .get<ApiResponse<LoginResponse>>(ENDPOINTS.session)
    .then((response) => {
      accessToken = response.data.data.accessToken;
      return accessToken;
    })
    .catch(() => null)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

type RetryableRequest = InternalAxiosRequestConfig & { retried?: boolean };

/** Calls that must not trigger a refresh (they are how you get a token in the first place). */
const NO_REFRESH = [ENDPOINTS.login, ENDPOINTS.session, ENDPOINTS.domains];

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetryableRequest | undefined;
    const status = error.response?.status;

    if (status === 401 && request && !NO_REFRESH.includes(request.url ?? '')) {
      if (!request.retried && accessToken) {
        request.retried = true;
        if (await refreshToken()) return apiClient(request);
      }
      accessToken = null;
      onSessionEnd();
    }
    throw toApiError(error);
  },
);

/** Turns any failure into a message that is safe to show (never server internals). */
function toApiError(error: AxiosError): ApiError {
  const status = error.response?.status ?? 0;
  const body = error.response?.data as { message?: unknown } | undefined;

  if (status === 0) return new ApiError('Cannot reach the server. Check your connection.', 0);
  if (status >= 500) return new ApiError('Server error. Please try again later.', status);
  if (status === 403) return new ApiError('You do not have permission to do this.', status);
  if (typeof body?.message === 'string') return new ApiError(body.message, status);
  return new ApiError('The request failed.', status);
}

/** Returns `data` from the `{ success, data }` envelope. Anything else is rejected. */
function unwrap<T>(response: AxiosResponse): T {
  if (response.status === 204) return undefined as T;
  const body = response.data as Partial<ApiResponse<T>> | null;
  const isJson = String(response.headers['content-type'] ?? '').includes('json');
  // An HTML page here usually means a proxy or SSO login page answered instead of the API.
  if (!isJson || !body || typeof body !== 'object' || !('data' in body)) {
    throw new ApiError('Unexpected response from the server.', response.status);
  }
  return body.data as T;
}

/** The functions the rest of the app uses to call the backend. */
export const api = {
  get: <T>(url: string) => apiClient.get(url).then(unwrap<T>),
  post: <T>(url: string, body?: unknown) => apiClient.post(url, body).then(unwrap<T>),
  put: <T>(url: string, body?: unknown) => apiClient.put(url, body).then(unwrap<T>),
  delete: <T>(url: string) => apiClient.delete(url).then(unwrap<T>),
};
