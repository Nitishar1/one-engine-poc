/** App settings from .env. VITE_* values end up in the browser, so never put secrets here. */
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  // The mock backend accepts any password, so it only ever runs in development.
  useMocks: import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS === 'true',
  apiTimeoutMs: 30000,
};
