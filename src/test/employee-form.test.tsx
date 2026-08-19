import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { findRow, givenEmployees, inTable, makeEmployee, renderPage, rowAction } from './utils';

describe('employee form', () => {
  it('blocks submission and explains every invalid field', async () => {
    givenEmployees([makeEmployee()]);
    const { user } = renderPage();
    await screen.findByRole('table');

    await user.click(screen.getByRole('button', { name: 'Add employee' }));
    const dialog = within(await screen.findByRole('dialog'));
    await user.click(dialog.getByRole('button', { name: 'Add employee' }));

    expect(await dialog.findByText('First name is required')).toBeInTheDocument();
    expect(dialog.getByText('Last name is required')).toBeInTheDocument();
    expect(dialog.getByText('Email is required')).toBeInTheDocument();
    expect(dialog.getByText('Job title is required')).toBeInTheDocument();
    expect(dialog.getByText('Department is required')).toBeInTheDocument();
    expect(dialog.getByText('Employment status is required')).toBeInTheDocument();
    expect(dialog.getByText('Joining date is required')).toBeInTheDocument();

    // The error is tied to its input, not just floating near it.
    expect(dialog.getByLabelText(/First Name/)).toHaveAccessibleDescription('First name is required');
    expect(dialog.getByLabelText(/First Name/)).toBeInvalid();
  });

  it('rejects a malformed email', async () => {
    givenEmployees([makeEmployee()]);
    const { user } = renderPage();
    await screen.findByRole('table');

    await user.click(screen.getByRole('button', { name: 'Add employee' }));
    const dialog = within(await screen.findByRole('dialog'));

    await user.type(dialog.getByLabelText(/Email/), 'not-an-email');
    await user.click(dialog.getByRole('button', { name: 'Add employee' }));

    expect(await dialog.findByText(/Enter a valid email address/)).toBeInTheDocument();
  });

  it('creates an employee and shows it in the list', async () => {
    givenEmployees([makeEmployee()]);
    const { user } = renderPage();
    await screen.findByRole('table');

    await user.click(screen.getByRole('button', { name: 'Add employee' }));
    const dialog = within(await screen.findByRole('dialog'));

    await user.type(dialog.getByLabelText(/First Name/), 'Priya');
    await user.type(dialog.getByLabelText(/Last Name/), 'Nair');
    await user.type(dialog.getByLabelText(/Email/), 'priya.nair@example.com');
    await user.type(dialog.getByLabelText(/Job Title/), 'Product Designer');
    await user.selectOptions(dialog.getByLabelText(/Department/), 'Design');
    await user.selectOptions(dialog.getByLabelText(/Employment Status/), 'Contract');
    await user.type(dialog.getByLabelText(/Joining Date/), '2024-06-03');
    await user.click(dialog.getByRole('button', { name: 'Add employee' }));

    expect(await findRow('Priya Nair')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Employee added.');
  });

  it('surfaces a server-side rejection on the field that caused it', async () => {
    givenEmployees([makeEmployee()]);
    const { user } = renderPage();
    await screen.findByRole('table');

    await user.click(screen.getByRole('button', { name: 'Add employee' }));
    const dialog = within(await screen.findByRole('dialog'));

    await user.type(dialog.getByLabelText(/First Name/), 'Duplicate');
    await user.type(dialog.getByLabelText(/Last Name/), 'Person');
    await user.type(dialog.getByLabelText(/Email/), 'sarah.chen@example.com');
    await user.type(dialog.getByLabelText(/Job Title/), 'Analyst');
    await user.selectOptions(dialog.getByLabelText(/Department/), 'Finance');
    await user.selectOptions(dialog.getByLabelText(/Employment Status/), 'Full-time');
    await user.type(dialog.getByLabelText(/Joining Date/), '2024-06-03');
    await user.click(dialog.getByRole('button', { name: 'Add employee' }));

    expect(
      await dialog.findByText('An employee with this email already exists.'),
    ).toBeInTheDocument();
    // The dialog stays open with the typed values intact.
    expect(dialog.getByLabelText(/First Name/)).toHaveValue('Duplicate');
  });

  it('reuses the same form to edit, pre-filled with the employee', async () => {
    givenEmployees([makeEmployee()]);
    const { user } = renderPage();
    await screen.findByRole('table');

    await user.click(rowAction('Edit Sarah Chen'));
    const dialog = within(await screen.findByRole('dialog'));

    expect(dialog.getByLabelText(/First Name/)).toHaveValue('Sarah');
    expect(dialog.getByLabelText(/Job Title/)).toHaveValue('Frontend Engineer');

    await user.clear(dialog.getByLabelText(/Job Title/));
    await user.type(dialog.getByLabelText(/Job Title/), 'Staff Engineer');
    await user.click(dialog.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(inTable().getByText('Staff Engineer')).toBeInTheDocument());
    expect(screen.getByRole('status')).toHaveTextContent('Employee updated.');
  });
});
