import type { Employee } from '../types';

/**
 * The list has one Status column but two facets to show: whether the employee
 * is still active, and what contract they are on.
 */
export function StatusBadge({
  isActive,
  employmentStatus,
}: Pick<Employee, 'isActive' | 'employmentStatus'>) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
          isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
        }`}
      >
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}
        />
        {isActive ? 'Active' : 'Inactive'}
      </span>
      <span className="text-xs text-slate-500">{employmentStatus}</span>
    </span>
  );
}
