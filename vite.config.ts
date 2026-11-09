import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  // Not VITE_-prefixed: the backend address is only needed by the dev server, not the bundle.
  const { API_PROXY_TARGET } = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: 5173,
      // Forwards /api to the backend so the browser sees one origin (no CORS, first-party cookies).
      proxy: API_PROXY_TARGET
        ? { '/api': { target: API_PROXY_TARGET, changeOrigin: true, secure: true } }
        : undefined,
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      css: false,
    },
  };
});
