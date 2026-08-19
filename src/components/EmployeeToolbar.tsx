import {
  DEPARTMENTS,
  EMPLOYMENT_STATUSES,
  type Department,
  type StatusFilter,
} from '../types';
import { Button, inputClass } from './ui';

interface EmployeeToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  department: Department | 'all';
  onDepartmentChange: (value: Department | 'all') => void;
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  onAdd: () => void;
}

export function EmployeeToolbar({
  search,
  onSearchChange,
  department,
  onDepartmentChange,
  status,
  onStatusChange,
  onAdd,
}: EmployeeToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:items-end">
        <div className="flex flex-col gap-1.5 lg:w-64">
          <label htmlFor="employee-search" className="text-sm font-medium text-slate-700">
            Search by name
          </label>
          <input
            id="employee-search"
            type="search"
            value={search}
            placeholder="e.g. Sarah Chen"
            onChange={(event) => onSearchChange(event.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5 lg:w-48">
          <label htmlFor="employee-department" className="text-sm font-medium text-slate-700">
            Department
          </label>
          <select
            id="employee-department"
            value={department}
            onChange={(event) => onDepartmentChange(event.target.value as Department | 'all')}
            className={inputClass}
          >
            <option value="all">All departments</option>
            {DEPARTMENTS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 lg:w-48">
          <label htmlFor="employee-status" className="text-sm font-medium text-slate-700">
            Status
          </label>
          {/* Two facets, one control: optgroup keeps them distinguishable. */}
          <select
            id="employee-status"
            value={status}
            onChange={(event) => onStatusChange(event.target.value as StatusFilter)}
            className={inputClass}
          >
            <option value="all">All statuses</option>
            <optgroup label="Activity">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </optgroup>
            <optgroup label="Employment type">
              {EMPLOYMENT_STATUSES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      <Button variant="primary" onClick={onAdd} className="lg:shrink-0">
        Add employee
      </Button>
    </div>
  );
}
