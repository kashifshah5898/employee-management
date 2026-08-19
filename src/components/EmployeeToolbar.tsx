import {
  DEPARTMENTS,
  EMPLOYMENT_STATUSES,
  SORT_DIRECTIONS,
  SORT_FIELDS,
  SORT_LABELS,
  type Department,
  type SortDirection,
  type SortField,
  type StatusFilter,
} from '../types';
import { Button, inputClass, selectClass } from './ui';

/** Reads better than "ascending" for most of these columns. */
const DIRECTION_LABELS: Record<SortField, [asc: string, desc: string]> = {
  name: ['A–Z', 'Z–A'],
  employeeId: ['ascending', 'descending'],
  jobTitle: ['A–Z', 'Z–A'],
  department: ['A–Z', 'Z–A'],
  status: ['active first', 'inactive first'],
  joiningDate: ['oldest first', 'newest first'],
};

interface EmployeeToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  department: Department | 'all';
  onDepartmentChange: (value: Department | 'all') => void;
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  sortBy: SortField;
  sortDir: SortDirection;
  onSortChange: (field: SortField, direction: SortDirection) => void;
  onAdd: () => void;
}

export function EmployeeToolbar({
  search,
  onSearchChange,
  department,
  onDepartmentChange,
  status,
  onStatusChange,
  sortBy,
  sortDir,
  onSortChange,
  onAdd,
}: EmployeeToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:items-end">
        <div className="flex flex-col gap-1.5 lg:w-64">
          <label htmlFor="employee-search" className="text-sm font-medium text-content">
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
          <label htmlFor="employee-department" className="text-sm font-medium text-content">
            Department
          </label>
          <select
            id="employee-department"
            value={department}
            onChange={(event) => onDepartmentChange(event.target.value as Department | 'all')}
            className={selectClass}
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
          <label htmlFor="employee-status" className="text-sm font-medium text-content">
            Status
          </label>
          {/* Two facets, one control: optgroup keeps them distinguishable. */}
          <select
            id="employee-status"
            value={status}
            onChange={(event) => onStatusChange(event.target.value as StatusFilter)}
            className={selectClass}
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

        {/* Below lg the table headings are gone, so sorting needs its own
            control. Above lg the column headers do this job. */}
        <div className="flex flex-col gap-1.5 lg:hidden">
          <label htmlFor="employee-sort" className="text-sm font-medium text-content">
            Sort by
          </label>
          <select
            id="employee-sort"
            value={`${sortBy}:${sortDir}`}
            onChange={(event) => {
              const [field, direction] = event.target.value.split(':');
              onSortChange(field as SortField, direction as SortDirection);
            }}
            className={selectClass}
          >
            {SORT_FIELDS.flatMap((field) =>
              SORT_DIRECTIONS.map((direction) => (
                <option key={`${field}:${direction}`} value={`${field}:${direction}`}>
                  {SORT_LABELS[field]} ({DIRECTION_LABELS[field][direction === 'asc' ? 0 : 1]})
                </option>
              )),
            )}
          </select>
        </div>
      </div>

      <Button variant="primary" onClick={onAdd} className="lg:shrink-0">
        Add employee
      </Button>
    </div>
  );
}
