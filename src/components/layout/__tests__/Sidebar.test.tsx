import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { useLocation } from 'react-router-dom';
import { SidebarMenu } from '@/components/layout/SidebarMenu';
import { renderWithProviders } from '@/test/renderWithProviders';

function LocationProbe() {
  return <span data-testid="location">{useLocation().pathname}</span>;
}

describe('SidebarMenu', () => {
  const ui = (
    <>
      <SidebarMenu />
      <LocationProbe />
    </>
  );

  it('renders the top-level navigation from the central config', () => {
    renderWithProviders(ui, { route: '/home' });
    const [menu] = screen.getAllByRole('menu');
    [
      'CIMapping',
      'Home',
      'Orchestrator',
      'Reports',
      'Certificate Monitoring',
      'ITAssistant',
    ].forEach((label) => expect(within(menu).getByText(label)).toBeInTheDocument());
  });

  it('expands the active group and navigates when an item is clicked', async () => {
    renderWithProviders(ui, { route: '/ci-mapping/ci-type' });
    expect(screen.getByText('CI Type').closest('li')).toHaveClass('ant-menu-item-selected');

    await userEvent.click(screen.getByText('CI Master'));
    expect(screen.getByTestId('location')).toHaveTextContent('/ci-mapping/ci-master');
    expect(screen.getByText('CI Master').closest('li')).toHaveClass('ant-menu-item-selected');
  });

  it('highlights the owning menu item on create/edit sub-pages', () => {
    renderWithProviders(ui, { route: '/ci-mapping/ci-type/new' });
    expect(screen.getByText('CI Type').closest('li')).toHaveClass('ant-menu-item-selected');
  });
});
