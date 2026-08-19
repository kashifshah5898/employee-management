import type { Meta, StoryObj } from '@storybook/react-vite';
import { EMPLOYMENT_STATUSES } from '../types';
import { StatusBadge } from './StatusBadge';

const meta = {
  title: 'Status badge',
  component: StatusBadge,
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = { args: { isActive: true, employmentStatus: 'Full-time' } };
export const Inactive: Story = { args: { isActive: false, employmentStatus: 'Contract' } };

/** Both facets the Status column has to carry, across every combination. */
export const AllCombinations: Story = {
  args: { isActive: true, employmentStatus: 'Full-time' },
  render: () => (
    <div className="flex flex-col gap-2">
      {[true, false].map((isActive) =>
        EMPLOYMENT_STATUSES.map((employmentStatus) => (
          <StatusBadge
            key={`${isActive}-${employmentStatus}`}
            isActive={isActive}
            employmentStatus={employmentStatus}
          />
        )),
      )}
    </div>
  ),
};
