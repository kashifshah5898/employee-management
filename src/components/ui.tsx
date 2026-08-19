import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-slate-900 text-white hover:bg-slate-700',
  secondary: 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = 'secondary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}

export const inputClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-2 focus:outline-offset-0 focus:outline-slate-900 aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:outline-red-500';

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  /** Receives the a11y wiring so every control is labelled and described the same way. */
  children: (props: {
    id: string;
    'aria-invalid': boolean;
    'aria-describedby': string | undefined;
  }) => ReactNode;
}

/**
 * Single place where a label, its control and its error message get tied
 * together. Keeps requirement 7 (accessible labels, errors clearly
 * communicated) from drifting field by field.
 */
export function Field({ id, label, error, required, children }: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
        {required && (
          <span className="ml-0.5 text-red-600" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children({
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': error ? errorId : undefined,
      })}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

/** Inline failure notice with a recovery action (requirement 6). */
export function ErrorBanner({
  message,
  onRetry,
  retryLabel = 'Try again',
  isRetrying,
}: {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  isRetrying?: boolean;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
    >
      <span>{message}</span>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} disabled={isRetrying} className="shrink-0">
          {isRetrying ? 'Retrying…' : retryLabel}
        </Button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Row actions
 * ------------------------------------------------------------------ */

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Full accessible name, e.g. "Deactivate Sarah Chen". */
  label: string;
  /** Short visible tooltip, e.g. "Deactivate". Must be part of `label`. */
  tooltip: string;
  tone?: 'default' | 'danger';
}

/**
 * Icon-only action with a tooltip that appears on hover *and* on keyboard
 * focus, so it isn't mouse-only. The tooltip is decorative — the button's real
 * name comes from `aria-label`, which names the employee too.
 */
export function IconButton({ label, tooltip, tone = 'default', children, ...props }: IconButtonProps) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label={label}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:pointer-events-none disabled:opacity-50 ${
          tone === 'danger'
            ? 'text-slate-500 hover:bg-red-50 hover:text-red-700'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
        }`}
        {...props}
      >
        {children}
      </button>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 translate-y-1 rounded bg-slate-900 px-2 py-1 text-xs font-medium whitespace-nowrap text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
      >
        {tooltip}
      </span>
    </span>
  );
}

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className: 'h-5 w-5',
  'aria-hidden': true,
} as const;

export const ViewIcon = () => (
  <svg {...iconProps}>
    <path d="M2.04 12.32a1 1 0 0 1 0-.64C3.42 7.51 7.36 4.5 12 4.5s8.57 3.01 9.96 7.18a1 1 0 0 1 0 .64C20.58 16.49 16.64 19.5 12 19.5s-8.57-3.01-9.96-7.18Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EditIcon = () => (
  <svg {...iconProps}>
    <path d="m16.86 4.49 1.69-1.69a1.875 1.875 0 1 1 2.65 2.65L10.58 16.07a4.5 4.5 0 0 1-1.9 1.13L6 18l.8-2.69a4.5 4.5 0 0 1 1.13-1.9l8.93-8.92Z" />
    <path d="M16.86 4.49 19.5 7.13" />
  </svg>
);

export const DeactivateIcon = () => (
  <svg {...iconProps}>
    <path d="M22 10.5h-6" />
    <path d="M13.75 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Z" />
    <path d="M4 19.24v-.11a6.375 6.375 0 0 1 12.75 0v.11A12.32 12.32 0 0 1 10.37 21c-2.33 0-4.51-.65-6.37-1.76Z" />
  </svg>
);

export const ReactivateIcon = () => (
  <svg {...iconProps}>
    <path d="M19 7.5v6M22 10.5h-6" />
    <path d="M13.75 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Z" />
    <path d="M4 19.24v-.11a6.375 6.375 0 0 1 12.75 0v.11A12.32 12.32 0 0 1 10.37 21c-2.33 0-4.51-.65-6.37-1.76Z" />
  </svg>
);
