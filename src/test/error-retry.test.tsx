import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { EmployeeQuery } from '../types';
import { givenEmployees, inTable, makeEmployee, renderPage } from './utils';

let failNextFetch = true;

// Only the list endpoint is faked, so the rest of the page behaves normally.
vi.mock('../api/employees', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/employees')>();
  return {
    ...actual,
    listEmployees: (query: EmployeeQuery) =>
      failNextFetch
        ? Promise.reject(new actual.ApiError('The employee service is unavailable (503).'))
        : actual.listEmployees(query),
  };
});

describe('failed employee fetch', () => {
  it('explains the failure and recovers through Retry', async () => {
    failNextFetch = true;
    givenEmployees([makeEmployee()]);
    const { user } = renderPage();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Could not load employees.');
    expect(alert).toHaveTextContent('The employee service is unavailable (503).');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    // Recovery is in the user's hands, and the same button works repeatedly.
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());

    failNextFetch = false;
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    await screen.findByRole('table');
    expect(inTable().getByText('Sarah Chen')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
