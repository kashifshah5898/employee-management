import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import { expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { STORAGE_KEY, resetEmployees } from '../api/employees';
import { EmployeeListPage } from '../components/EmployeeListPage';
import type { Employee } from '../types';

export function makeEmployee(overrides: Partial<Employee> = {}): Employee {
  return {
    id: 'e1',
    employeeId: 'EMP-0001',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen@example.com',
    jobTitle: 'Frontend Engineer',
    department: 'Engineering',
    employmentStatus: 'Full-time',
    joiningDate: '2021-03-12',
    isActive: true,
    ...overrides,
  };
}

/** Replaces the seed dataset so assertions do not depend on 247 fixtures. */
export function givenEmployees(employees: Employee[]) {
  resetEmployees();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
}

export function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return {
    user: userEvent.setup(),
    ...render(
      <QueryClientProvider client={queryClient}>
        <EmployeeListPage />
      </QueryClientProvider>,
    ),
  };
}

/**
 * The desktop table and the mobile cards render the same rows; only CSS hides
 * one of them, and jsdom applies no CSS. Tests therefore assert against the
 * table and click the table's copy of each action button.
 */
export const inTable = () => within(screen.getByRole('table'));

export const rowFor = (name: string) => inTable().queryByText(name);

export const rowAction = (name: string) => screen.getAllByRole('button', { name })[0];

/** Waits for a row to appear in the table after a refetch. */
export const findRow = (name: string) =>
  waitFor(() => {
    const row = rowFor(name);
    expect(row).not.toBeNull();
    return row;
  });
