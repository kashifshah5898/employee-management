import { Button, ErrorBanner } from './ui';

/** Skeleton rows keep the layout stable while the first page loads. */
export function ListLoading({ rows = 5 }: { rows?: number }) {
  return (
    <div className="p-4" role="status" aria-live="polite">
      <span className="sr-only">Loading employees…</span>
      <div className="animate-pulse space-y-3">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="h-4 w-1/4 rounded bg-slate-200" />
            <div className="h-4 w-1/6 rounded bg-slate-200" />
            <div className="hidden h-4 w-1/5 rounded bg-slate-200 sm:block" />
            <div className="hidden h-4 w-1/6 rounded bg-slate-200 md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListEmpty({
  isFiltered,
  onClear,
  onAdd,
}: {
  isFiltered: boolean;
  onClear: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <h3 className="text-base font-semibold text-slate-900">
        {isFiltered ? 'No employees match your filters' : 'No employees yet'}
      </h3>
      <p className="max-w-sm text-sm text-slate-500">
        {isFiltered
          ? 'Try a different name, department or status — or clear the filters to see everyone.'
          : 'Add your first employee to get started.'}
      </p>
      {isFiltered ? (
        <Button onClick={onClear}>Clear filters</Button>
      ) : (
        <Button variant="primary" onClick={onAdd}>
          Add employee
        </Button>
      )}
    </div>
  );
}

export function ListError({ message, onRetry, isRetrying }: {
  message: string;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <div className="p-4">
      <ErrorBanner
        message={`Could not load employees. ${message}`}
        onRetry={onRetry}
        retryLabel="Retry"
        isRetrying={isRetrying}
      />
    </div>
  );
}
