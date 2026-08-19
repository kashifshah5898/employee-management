import { formatDate, fullName, type Employee } from '../types';
import { StatusBadge } from './StatusBadge';
import { Button } from './ui';

interface EmployeeTableProps {
  employees: Employee[];
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDeactivate: (employee: Employee) => void;
}

/**
 * Action buttons are shared by the desktop table and the mobile cards. Each
 * one names the employee it acts on, so "Edit" is never ambiguous out of
 * context for a screen reader.
 */
function RowActions({
  employee,
  onView,
  onEdit,
  onDeactivate,
}: { employee: Employee } & Omit<EmployeeTableProps, 'employees'>) {
  const name = fullName(employee);
  return (
    <div className="flex flex-wrap items-center gap-1">
      <Button variant="ghost" onClick={() => onView(employee)} aria-label={`View details for ${name}`}>
        View
      </Button>
      <Button variant="ghost" onClick={() => onEdit(employee)} aria-label={`Edit ${name}`}>
        Edit
      </Button>
      {employee.isActive && (
        <Button
          variant="ghost"
          onClick={() => onDeactivate(employee)}
          aria-label={`Deactivate ${name}`}
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          Deactivate
        </Button>
      )}
    </div>
  );
}

const HEADERS = ['Name', 'Employee ID', 'Job Title', 'Department', 'Status', 'Joining Date'];

export function EmployeeTable({ employees, ...actions }: EmployeeTableProps) {
  return (
    <>
      {/* Desktop: a real table, so the column semantics survive. */}
      <table className="hidden w-full border-collapse text-left text-sm lg:table">
        <caption className="sr-only">Employees</caption>
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {HEADERS.map((header) => (
              <th key={header} scope="col" className="px-4 py-3 font-medium text-slate-600">
                {header}
              </th>
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
                <StatusBadge isActive={employee.isActive} employmentStatus={employee.employmentStatus} />
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
              <StatusBadge isActive={employee.isActive} employmentStatus={employee.employmentStatus} />
              <span className="text-xs text-slate-500">
                Joined {formatDate(employee.joiningDate)}
              </span>
            </div>
            <div className="-mx-1 mt-1">
              <RowActions employee={employee} {...actions} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
