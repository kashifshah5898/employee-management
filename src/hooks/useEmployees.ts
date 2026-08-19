import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createEmployee,
  deactivateEmployee,
  listEmployees,
  updateEmployee,
} from '../api/employees';
import type { EmployeeInput, EmployeeQuery } from '../types';

export const employeeKeys = {
  all: ['employees'] as const,
  list: (query: EmployeeQuery) => [...employeeKeys.all, 'list', query] as const,
};

export function useEmployeeList(query: EmployeeQuery) {
  return useQuery({
    queryKey: employeeKeys.list(query),
    queryFn: () => listEmployees(query),
    // Keeps the previous page on screen while the next one loads, so paging
    // and typing in the search box do not flash an empty table.
    placeholderData: keepPreviousData,
  });
}

/** Every mutation invalidates the list, so the table reflects writes. */
function useInvalidateEmployees() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: employeeKeys.all });
}

export function useCreateEmployee() {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: (input: EmployeeInput) => createEmployee(input),
    onSuccess: invalidate,
  });
}

export function useUpdateEmployee() {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: EmployeeInput }) =>
      updateEmployee(id, input),
    onSuccess: invalidate,
  });
}

export function useDeactivateEmployee() {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: (id: string) => deactivateEmployee(id),
    onSuccess: invalidate,
  });
}
