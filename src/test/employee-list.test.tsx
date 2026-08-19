import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { findRow, givenEmployees, inTable, makeEmployee, renderPage, rowFor } from './utils';

/** Both fixtures are on screen before a filter is applied, so the filtered-out
 *  row disappearing is what marks the refetch as done. */
const waitForRowToVanish = (name: string) =>
  waitFor(() => expect(rowFor(name)).not.toBeInTheDocument());

const sarah = makeEmployee();
const omar = makeEmployee({
  id: 'e2',
  employeeId: 'EMP-0002',
  firstName: 'Omar',
  lastName: 'Farouk',
  email: 'omar.farouk@example.com',
});

describe('employee list', () => {
  it('shows a loading state, then the employees', async () => {
    givenEmployees([sarah, omar]);
    renderPage();

    expect(screen.getByText('Loading employees…')).toBeInTheDocument();

    await screen.findByRole('table');
    expect(rowFor('Sarah Chen')).toBeInTheDocument();
    expect(rowFor('Omar Farouk')).toBeInTheDocument();
    expect(inTable().getByText('EMP-0001')).toBeInTheDocument();
  });

  it('filters by name and falls back to an empty state with no matches', async () => {
    givenEmployees([sarah, omar]);
    const { user } = renderPage();
    await screen.findByRole('table');

    await user.type(screen.getByLabelText('Search by name'), 'omar');
    await waitForRowToVanish('Sarah Chen');
    expect(rowFor('Omar Farouk')).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Search by name'));
    await user.type(screen.getByLabelText('Search by name'), 'nobody');

    expect(await screen.findByText('No employees match your filters')).toBeInTheDocument();

    // The empty state has to offer a way back out of the filters.
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    await screen.findByRole('table');
    expect(rowFor('Sarah Chen')).toBeInTheDocument();
  });

  it('filters by department', async () => {
    givenEmployees([sarah, makeEmployee({ ...omar, department: 'Finance' })]);
    const { user } = renderPage();
    await screen.findByRole('table');

    await user.selectOptions(screen.getByLabelText('Department'), 'Finance');

    await waitForRowToVanish('Sarah Chen');
    expect(rowFor('Omar Farouk')).toBeInTheDocument();
  });

  it('filters by activity status', async () => {
    givenEmployees([sarah, makeEmployee({ ...omar, isActive: false })]);
    const { user } = renderPage();
    await screen.findByRole('table');

    await user.selectOptions(screen.getByLabelText('Status'), 'inactive');

    await waitForRowToVanish('Sarah Chen');
    expect(rowFor('Omar Farouk')).toBeInTheDocument();
  });

  it('paginates instead of rendering every employee at once', async () => {
    givenEmployees(
      Array.from({ length: 12 }, (_, index) =>
        makeEmployee({
          id: `e${index}`,
          employeeId: `EMP-${index}`,
          firstName: 'Employee',
          lastName: String(index).padStart(2, '0'),
          email: `employee${index}@example.com`,
        }),
      ),
    );
    const { user } = renderPage();
    await screen.findByRole('table');

    expect(rowFor('Employee 00')).toBeInTheDocument();
    expect(rowFor('Employee 10')).not.toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Employee list pagination' })).toHaveTextContent(
      'Showing 1–10 of 12 employees',
    );

    await user.click(screen.getByRole('button', { name: 'Next' }));

    await findRow('Employee 10');
    expect(rowFor('Employee 00')).not.toBeInTheDocument();
  });
});
