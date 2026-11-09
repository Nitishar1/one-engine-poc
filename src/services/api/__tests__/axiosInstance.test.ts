import {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthUser } from '@/features/auth/types/auth.types';
import { useAuthStore } from '@/stores/authStore';
import { ApiError } from '@/types/api.types';
import { API_ENDPOINTS, resourcePath } from '../apiEndpoints';
import { apiClient, http } from '../axiosInstance';

const user: AuthUser = {
  id: 'usr_1',
  username: 'admin',
  displayName: 'Admin',
  role: 'Admin',
  domain: 'LOCAL',
  lastLogin: '2026-01-01T00:00:00Z',
  timezone: 'UTC',
};

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };

/** Builds the response an adapter returns, throwing like axios does for >= 400. */
function respond(
  config: InternalAxiosRequestConfig,
  status: number,
  body: unknown,
  headers: Record<string, string> = JSON_HEADERS,
): AxiosResponse {
  const response: AxiosResponse = {
    data: body,
    status,
    statusText: String(status),
    headers: new AxiosHeaders(headers),
    config,
    request: {},
  };
  if (status >= 400) {
    throw new AxiosError(`Request failed with status ${status}`, 'ERR', config, {}, response);
  }
  return response;
}

const ok = (data: unknown) => ({ success: true, data });

let handler: (config: InternalAxiosRequestConfig) => AxiosResponse;
const calls: InternalAxiosRequestConfig[] = [];
const originalAdapter = apiClient.defaults.adapter;

beforeEach(() => {
  calls.length = 0;
  apiClient.defaults.adapter = (async (config) => {
    calls.push(config);
    return handler(config);
  }) as AxiosAdapter;
  useAuthStore.setState({
    status: 'authenticated',
    user,
    accessToken: 'old-token',
    sessionExpired: false,
  });
});

afterEach(() => {
  apiClient.defaults.adapter = originalAdapter;
});

describe('resourcePath', () => {
  it('encodes ids so they cannot change the route', () => {
    expect(resourcePath('/agents', 'a/b?x=1#y')).toBe('/agents/a%2Fb%3Fx%3D1%23y');
    expect(API_ENDPOINTS.aiAgentRun('id 1')).toBe('/ai-agents/id%201/run');
  });

  it('rejects empty and dot segments', () => {
    expect(() => resourcePath('/agents', '..')).toThrow();
    expect(() => resourcePath('/agents', '.')).toThrow();
    expect(() => resourcePath('/agents', ' ')).toThrow();
  });
});

describe('http client', () => {
  it('unwraps the envelope and sends auth and tracing headers', async () => {
    handler = (config) => respond(config, 200, ok([{ id: '1' }]));
    await expect(http.get('/agents')).resolves.toEqual([{ id: '1' }]);

    const headers = AxiosHeaders.from(calls[0].headers);
    expect(headers.get('Authorization')).toBe('Bearer old-token');
    expect(headers.get('X-Requested-With')).toBe('XMLHttpRequest');
    expect(headers.get('X-Request-Id')).toBeTruthy();
  });

  it('rejects a non-JSON response, e.g. an SSO login page', async () => {
    handler = (config) =>
      respond(config, 200, '<html>Sign in</html>', { 'content-type': 'text/html' });
    await expect(http.get('/agents')).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
  });

  it('never shows server internals for 5xx errors', async () => {
    handler = (config) =>
      respond(config, 500, { success: false, message: 'NullReferenceException at Repo.cs:42' });
    const error = await http.get('/agents').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).message).toMatch(/^The server ran into a problem.*\(Ref: \w+/);
    expect((error as ApiError).message).not.toContain('NullReference');
  });

  it('keeps 4xx messages and field errors from the server', async () => {
    handler = (config) =>
      respond(config, 400, {
        success: false,
        message: 'Validation failed',
        errors: { name: ['Name is required'] },
      });
    await expect(http.post('/agents', {})).rejects.toMatchObject({
      status: 400,
      message: 'Validation failed',
      fieldErrors: { name: ['Name is required'] },
    });
  });

  it('reports how long to wait when rate limited', async () => {
    handler = (config) => respond(config, 429, {}, { ...JSON_HEADERS, 'retry-after': '30' });
    await expect(http.get('/agents')).rejects.toMatchObject({
      status: 429,
      message: 'Too many requests. Please wait 30 seconds and try again.',
    });
  });
});

describe('token refresh', () => {
  it('refreshes once for concurrent 401s and retries each request with the new token', async () => {
    handler = (config) => {
      if (config.url === API_ENDPOINTS.auth.session) {
        return respond(config, 200, ok({ user, accessToken: 'new-token' }));
      }
      const token = AxiosHeaders.from(config.headers).get('Authorization');
      return token === 'Bearer new-token'
        ? respond(config, 200, ok(config.url))
        : respond(config, 401, { success: false, message: 'Token expired' });
    };

    await expect(Promise.all([http.get('/agents'), http.get('/runbooks')])).resolves.toEqual([
      '/agents',
      '/runbooks',
    ]);
    expect(calls.filter((c) => c.url === API_ENDPOINTS.auth.session)).toHaveLength(1);
    expect(useAuthStore.getState().accessToken).toBe('new-token');
  });

  it('ends the session as expired when the refresh fails', async () => {
    const clear = vi.spyOn(useAuthStore.getState(), 'clearSession');
    handler = (config) => respond(config, 401, { success: false, message: 'No session' });

    await expect(http.get('/agents')).rejects.toMatchObject({ status: 401 });
    expect(useAuthStore.getState()).toMatchObject({
      status: 'anonymous',
      accessToken: null,
      sessionExpired: true,
    });
    // One original call + one refresh; no retry loop.
    expect(calls).toHaveLength(2);
    clear.mockRestore();
  });

  it('does not refresh for public endpoints such as login', async () => {
    handler = (config) =>
      respond(config, 401, { success: false, message: 'Invalid user name or password' });
    await expect(http.post(API_ENDPOINTS.auth.login, {})).rejects.toMatchObject({
      message: 'Invalid user name or password',
    });
    expect(calls).toHaveLength(1);
  });
});
