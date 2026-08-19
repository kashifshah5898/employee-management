import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from './ui';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Wider variant for the employee form. */
  size?: 'sm' | 'md';
}

/**
 * Thin wrapper over the native <dialog> element, which already provides the
 * focus trap, Esc-to-close, backdrop and inert background that a hand-rolled
 * modal would have to reimplement.
 *
 * Children are only mounted while open, so each dialog starts from a clean
 * state instead of holding on to the previous employee's form values.
 */
export function Modal({ open, onClose, title, children, size = 'sm' }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = `${title.replace(/\s+/g, '-').toLowerCase()}-title`;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={`w-full rounded-xl bg-white p-0 text-slate-900 shadow-xl ${size === 'md' ? 'sm:max-w-2xl' : ''}`}
      style={size === 'md' ? { maxWidth: 'min(42rem, calc(100vw - 2rem))' } : undefined}
      // Esc fires `cancel`; let React own the open state rather than the DOM.
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      {open && (
        <div className="flex max-h-[inherit] flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            <Button
              variant="ghost"
              onClick={onClose}
              aria-label={`Close ${title.toLowerCase()} dialog`}
              className="-mr-2 -mt-1 px-2 py-1 text-xl leading-none"
            >
              <span aria-hidden="true">×</span>
            </Button>
          </header>
          {children}
        </div>
      )}
    </dialog>
  );
}
