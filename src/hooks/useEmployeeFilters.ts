import { useEffect, useMemo, useState } from 'react';
import {
  DEPARTMENTS,
  EMPLOYMENT_STATUSES,
  SORT_DIRECTIONS,
  SORT_FIELDS,
  type Department,
  type EmployeeQuery,
  type SortDirection,
  type SortField,
  type StatusFilter,
} from '../types';

export const PAGE_SIZE = 10;

const DEBOUNCE_MS = 300;

const DEPARTMENT_VALUES = ['all', ...DEPARTMENTS] as const;
const STATUS_VALUES = ['all', 'active', 'inactive', ...EMPLOYMENT_STATUSES] as const;

/** Anything from the URL is untrusted input; unknown values fall back. */
function oneOf<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function readFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const page = Number.parseInt(params.get('page') ?? '', 10);

  return {
    search: params.get('q') ?? '',
    department: oneOf(params.get('department'), DEPARTMENT_VALUES, 'all') as Department | 'all',
    status: oneOf(params.get('status'), STATUS_VALUES, 'all') as StatusFilter,
    sortBy: oneOf(params.get('sort'), SORT_FIELDS, 'name'),
    sortDir: oneOf(params.get('dir'), SORT_DIRECTIONS, 'asc'),
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

type FilterState = ReturnType<typeof readFromUrl>;

/**
 * Filters go in the URL so a view like "contract staff in Ops, newest first"
 * can be bookmarked and shared. `replaceState` rather than `pushState`: a
 * filter change is a refinement of where you are, not a new place, and pushing
 * one entry per keystroke-settled search would bury the back button.
 */
function writeToUrl(state: FilterState) {
  const url = new URL(window.location.href);
  const defaults = { q: '', department: 'all', status: 'all', sort: 'name', dir: 'asc', page: '1' };

  const set = (key: keyof typeof defaults, value: string) => {
    if (value === defaults[key]) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  };

  set('q', state.search);
  set('department', state.department);
  set('status', state.status);
  set('sort', state.sortBy);
  set('dir', state.sortDir);
  set('page', String(state.page));

  window.history.replaceState(null, '', url);
}

/**
 * Owns every input that feeds the list query. `search` is the live input value
 * so typing stays responsive; the query only changes once typing settles.
 */
export function useEmployeeFilters() {
  const [initial] = useState(readFromUrl);

  const [search, setSearch] = useState(initial.search);
  const [debouncedSearch, setDebouncedSearch] = useState(initial.search);
  const [department, setDepartmentValue] = useState(initial.department);
  const [status, setStatusValue] = useState(initial.status);
  const [sortBy, setSortBy] = useState<SortField>(initial.sortBy);
  const [sortDir, setSortDir] = useState<SortDirection>(initial.sortDir);
  const [page, setPage] = useState(initial.page);

  // A narrower result set can strand you on a page that no longer exists, so
  // applying a filter also returns to page one. That happens where the change
  // originates rather than in a second effect watching the first.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const setDepartment = (value: Department | 'all') => {
    setDepartmentValue(value);
    setPage(1);
  };

  const setStatus = (value: StatusFilter) => {
    setStatusValue(value);
    setPage(1);
  };

  /** Same column twice flips direction; a new column starts ascending. */
  const toggleSort = (field: SortField) => {
    setSortDir(field === sortBy && sortDir === 'asc' ? 'desc' : 'asc');
    setSortBy(field);
    setPage(1);
  };

  const setSort = (field: SortField, direction: SortDirection) => {
    setSortBy(field);
    setSortDir(direction);
    setPage(1);
  };

  useEffect(() => {
    writeToUrl({ search: debouncedSearch, department, status, sortBy, sortDir, page });
  }, [debouncedSearch, department, status, sortBy, sortDir, page]);

  const query: EmployeeQuery = useMemo(
    () => ({
      search: debouncedSearch,
      department,
      status,
      sortBy,
      sortDir,
      page,
      pageSize: PAGE_SIZE,
    }),
    [debouncedSearch, department, status, sortBy, sortDir, page],
  );

  const isFiltered = debouncedSearch !== '' || department !== 'all' || status !== 'all';

  /** Clears the filters but keeps the chosen sort, which is a display choice. */
  const clear = () => {
    setSearch('');
    setDebouncedSearch('');
    setDepartmentValue('all');
    setStatusValue('all');
    setPage(1);
  };

  return {
    query,
    search,
    setSearch,
    department,
    setDepartment,
    status,
    setStatus,
    sortBy,
    sortDir,
    toggleSort,
    setSort,
    page,
    setPage,
    isFiltered,
    clear,
  };
}
