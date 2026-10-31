import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { toast, useToastStore } from '@/components/feedback/toastStore';
import { renderWithProviders } from '@/test/renderWithProviders';

describe('toaster', () => {
  afterEach(() => act(() => useToastStore.setState({ toasts: [] })));

  it('shows typed toasts and dismisses them from the close button', async () => {
    renderWithProviders(<span />);

    act(() => {
      toast.success('Agent created successfully');
      toast.error('Something broke');
    });

    expect(screen.getByRole('status')).toHaveTextContent('Agent created successfully');
    expect(screen.getByRole('alert')).toHaveTextContent('Something broke');

    await userEvent.click(screen.getAllByRole('button', { name: 'Dismiss notification' })[0]);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await act(() => new Promise((r) => setTimeout(r, 400)));
    expect(screen.queryByText('Agent created successfully')).not.toBeInTheDocument();
  });
});
