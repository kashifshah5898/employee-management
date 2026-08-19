import {
  fullName,
  type Employee,
  type EmployeeInput,
  type EmployeeQuery,
  type Paginated,
} from '../types';
import { createSeedEmployees } from './seed';

export const STORAGE_KEY = 'ems.employees.v1';
export const FAILURE_KEY = 'ems.simulate-failure';

/** Fake round-trip time, so loading states are actually observable. */
const MIN_LATENCY = 320;
const MAX_LATENCY = 520;

/**
 * Errors the mock backend can raise. `field` lets the form map a server
 * rejection back onto the input that caused it instead of only showing a
 * banner.
 */
export class ApiError extends Error {
  readonly field?: keyof EmployeeInput;

  constructor(message: string, field?: keyof EmployeeInput) {
    super(message);
    this.name = 'ApiError';
    this.field = field;
  }
}

/* ------------------------------------------------------------------ *
 * Failure injection
 *
 * Requirement 6 asks the UI to demonstrate a failing API call. That is
 * only demonstrable on a deployed demo if the reviewer can trigger it,
 * hence a toggle rather than a code path nobody can reach.
 * ------------------------------------------------------------------ */

export function isFailureSimulated(): boolean {
  if (typeof window === 'undefined') return false;
  if (new URLSearchParams(window.location.search).has('fail')) return true;
  return window.localStorage.getItem(FAILURE_KEY) === 'true';
}

export function setFailureSimulated(value: boolean): void {
  window.localStorage.setItem(FAILURE_KEY, String(value));
}

/* ------------------------------------------------------------------ *
 * Persistence
 * ------------------------------------------------------------------ */

let cache: Employee[] | null = null;

function read(): Employee[] {
  if (cache) return cache;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    cache = stored ? (JSON.parse(stored) as Employee[]) : createSeedEmployees();
  } catch {
    // Corrupt or unavailable storage must not take the page down.
    cache = createSeedEmployees();
  }
  return cache;
}

function write(employees: Employee[]): void {
  cache = employees;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  } catch {
    // Private-mode / quota failures: the in-memory cache still works for
    // this session, which is enough for a demo.
  }
}

/** Test + demo helper: wipe local changes and start from the seed dataset. */
export function resetEmployees(): void {
  cache = null;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

function request<T>(work: () => T): Promise<T> {
  const latency = MIN_LATENCY + Math.random() * (MAX_LATENCY - MIN_LATENCY);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (isFailureSimulated()) {
        reject(new ApiError('The employee service is unavailable (503).'));
        return;
      }
      try {
        resolve(work());
      } catch (error) {
        reject(error);
      }
    }, latency);
  });
}

/* ------------------------------------------------------------------ *
 * Endpoints
 * ------------------------------------------------------------------ */

function matches(employee: Employee, query: EmployeeQuery): boolean {
  const search = query.search.trim().toLowerCase();
  if (search && !fullName(employee).toLowerCase().includes(search)) return false;
  if (query.department !== 'all' && employee.department !== query.department) return false;

  switch (query.status) {
    case 'all':
      return true;
    case 'active':
      return employee.isActive;
    case 'inactive':
      return !employee.isActive;
    default:
      return employee.employmentStatus === query.status;
  }
}

/**
 * Filtering, sorting and slicing all happen here rather than in the client:
 * the component only ever holds one page of rows, which is the same contract
 * a real paginated endpoint would offer.
 */
export function listEmployees(query: EmployeeQuery): Promise<Paginated<Employee>> {
  return request(() => {
    const filtered = read()
      .filter((employee) => matches(employee, query))
      .sort((a, b) => fullName(a).localeCompare(fullName(b)));

    const start = (query.page - 1) * query.pageSize;
    return {
      data: filtered.slice(start, start + query.pageSize),
      total: filtered.length,
      page: query.page,
      pageSize: query.pageSize,
    };
  });
}

function assertEmailAvailable(employees: Employee[], email: string, ignoreId?: string): void {
  const taken = employees.some(
    (employee) =>
      employee.id !== ignoreId && employee.email.toLowerCase() === email.trim().toLowerCase(),
  );
  if (taken) {
    throw new ApiError('An employee with this email already exists.', 'email');
  }
}

function nextEmployeeId(employees: Employee[]): string {
  const highest = employees.reduce((max, employee) => {
    const parsed = Number.parseInt(employee.employeeId.replace(/\D/g, ''), 10);
    return Number.isNaN(parsed) ? max : Math.max(max, parsed);
  }, 0);
  return `EMP-${String(highest + 1).padStart(4, '0')}`;
}

export function createEmployee(input: EmployeeInput): Promise<Employee> {
  return request(() => {
    const employees = read();
    assertEmailAvailable(employees, input.email);

    const employee: Employee = {
      ...input,
      email: input.email.trim().toLowerCase(),
      id: crypto.randomUUID(),
      employeeId: nextEmployeeId(employees),
      isActive: true,
    };
    write([employee, ...employees]);
    return employee;
  });
}

export function updateEmployee(id: string, input: EmployeeInput): Promise<Employee> {
  return request(() => {
    const employees = read();
    const existing = employees.find((employee) => employee.id === id);
    if (!existing) throw new ApiError('That employee no longer exists.');
    assertEmailAvailable(employees, input.email, id);

    const updated: Employee = { ...existing, ...input, email: input.email.trim().toLowerCase() };
    write(employees.map((employee) => (employee.id === id ? updated : employee)));
    return updated;
  });
}

export function deactivateEmployee(id: string): Promise<Employee> {
  return request(() => {
    const employees = read();
    const existing = employees.find((employee) => employee.id === id);
    if (!existing) throw new ApiError('That employee no longer exists.');

    const updated: Employee = { ...existing, isActive: false };
    write(employees.map((employee) => (employee.id === id ? updated : employee)));
    return updated;
  });
}
