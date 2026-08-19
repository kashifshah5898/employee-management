import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Employee } from '../types';
import { EmployeeFormDialog } from './EmployeeFormDialog';

const noop = () => {};

const SARAH: Employee = {
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
};

/**
 * The same component in both modes. Submitting hits the mock API, so the
 * pending and error states are reachable from here too.
 */
const meta = {
  title: 'Employee form',
  component: EmployeeFormDialog,
  args: { open: true, onClose: noop, onSaved: noop },
} satisfies Meta<typeof EmployeeFormDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = { args: { employee: null } };

export const Edit: Story = { args: { employee: SARAH } };
