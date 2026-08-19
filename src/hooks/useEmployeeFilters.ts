import { useEffect, useMemo, useState } from 'react';
import type { Department, EmployeeQuery, StatusFilter } from '../types';

export const PAGE_SIZE = 10;

const DEBOUNCE_MS = 300;

/**
 * Owns every input that feeds the list query. `search` is the live input value
 * so typing stays responsive; the query only changes once typing settles.
 */
export function useEmployeeFilters() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [department, setDepartmentValue] = useState<Department | 'all'>('all');
  const [status, setStatusValue] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);

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

  const query: EmployeeQuery = useMemo(
    () => ({ search: debouncedSearch, department, status, page, pageSize: PAGE_SIZE }),
    [debouncedSearch, department, status, page],
  );

  const isFiltered = debouncedSearch !== '' || department !== 'all' || status !== 'all';

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
    page,
    setPage,
    isFiltered,
    clear,
  };
}
