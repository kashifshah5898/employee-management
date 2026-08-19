import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Employee } from '../types';
import { EmployeeTable } from './EmployeeTable';
import { ListEmpty, ListError, ListLoading } from './states';

const employee = (overrides: Partial<Employee> & { id: string }): Employee => ({
  employeeId: `EMP-${overrides.id.padStart(4, '0')}`,
  firstName: 'Sarah',
  lastName: 'Chen',
  email: 'sarah.chen@example.com',
  jobTitle: 'Frontend Engineer',
  department: 'Engineering',
  employmentStatus: 'Full-time',
  joiningDate: '2021-03-12',
  isActive: true,
  ...overrides,
});

const EMPLOYEES: Employee[] = [
  employee({ id: '1' }),
  employee({
    id: '2',
    firstName: 'Omar',
    lastName: 'Farouk',
    jobTitle: 'Account Executive',
    department: 'Sales',
    employmentStatus: 'Contract',
    joiningDate: '2019-11-04',
  }),
  employee({
    id: '3',
    firstName: 'Priya',
    lastName: 'Nair',
    jobTitle: 'Product Designer',
    department: 'Design',
    employmentStatus: 'Part-time',
    joiningDate: '2023-01-23',
    isActive: false,
  }),
];

const noop = () => {};

/**
 * The four states the list can be in. Each is a separate component, so the page
 * picks one rather than threading flags through the table.
 */
const meta = {
  title: 'Employee list',
  component: EmployeeTable,
  parameters: { layout: 'fullscreen' },
  args: {
    employees: EMPLOYEES,
    sortBy: 'name',
    sortDir: 'asc',
    onSort: noop,
    onView: noop,
    onEdit: noop,
    onDeactivate: noop,
    onReactivate: noop,
  },
  decorators: [
    (Story) => (
      <div className="bg-slate-50 p-6">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof EmployeeTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Populated: Story = {};

/** Resize the preview below 1024px to see the table become stacked cards. */
export const SingleRow: Story = { args: { employees: [EMPLOYEES[0]] } };

/** An inactive employee offers Reactivate in place of Deactivate. */
export const InactiveEmployee: Story = { args: { employees: [EMPLOYEES[2]] } };

export const SortedByJoiningDate: Story = {
  args: { sortBy: 'joiningDate', sortDir: 'desc' },
};

export const Loading: Story = {
  args: { employees: [] },
  render: () => <ListLoading />,
};

export const Empty: Story = {
  args: { employees: [] },
  render: () => <ListEmpty isFiltered={false} onClear={noop} onAdd={noop} />,
};

export const EmptyAfterFiltering: Story = {
  args: { employees: [] },
  render: () => <ListEmpty isFiltered onClear={noop} onAdd={noop} />,
};

export const Error: Story = {
  args: { employees: [] },
  render: () => (
    <ListError message="The employee service is unavailable (503)." onRetry={noop} isRetrying={false} />
  ),
};

export const Retrying: Story = {
  args: { employees: [] },
  render: () => (
    <ListError message="The employee service is unavailable (503)." onRetry={noop} isRetrying />
  ),
};
