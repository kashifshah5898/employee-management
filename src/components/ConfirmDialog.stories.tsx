import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConfirmDialog } from './ConfirmDialog';

const noop = () => {};

const meta = {
  title: 'Confirm dialog',
  component: ConfirmDialog,
  args: {
    open: true,
    title: 'Deactivate employee',
    description:
      'Sarah Chen will be marked as inactive and will no longer appear under active employees. Their record stays in the system and their details remain viewable.',
    confirmLabel: 'Deactivate',
    pendingLabel: 'Deactivating…',
    isPending: false,
    onConfirm: noop,
    onClose: noop,
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Pending: Story = { args: { isPending: true } };

/** A failed confirmation keeps the dialog open and offers the action again. */
export const Failed: Story = {
  args: { error: 'Could not deactivate. The employee service is unavailable (503).' },
};
