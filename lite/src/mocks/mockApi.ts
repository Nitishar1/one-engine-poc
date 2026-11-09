import { AxiosError, type AxiosAdapter, type AxiosResponse } from 'axios';
import { ENDPOINTS } from '../api/endpoints';
import type { Configuration, ConfigurationInput, LoginRequest } from '../api/types';
import { configurations as seed, domains, menus } from './data';

/**
 * Fake backend used when VITE_USE_MOCKS=true. It answers the same URLs with the same
 * `{ success, data, message }` responses as the real API, so switching to the backend is
 * only a .env change. Data lives in memory and resets on page reload.
 */

let configurations = [...seed];

// Stands in for the backend's httpOnly session cookie.
const SESSION_KEY = 'mock-session';

type Result = { status: number; body: unknown };

const ok = (data: unknown): Result => ({ status: 200, body: { success: true, data } });
const fail = (status: number, message: string): Result => ({
  status,
  body: { success: false, message },
});

const sessionFor = (username: string) => ({
  user: { id: `usr-${username}`, username, displayName: username, role: 'Admin' },
  accessToken: `mock-token-${Date.now()}`,
});

interface Route {
  method: string;
  /** `:id` matches one path segment. */
  url: string;
  /** Requires a signed-in user, like every non-auth endpoint on the real backend. */
  secure?: boolean;
  handle: (body: unknown, id: string) => Result;
}

const routes: Route[] = [
  { method: 'get', url: ENDPOINTS.domains, handle: () => ok(domains) },
  {
    method: 'post',
    url: ENDPOINTS.login,
    handle: (body) => {
      const { username, password } = body as LoginRequest;
      if (!username?.trim() || !password) return fail(400, 'User name and password are required');
      if (password === 'invalid') return fail(401, 'Invalid user name or password');
      sessionStorage.setItem(SESSION_KEY, username.trim());
      return ok(sessionFor(username.trim()));
    },
  },
  {
    method: 'get',
    url: ENDPOINTS.session,
    handle: () => {
      const username = sessionStorage.getItem(SESSION_KEY);
      return username ? ok(sessionFor(username)) : fail(401, 'No active session');
    },
  },
  {
    method: 'post',
    url: ENDPOINTS.logout,
    handle: () => {
      sessionStorage.removeItem(SESSION_KEY);
      return ok(null);
    },
  },
  { method: 'get', url: ENDPOINTS.menus, secure: true, handle: () => ok(menus) },
  { method: 'get', url: ENDPOINTS.configurations, secure: true, handle: () => ok(configurations) },
  {
    method: 'post',
    url: ENDPOINTS.configurations,
    secure: true,
    handle: (body) => {
      const input = body as ConfigurationInput;
      if (configurations.some((c) => c.key === input.key))
        return fail(409, 'This key already exists');
      const created: Configuration = {
        ...input,
        id: `cfg-${Date.now()}`,
        updatedOn: new Date().toISOString(),
      };
      configurations = [...configurations, created];
      return ok(created);
    },
  },
  {
    method: 'put',
    url: `${ENDPOINTS.configurations}/:id`,
    secure: true,
    handle: (body, id) => {
      const existing = configurations.find((c) => c.id === id);
      if (!existing) return fail(404, 'Configuration not found');
      const updated = {
        ...existing,
        ...(body as ConfigurationInput),
        updatedOn: new Date().toISOString(),
      };
      configurations = configurations.map((c) => (c.id === id ? updated : c));
      return ok(updated);
    },
  },
  {
    method: 'delete',
    url: `${ENDPOINTS.configurations}/:id`,
    secure: true,
    handle: (_body, id) => {
      configurations = configurations.filter((c) => c.id !== id);
      return ok(null);
    },
  },
];

/** Returns the `:id` value if `url` matches `pattern`, '' for a match without id, else null. */
function match(pattern: string, url: string): string | null {
  const want = pattern.split('/');
  const got = url.split('?')[0].split('/');
  if (want.length !== got.length) return null;
  let id = '';
  for (let i = 0; i < want.length; i++) {
    if (want[i] === ':id') id = decodeURIComponent(got[i]);
    else if (want[i] !== got[i]) return null;
  }
  return id;
}

function resolve(method: string, url: string, body: unknown, authorization: string): Result {
  for (const route of routes) {
    const id = route.method === method ? match(route.url, url) : null;
    if (id === null) continue;
    const signedIn = sessionStorage.getItem(SESSION_KEY) && authorization.startsWith('Bearer ');
    if (route.secure && !signedIn) return fail(401, 'Your session has expired');
    return route.handle(body, id);
  }
  return fail(404, `No mock for ${method.toUpperCase()} ${url}`);
}

/** Axios adapter: answers requests from the routes above instead of the network. */
export const mockAdapter: AxiosAdapter = async (request) => {
  await new Promise((done) => setTimeout(done, 300)); // feel like a network call
  const body = typeof request.data === 'string' ? JSON.parse(request.data) : request.data;
  const authorization = String(request.headers.get('Authorization') ?? '');
  const result = resolve(request.method ?? 'get', request.url ?? '', body, authorization);

  const response: AxiosResponse = {
    data: result.body,
    status: result.status,
    statusText: String(result.status),
    headers: { 'content-type': 'application/json' },
    config: request,
  };
  if (result.status >= 400) {
    throw new AxiosError(
      `Request failed with ${result.status}`,
      'ERR_MOCK',
      request,
      null,
      response,
    );
  }
  return response;
};
