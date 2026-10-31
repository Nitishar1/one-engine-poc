import { screen } from '@testing-library/react';
import { describe, expect, it, beforeAll } from 'vitest';
import { apiClient } from '@/services/api/axiosInstance';
import { enableMocks } from '@/mocks';
import { mockSession } from '@/mocks/handlers';
import { useAuthStore } from '@/stores/authStore';
import { routes } from '@/app/router';
import { renderWithProviders } from '@/test/renderWithProviders';

describe('application', () => {
  beforeAll(async () => {
    await enableMocks(apiClient);
  });

  it('redirects anonymous users to the login page', async () => {
    useAuthStore.setState({ status: 'unknown', user: null, accessToken: null });
    renderWithProviders(routes, { route: '/home' });
    expect(
      await screen.findByRole('heading', { name: 'Sign in to OneEngine' }, { timeout: 4000 }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('AI Infused Automation Solution').length).toBeGreaterThan(0);
  });

  it('restores an existing session and renders the CI Type grid inside the shell', async () => {
    mockSession.set('admin');
    useAuthStore.setState({ status: 'unknown', user: null, accessToken: null });
    renderWithProviders(routes, { route: '/ci-mapping/ci-type' });

    expect(await screen.findByText('DB Server', {}, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.getByText('App Server')).toBeInTheDocument();
    expect(screen.getByText('Showing 1 to 3 of 3 entries')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add CI Type' })).toBeInTheDocument();
  });
});
