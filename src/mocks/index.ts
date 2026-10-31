import type { AxiosInstance } from 'axios';

/** Installs the mock adapter. Loaded lazily so mock code is excluded when mocks are disabled. */
export async function enableMocks(client: AxiosInstance) {
  const { mockAdapter } = await import('./mockAdapter');
  client.defaults.adapter = mockAdapter;
}
