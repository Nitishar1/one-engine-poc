// Must stay first: lets React hot reload work even if the browser blocks inline scripts.
import '@vitejs/plugin-react/preamble';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { apiClient } from './api/client';
import { config } from './config';
import './styles.css';

async function start() {
  if (config.useMocks) {
    // Answer API calls from src/mocks instead of the real backend.
    const { mockAdapter } = await import('./mocks/mockApi');
    apiClient.defaults.adapter = mockAdapter;
  }
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void start();
