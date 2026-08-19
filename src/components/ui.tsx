import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent text-accent-content hover:opacity-90',
  secondary: 'border border-line bg-surface text-content hover:bg-surface-muted',
  success: 'border border-success-line bg-success-surface text-success-content hover:opacity-90',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-content-muted hover:bg-surface-muted hover:text-content',
};

// Tailwind v4's preflight sets `cursor: default` on buttons, so pointer is
// opt-in rather than inherited from the browser default.
const BUTTON_BASE =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = 'secondary', className = '', ...props }: ButtonProps) {
  return <button className={`${BUTTON_BASE} ${VARIANTS[variant]} ${className}`} {...props} />;
}

export const inputClass =
  'w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-content focus:border-accent focus:outline-2 focus:outline-offset-0 focus:outline-accent aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:outline-red-500';

/** Same as an input, but a select is a click target rather than a text field. */
export const selectClass = `${inputClass} cursor-pointer`;

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
      <label htmlFor={id} className="text-sm font-medium text-content">
        {label}
        {required && (
          <span className="ml-0.5 text-danger-content" aria-hidden="true">
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
        <p id={errorId} role="alert" className="text-sm text-danger-content">
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
      className="flex flex-col gap-3 rounded-md border border-danger-line bg-danger-surface p-3 text-sm text-danger-content sm:flex-row sm:items-center sm:justify-between"
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
 * Icon actions
 * ------------------------------------------------------------------ */

type Tone = 'default' | 'danger' | 'success';

const TONES: Record<Tone, string> = {
  default: 'text-content-subtle hover:bg-surface-muted hover:text-content',
  danger: 'text-content-subtle hover:bg-danger-surface hover:text-danger-content',
  success: 'text-success-content hover:bg-success-surface',
};

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Full accessible name, e.g. "Deactivate Sarah Chen". */
  label: string;
  /** Short visible tooltip, e.g. "Deactivate". Must be part of `label`. */
  tooltip: string;
  tone?: Tone;
}

/**
 * Icon-only action with a tooltip that appears on hover *and* on keyboard
 * focus, so it isn't mouse-only. The tooltip is decorative — the button's real
 * name comes from `aria-label`, which names the employee too.
 */
export function IconButton({
  label,
  tooltip,
  tone = 'default',
  className = '',
  children,
  ...props
}: IconButtonProps) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label={label}
        className={`inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50 ${TONES[tone]} ${className}`}
        {...props}
      >
        {children}
      </button>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 rounded-md bg-accent px-2 py-1 text-xs font-medium whitespace-nowrap text-accent-content opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {tooltip}
        <span className="absolute top-full left-1/2 -mt-1 h-2 w-2 -translate-x-1/2 rotate-45 bg-accent" />
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

export const SunIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

export const MoonIcon = () => (
  <svg {...iconProps}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
  </svg>
);

export const SystemIcon = () => (
  <svg {...iconProps}>
    <rect x="2" y="4" width="20" height="13" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);
