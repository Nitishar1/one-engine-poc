// Must stay first: installs React Fast Refresh even when the preamble Vite injects into
// index.html doesn't run (blocked inline scripts, HTML not served by Vite).
import '@vitejs/plugin-react/preamble';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { env } from '@/config/env';
import { apiClient } from '@/services/api/axiosInstance';
import App from '@/app/App';
import '@/styles/globals.css';

dayjs.extend(customParseFormat);

async function bootstrap() {
  if (env.useMocks) {
    const { enableMocks } = await import('@/mocks');
    await enableMocks(apiClient);
  }
  createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
