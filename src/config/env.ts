const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/** Typed access to Vite environment variables. Only non-secret values belong here. */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api',
  useMocks: (import.meta.env.VITE_USE_MOCKS ?? 'true') === 'true',
  apiTimeout: toNumber(import.meta.env.VITE_API_TIMEOUT, 30000),
} as const;
