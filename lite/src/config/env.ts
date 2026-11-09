const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const isProd = import.meta.env.PROD;

/**
 * The mock API accepts any password, so it must never be reachable in a real deployment.
 * Dev builds default to mocks; production builds only use them when explicitly allowed
 * (e.g. a static demo build).
 */
const resolveUseMocks = () => {
  const requested = (import.meta.env.VITE_USE_MOCKS ?? (isProd ? 'false' : 'true')) === 'true';
  if (!requested || !isProd) return requested;
  if (import.meta.env.VITE_ALLOW_MOCKS_IN_PRODUCTION === 'true') {
    console.warn('[OneEngine] Running a production build against the mock API.');
    return true;
  }
  console.error(
    '[OneEngine] VITE_USE_MOCKS=true is ignored in production builds. Set ' +
      'VITE_ALLOW_MOCKS_IN_PRODUCTION=true only for demo deployments.',
  );
  return false;
};

/**
 * Same-origin paths ("/api") are preferred: cookies stay first-party and no CORS is needed.
 * Absolute URLs must be http(s), and plain http is only acceptable for local development.
 */
const resolveApiBaseUrl = () => {
  const value = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/+$/, '');
  if (value.startsWith('/')) return value;
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`VITE_API_BASE_URL must be an http(s) URL, got "${value}"`);
  }
  const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (isProd && url.protocol === 'http:' && !isLocal) {
    console.error('[OneEngine] VITE_API_BASE_URL uses plain http; credentials are unencrypted.');
  }
  return value;
};

/** Typed access to Vite environment variables. Only non-secret values belong here. */
export const env = {
  apiBaseUrl: resolveApiBaseUrl(),
  useMocks: resolveUseMocks(),
  apiTimeout: toNumber(import.meta.env.VITE_API_TIMEOUT, 30000),
} as const;
