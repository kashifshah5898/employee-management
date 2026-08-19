import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  FAILURE_KEY,
  isFailureSimulated,
  listEmployees,
  setFailureSimulated,
} from '../api/employees';
import type { EmployeeQuery } from '../types';
import { givenEmployees, inTable, makeEmployee, renderPage, rowAction, rowFor } from './utils';

const query = (overrides: Partial<EmployeeQuery> = {}): EmployeeQuery => ({
  search: '',
  department: 'all',
  status: 'all',
  sortBy: 'name',
  sortDir: 'asc',
  page: 1,
  pageSize: 10,
  ...overrides,
});

describe('?fail=1 can be switched back off', () => {
  it('seeds the initial value without overriding the toggle', () => {
    window.history.replaceState(null, '', '/?fail=1');
    expect(isFailureSimulated()).toBe(true);

    // Unticking the toggle has to win, or a reviewer arriving through that
    // link could never recover.
    setFailureSimulated(false);
    expect(isFailureSimulated()).toBe(false);

    setFailureSimulated(true);
    expect(isFailureSimulated()).toBe(true);
  });

  it('falls back to the stored flag when the parameter is absent', () => {
    expect(isFailureSimulated()).toBe(false);
    window.localStorage.setItem(FAILURE_KEY, 'true');
    expect(isFailureSimulated()).toBe(true);
  });
});

describe('a page beyond the end of the result set', () => {
  it('is clamped by the API rather than answered with an empty slice', async () => {
    givenEmployees(
      Array.from({ length: 11 }, (_, index) =>
        makeEmployee({
          id: `e${index}`,
          employeeId: `EMP-${index}`,
          lastName: String(index).padStart(2, '0'),
          email: `e${index}@example.com`,
        }),
      ),
    );

    const result = await listEmployees(query({ page: 99 }));

    expect(result.page).toBe(2);
    expect(result.data).toHaveLength(1);
  });

  it('never leaves the UI on an empty last page after a deactivation', async () => {
    // 11 active employees: page 2 holds exactly one row, and deactivating it
    // shrinks the filtered set to a single page.
    givenEmployees(
      Array.from({ length: 11 }, (_, index) =>
        makeEmployee({
          id: `e${index}`,
          employeeId: `EMP-${index}`,
          firstName: 'Employee',
          lastName: String(index).padStart(2, '0'),
          email: `e${index}@example.com`,
        }),
      ),
    );
    const { user } = renderPage();
    await screen.findByRole('table');

    await user.selectOptions(screen.getByLabelText('Status'), 'active');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(rowFor('Employee 10')).toBeInTheDocument());

    await user.click(rowAction('Deactivate Employee 10'));
    const dialog = within(await screen.findByRole('dialog'));
    await user.click(dialog.getByRole('button', { name: 'Deactivate' }));

    await waitFor(() => expect(rowFor('Employee 00')).toBeInTheDocument());
    expect(inTable().getAllByRole('row').length).toBeGreaterThan(1);
    expect(
      screen.getByRole('navigation', { name: 'Employee list pagination' }),
    ).toHaveTextContent('Showing 1–10 of 10 employees');
  });
});

describe('a newly created employee', () => {
  it('is on screen after the form closes, whatever the sort puts first', async () => {
    // Sorted by name, "Zed Zulu" lands on the last page — the confirmation
    // used to appear with the new record nowhere in sight.
    givenEmployees(
      Array.from({ length: 15 }, (_, index) =>
        makeEmployee({
          id: `e${index}`,
          employeeId: `EMP-${index}`,
          firstName: 'Aaron',
          lastName: String(index).padStart(2, '0'),
          email: `e${index}@example.com`,
        }),
      ),
    );
    const { user } = renderPage();
    await screen.findByRole('table');

    await user.click(screen.getByRole('button', { name: 'Add employee' }));
    const dialog = within(await screen.findByRole('dialog'));
    await user.type(dialog.getByLabelText(/First Name/), 'Zed');
    await user.type(dialog.getByLabelText(/Last Name/), 'Zulu');
    await user.type(dialog.getByLabelText(/Email/), 'zed.zulu@example.com');
    await user.type(dialog.getByLabelText(/Job Title/), 'Operations Lead');
    await user.selectOptions(dialog.getByLabelText(/Department/), 'Operations');
    await user.selectOptions(dialog.getByLabelText(/Employment Status/), 'Full-time');
    await user.type(dialog.getByLabelText(/Joining Date/), '2024-06-03');
    await user.click(dialog.getByRole('button', { name: 'Add employee' }));

    await waitFor(() => expect(rowFor('Zed Zulu')).toBeInTheDocument());
    expect(screen.getByRole('status')).toHaveTextContent('Employee added.');
  });
});

describe('reactivating an employee', () => {
  it('is a labelled button, not an icon that differs from Deactivate by one stroke', async () => {
    givenEmployees([makeEmployee({ isActive: false })]);
    renderPage();
    await screen.findByRole('table');

    expect(rowAction('Reactivate Sarah Chen')).toHaveTextContent('Reactivate');
  });

  it('can also be reached from the details dialog', async () => {
    givenEmployees([makeEmployee({ isActive: false })]);
    const { user } = renderPage();
    await screen.findByRole('table');

    await user.click(rowAction('View details for Sarah Chen'));
    const details = within(await screen.findByRole('dialog'));
    await user.click(details.getByRole('button', { name: 'Reactivate employee' }));

    await user.click(await screen.findByRole('button', { name: 'Reactivate' }));

    await waitFor(() => expect(inTable().getByText('Active')).toBeInTheDocument());
    expect(screen.getByRole('status')).toHaveTextContent('Sarah Chen has been reactivated.');
  });

  it('offers Reactivate instead of Deactivate, and restores them', async () => {
    givenEmployees([makeEmployee({ isActive: false })]);
    const { user } = renderPage();
    await screen.findByRole('table');

    expect(screen.queryByRole('button', { name: 'Deactivate Sarah Chen' })).not.toBeInTheDocument();
    await user.click(rowAction('Reactivate Sarah Chen'));

    const dialog = within(await screen.findByRole('dialog'));
    expect(dialog.getByText(/will be marked as active again/)).toBeInTheDocument();
    await user.click(dialog.getByRole('button', { name: 'Reactivate' }));

    await waitFor(() => expect(inTable().getByText('Active')).toBeInTheDocument());
    expect(screen.getByRole('status')).toHaveTextContent('Sarah Chen has been reactivated.');
  });
});

describe('sorting', () => {
  it('reorders through the column headers and reports direction to assistive tech', async () => {
    givenEmployees([
      makeEmployee({ id: 'a', firstName: 'Aisha', email: 'a@example.com' }),
      makeEmployee({ id: 'z', firstName: 'Zara', employeeId: 'EMP-0002', email: 'z@example.com' }),
    ]);
    const { user } = renderPage();
    await screen.findByRole('table');

    const names = () => inTable().getAllByRole('rowheader').map((cell) => cell.textContent);
    expect(names()).toEqual(['Aisha Chen', 'Zara Chen']);

    await user.click(inTable().getByRole('button', { name: /Name/ }));

    await waitFor(() => expect(names()).toEqual(['Zara Chen', 'Aisha Chen']));
    expect(inTable().getAllByRole('columnheader')[0]).toHaveAttribute('aria-sort', 'descending');
  });
});

describe('filters in the URL', () => {
  it('restores a shared view on load', async () => {
    givenEmployees([
      makeEmployee(),
      makeEmployee({
        id: 'e2',
        employeeId: 'EMP-0002',
        firstName: 'Omar',
        lastName: 'Farouk',
        email: 'omar@example.com',
        department: 'Finance',
      }),
    ]);
    window.history.replaceState(null, '', '/?department=Finance&sort=joiningDate&dir=desc');
    renderPage();

    await screen.findByRole('table');
    expect(rowFor('Omar Farouk')).toBeInTheDocument();
    expect(rowFor('Sarah Chen')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Department')).toHaveValue('Finance');
  });

  it('writes the current view back to the URL', async () => {
    givenEmployees([makeEmployee()]);
    const { user } = renderPage();
    await screen.findByRole('table');

    await user.selectOptions(screen.getByLabelText('Status'), 'inactive');

    await waitFor(() => expect(window.location.search).toContain('status=inactive'));
    // Defaults stay out of the URL rather than cluttering a shared link.
    expect(window.location.search).not.toContain('page=1');
    expect(window.location.search).not.toContain('sort=name');
  });

  it('ignores junk parameters instead of breaking the query', async () => {
    givenEmployees([makeEmployee()]);
    window.history.replaceState(null, '', '/?department=Atlantis&status=%3Cscript%3E&page=-4');
    renderPage();

    await screen.findByRole('table');
    expect(rowFor('Sarah Chen')).toBeInTheDocument();
    expect(screen.getByLabelText('Department')).toHaveValue('all');
  });
});
