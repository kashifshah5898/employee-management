export const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Sales',
  'Marketing',
  'HR',
  'Finance',
  'Operations',
] as const;

export const EMPLOYMENT_STATUSES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Intern',
] as const;

export type Department = (typeof DEPARTMENTS)[number];
export type EmploymentStatus = (typeof EMPLOYMENT_STATUSES)[number];

export interface Employee {
  /** Internal record id. */
  id: string;
  /** Human-readable code (EMP-0142). Generated on create, never user-editable. */
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: Department;
  employmentStatus: EmploymentStatus;
  /** ISO date, YYYY-MM-DD. */
  joiningDate: string;
  /** Lifecycle flag, flipped by the Deactivate action. */
  isActive: boolean;
}

/** The fields the shared create/edit form owns. */
export type EmployeeInput = Omit<Employee, 'id' | 'employeeId' | 'isActive'>;

/**
 * The status dropdown filters on two different facets: whether the employee is
 * still with the company, and what kind of contract they are on.
 */
export type StatusFilter = 'all' | 'active' | 'inactive' | EmploymentStatus;

export interface EmployeeQuery {
  search: string;
  department: Department | 'all';
  status: StatusFilter;
  page: number;
  pageSize: number;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const fullName = (e: Pick<Employee, 'firstName' | 'lastName'>) =>
  `${e.firstName} ${e.lastName}`;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Formats a YYYY-MM-DD string without going through Date, which would shift
 * the day for anyone west of UTC.
 */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  const name = MONTHS[Number(month) - 1];
  return name ? `${Number(day)} ${name} ${year}` : iso;
}
