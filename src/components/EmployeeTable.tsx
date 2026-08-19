import {
  SORT_FIELDS,
  SORT_LABELS,
  formatDate,
  fullName,
  type Employee,
  type SortDirection,
  type SortField,
} from '../types';
import { StatusBadge } from './StatusBadge';
import { Button, DeactivateIcon, EditIcon, IconButton, ReactivateIcon, ViewIcon } from './ui';

interface EmployeeTableProps {
  employees: Employee[];
  sortBy: SortField;
  sortDir: SortDirection;
  onSort: (field: SortField) => void;
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDeactivate: (employee: Employee) => void;
  onReactivate: (employee: Employee) => void;
}

type RowActionProps = Pick<
  EmployeeTableProps,
  'onView' | 'onEdit' | 'onDeactivate' | 'onReactivate'
>;

/**
 * Action buttons are shared by the desktop table and the mobile cards. Each
 * one names the employee it acts on, so "Edit" is never ambiguous out of
 * context for a screen reader, while the tooltip stays short.
 */
function RowActions({
  employee,
  onView,
  onEdit,
  onDeactivate,
  onReactivate,
}: { employee: Employee } & RowActionProps) {
  const name = fullName(employee);
  return (
    <div className="flex items-center gap-0.5">
      <IconButton label={`View details for ${name}`} tooltip="View" onClick={() => onView(employee)}>
        <ViewIcon />
      </IconButton>
      <IconButton label={`Edit ${name}`} tooltip="Edit" onClick={() => onEdit(employee)}>
        <EditIcon />
      </IconButton>
      {employee.isActive ? (
        <IconButton
          label={`Deactivate ${name}`}
          tooltip="Deactivate"
          tone="danger"
          onClick={() => onDeactivate(employee)}
        >
          <DeactivateIcon />
        </IconButton>
      ) : (
        // Reactivation is the exception, and an icon that differs from
        // "deactivate" by one stroke is not a discoverable way to offer it.
        // The labelled button is the point: an inactive row should say what
        // can be done about it.
        <Button
          variant="success"
          aria-label={`Reactivate ${name}`}
          onClick={() => onReactivate(employee)}
          className="ml-1 gap-1.5 py-1.5"
        >
          <ReactivateIcon />
          Reactivate
        </Button>
      )}
    </div>
  );
}

function SortableHeader({
  field,
  sortBy,
  sortDir,
  onSort,
}: { field: SortField } & Pick<EmployeeTableProps, 'sortBy' | 'sortDir' | 'onSort'>) {
  const active = sortBy === field;
  return (
    <th
      scope="col"
      aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
      className="px-4 py-3 font-medium text-slate-600"
    >
      <button
        type="button"
        onClick={() => onSort(field)}
        className="inline-flex items-center gap-1 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 hover:text-slate-900"
      >
        {SORT_LABELS[field]}
        <span aria-hidden="true" className={active ? 'text-slate-900' : 'text-slate-300'}>
          {active && sortDir === 'desc' ? '↓' : '↑'}
        </span>
      </button>
    </th>
  );
}

export function EmployeeTable({
  employees,
  sortBy,
  sortDir,
  onSort,
  ...actions
}: EmployeeTableProps) {
  return (
    <>
      {/* Desktop: a real table, so the column semantics survive. */}
      <table className="hidden w-full border-collapse text-left text-sm lg:table">
        <caption className="sr-only">
          Employees, sorted by {SORT_LABELS[sortBy].toLowerCase()},{' '}
          {sortDir === 'asc' ? 'ascending' : 'descending'}
        </caption>
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {SORT_FIELDS.map((field) => (
              <SortableHeader
                key={field}
                field={field}
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={onSort}
              />
            ))}
            <th scope="col" className="px-4 py-3 text-right font-medium text-slate-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {employees.map((employee) => (
            <tr key={employee.id} className="hover:bg-slate-50">
              <th scope="row" className="px-4 py-3 font-medium text-slate-900">
                {fullName(employee)}
              </th>
              <td className="px-4 py-3 font-mono text-xs text-slate-500">{employee.employeeId}</td>
              <td className="px-4 py-3 text-slate-700">{employee.jobTitle}</td>
              <td className="px-4 py-3 text-slate-700">{employee.department}</td>
              <td className="px-4 py-3">
                <StatusBadge
                  isActive={employee.isActive}
                  employmentStatus={employee.employmentStatus}
                />
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                {formatDate(employee.joiningDate)}
              </td>
              <td className="px-4 py-2">
                <div className="flex justify-end">
                  <RowActions employee={employee} {...actions} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile: a table cannot fit, so the same data becomes stacked cards. */}
      <ul className="divide-y divide-slate-100 lg:hidden">
        {employees.map((employee) => (
          <li key={employee.id} className="flex flex-col gap-2 p-4">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-medium text-slate-900">{fullName(employee)}</h3>
              <span className="font-mono text-xs text-slate-500">{employee.employeeId}</span>
            </div>
            <p className="text-sm text-slate-700">
              {employee.jobTitle} · {employee.department}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <StatusBadge
                isActive={employee.isActive}
                employmentStatus={employee.employmentStatus}
              />
              <span className="text-xs text-slate-500">
                Joined {formatDate(employee.joiningDate)}
              </span>
            </div>
            <div className="-mx-2 flex justify-end">
              <RowActions employee={employee} {...actions} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
