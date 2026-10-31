import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppInput } from '@/components/common/AppInput';
import { AppButton } from '@/components/common/AppButton';
import { requiredText } from '@/utils/validators';
import { renderWithProviders } from '@/test/renderWithProviders';

const schema = z.object({ name: requiredText('CI Type', 10) });
type Values = z.infer<typeof schema>;

function TestForm({ onSubmit }: { onSubmit: (v: Values) => void }) {
  const { control, handleSubmit } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <AppInput
        control={control}
        name="name"
        label="CI Type"
        required
        placeholder="Enter CI Type"
      />
      <AppButton htmlType="submit">Save</AppButton>
    </form>
  );
}

describe('AppInput with React Hook Form + Zod', () => {
  it('shows the label with a required marker and validation errors', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<TestForm onSubmit={onSubmit} />);

    expect(screen.getByText('CI Type')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('CI Type is required');
    expect(onSubmit).not.toHaveBeenCalled();

    await userEvent.type(screen.getByPlaceholderText('Enter CI Type'), 'way too long value');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('at most 10 characters');
  });

  it('submits trimmed, valid values', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<TestForm onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText(/CI Type/), '  DB Server ');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toEqual({ name: 'DB Server' });
  });
});
