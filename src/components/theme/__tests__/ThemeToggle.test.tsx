import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useThemeStore } from '@/stores/themeStore';
import { STORAGE_KEYS } from '@/utils/constants';
import { themeTokens } from '@/components/theme/themeTokens';
import { renderWithProviders } from '@/test/renderWithProviders';

describe('theme switching', () => {
  beforeEach(() => act(() => useThemeStore.setState({ mode: 'dark' })));

  it('toggles between dark and light, updating tokens and persisting the choice', async () => {
    renderWithProviders(<ThemeToggle />);
    const root = document.documentElement;

    expect(screen.getByRole('button', { name: /switch to light theme/i })).toHaveTextContent(
      'Dark',
    );
    expect(root.dataset.theme).toBe('dark');
    expect(root.style.getPropertyValue('--oe-surface')).toBe(themeTokens.dark.surface);

    await userEvent.click(screen.getByRole('button', { name: /switch to light theme/i }));

    expect(screen.getByRole('button', { name: /switch to dark theme/i })).toHaveTextContent(
      'Light',
    );
    expect(root.dataset.theme).toBe('light');
    expect(root.style.getPropertyValue('--oe-surface')).toBe(themeTokens.light.surface);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.theme) ?? '{}').state.mode).toBe('light');
  });
});
