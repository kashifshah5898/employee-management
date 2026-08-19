import { Modal } from './Modal';
import { Button, ErrorBanner } from './ui';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  pendingLabel: string;
  isPending: boolean;
  error?: string;
  /** Reactivating is not destructive, so it does not get the red button. */
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
  onClose: () => void;
}

/** Deactivation never fires straight from the row (requirement 4). */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  pendingLabel,
  isPending,
  error,
  variant = 'danger',
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4 p-5">
        <p className="text-sm text-content-muted">{description}</p>
        {error && <ErrorBanner message={error} onRetry={onConfirm} isRetrying={isPending} />}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant={variant} onClick={onConfirm} disabled={isPending}>
            {isPending ? pendingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
