import { Button } from './ui';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <nav
      aria-label="Employee list pagination"
      className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      {/* Announced on change so keyboard and screen-reader users know they moved. */}
      <p className="text-sm text-slate-600" aria-live="polite">
        Showing <strong className="font-medium text-slate-900">{first}–{last}</strong> of{' '}
        <strong className="font-medium text-slate-900">{total}</strong> employees
      </p>
      <div className="flex items-center gap-2">
        <Button onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          Previous
        </Button>
        <span className="px-1 text-sm text-slate-600">
          Page {page} of {pageCount}
        </span>
        <Button onClick={() => onPageChange(page + 1)} disabled={page >= pageCount}>
          Next
        </Button>
      </div>
    </nav>
  );
}
