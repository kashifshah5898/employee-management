import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { givenEmployees, inTable, makeEmployee, renderPage, rowAction } from './utils';

describe('deactivating an employee', () => {
  it('does nothing until the action is confirmed', async () => {
    givenEmployees([makeEmployee()]);
    const { user } = renderPage();
    await screen.findByRole('table');

    await user.click(rowAction('Deactivate Sarah Chen'));

    const dialog = within(await screen.findByRole('dialog'));
    expect(dialog.getByText(/will be marked as inactive/)).toBeInTheDocument();
    // Still active while the confirmation is open.
    expect(inTable().getByText('Active')).toBeInTheDocument();

    await user.click(dialog.getByRole('button', { name: 'Cancel' }));

    // The dialog unmounts its contents on close; nothing was deactivated.
    await waitFor(() =>
      expect(screen.queryByText(/will be marked as inactive/)).not.toBeInTheDocument(),
    );
    expect(inTable().getByText('Active')).toBeInTheDocument();
  });

  it('deactivates once confirmed and reports it back', async () => {
    givenEmployees([makeEmployee()]);
    const { user } = renderPage();
    await screen.findByRole('table');

    await user.click(rowAction('Deactivate Sarah Chen'));
    const dialog = within(await screen.findByRole('dialog'));
    await user.click(dialog.getByRole('button', { name: 'Deactivate' }));

    await waitFor(() => expect(inTable().getByText('Inactive')).toBeInTheDocument());
    expect(screen.getByRole('status')).toHaveTextContent('Sarah Chen has been deactivated.');
    // An inactive employee cannot be deactivated twice.
    expect(screen.queryByRole('button', { name: 'Deactivate Sarah Chen' })).not.toBeInTheDocument();
  });
});
