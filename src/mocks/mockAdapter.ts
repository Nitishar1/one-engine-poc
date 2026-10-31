import {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { mockRoutes, mockSession } from './handlers';
import { fail, type MockResult, type MockRoute } from './handlers/types';

const LATENCY_MS = { min: 150, max: 450 };

interface CompiledRoute {
  route: MockRoute;
  regex: RegExp;
  keys: string[];
}

const compiled: CompiledRoute[] = mockRoutes.map((route) => {
  const keys: string[] = [];
  const source = route.pattern.replace(/:(\w+)/g, (_, key: string) => {
    keys.push(key);
    return '([^/]+)';
  });
  return { route, regex: new RegExp(`^${source}/?$`), keys };
});

const delay = () =>
  new Promise((r) =>
    setTimeout(r, LATENCY_MS.min + Math.random() * (LATENCY_MS.max - LATENCY_MS.min)),
  );

const parseBody = (data: unknown): unknown => {
  if (typeof data !== 'string') return data;
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
};

async function resolve(config: InternalAxiosRequestConfig): Promise<MockResult> {
  const method = (config.method ?? 'get').toUpperCase();
  const url = new URL(config.url ?? '', 'http://mock.local');
  const path = url.pathname;

  // Route ordering matters: more specific static paths (e.g. /runbooks/roles) before /:id.
  const candidates = compiled
    .filter((c) => c.route.method === method)
    .sort((a, b) => a.keys.length - b.keys.length);

  for (const { route, regex, keys } of candidates) {
    const match = regex.exec(path);
    if (!match) continue;

    const user = mockSession.get();
    if (!route.public && !user) return fail(401, 'Your session has expired. Please sign in again.');

    const params = Object.fromEntries(keys.map((k, i) => [k, decodeURIComponent(match[i + 1])]));
    const query: Record<string, string> = Object.fromEntries(url.searchParams.entries());
    Object.entries((config.params ?? {}) as Record<string, unknown>).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query[k] = String(v);
    });

    return route.handler({ method, path, params, query, body: parseBody(config.data), user });
  }
  return fail(404, `No mock handler for ${method} ${path}`);
}

/** Axios adapter that serves requests from the in-browser mock layer. */
export const mockAdapter: AxiosAdapter = async (config) => {
  await delay();
  const result = await resolve(config);
  const response: AxiosResponse = {
    data: result.body,
    status: result.status,
    statusText: String(result.status),
    headers: new AxiosHeaders({ 'content-type': 'application/json' }),
    config,
    request: {},
  };
  if (result.status >= 400) {
    throw new AxiosError(
      `Request failed with status ${result.status}`,
      String(result.status),
      config,
      {},
      response,
    );
  }
  return response;
};
