import { useEffect, useState } from 'react';
import { pageOfEmployee } from '../api/employees';
import { PAGE_SIZE, useEmployeeFilters } from '../hooks/useEmployeeFilters';
import {
  useDeactivateEmployee,
  useEmployeeList,
  useReactivateEmployee,
} from '../hooks/useEmployees';
import { fullName, type Employee } from '../types';
import { ConfirmDialog } from './ConfirmDialog';
import { EmployeeDetailsDialog } from './EmployeeDetailsDialog';
import { EmployeeFormDialog, type SaveResult } from './EmployeeFormDialog';
import { EmployeeTable } from './EmployeeTable';
import { EmployeeToolbar } from './EmployeeToolbar';
import { FailureToggle } from './FailureToggle';
import { Pagination } from './Pagination';
import { ListEmpty, ListError, ListLoading } from './states';

/** Only one dialog is ever open, so the open state is one value, not five booleans. */
type Dialog =
  | { type: 'create' }
  | { type: 'edit'; employee: Employee }
  | { type: 'view'; employee: Employee }
  | { type: 'deactivate'; employee: Employee }
  | { type: 'reactivate'; employee: Employee }
  | null;

export function EmployeeListPage() {
  const filters = useEmployeeFilters();
  const list = useEmployeeList(filters.query);
  const deactivate = useDeactivateEmployee();
  const reactivate = useReactivateEmployee();

  const [dialog, setDialog] = useState<Dialog>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  // Success messages are transient; the region stays mounted so it is announced.
  useEffect(() => {
    if (!confirmation) return;
    const timer = setTimeout(() => setConfirmation(null), 4000);
    return () => clearTimeout(timer);
  }, [confirmation]);

  const closeDialog = () => {
    setDialog(null);
    deactivate.reset();
    reactivate.reset();
  };

  // Deactivate and reactivate are the same flow with the sign flipped, so they
  // share one confirmation dialog rather than two near-identical ones.
  const activation =
    dialog?.type === 'deactivate' || dialog?.type === 'reactivate' ? dialog : null;
  const isDeactivating = activation?.type === 'deactivate';
  const activationMutation = isDeactivating ? deactivate : reactivate;

  const confirmActivation = () => {
    if (!activation) return;
    const { employee } = activation;
    activationMutation.mutate(employee.id, {
      onSuccess: () => {
        setConfirmation(
          `${fullName(employee)} has been ${isDeactivating ? 'deactivated' : 'reactivated'}.`,
        );
        closeDialog();
      },
    });
  };

  const handleSaved = ({ message, employee, created }: SaveResult) => {
    setConfirmation(message);
    if (!created) return;
    // A new record sorts into the middle of the list, so without this the
    // confirmation would appear while the employee sits 20 pages away.
    filters.clear();
    filters.setPage(
      pageOfEmployee(employee.id, {
        sortBy: filters.sortBy,
        sortDir: filters.sortDir,
        pageSize: PAGE_SIZE,
      }),
    );
  };

  const total = list.data?.total ?? 0;
  // The server clamps the page when the result set shrinks underneath us, so
  // its answer — not local state — is what the pager reflects.
  const page = list.data?.page ?? filters.page;

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
            <p className="mt-1 text-sm text-slate-600">
              Search, filter and manage everyone on the team.
            </p>
          </div>
          <FailureToggle />
        </header>

        <div
          role="status"
          aria-live="polite"
          className={
            confirmation
              ? 'rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800'
              : 'sr-only'
          }
        >
          {confirmation}
        </div>

        <main className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <EmployeeToolbar
            search={filters.search}
            onSearchChange={filters.setSearch}
            department={filters.department}
            onDepartmentChange={filters.setDepartment}
            status={filters.status}
            onStatusChange={filters.setStatus}
            sortBy={filters.sortBy}
            sortDir={filters.sortDir}
            onSortChange={filters.setSort}
            onAdd={() => setDialog({ type: 'create' })}
          />

          {list.isPending ? (
            <ListLoading />
          ) : list.isError ? (
            <ListError
              message={list.error.message}
              onRetry={() => list.refetch()}
              isRetrying={list.isFetching}
            />
          ) : total === 0 ? (
            <ListEmpty
              isFiltered={filters.isFiltered}
              onClear={filters.clear}
              onAdd={() => setDialog({ type: 'create' })}
            />
          ) : (
            <>
              {/* Dimmed while a background refetch is in flight, rather than
                  replaced by a spinner that would drop the user's place. */}
              <div className={list.isFetching ? 'opacity-60 transition-opacity' : undefined}>
                <EmployeeTable
                  employees={list.data.data}
                  sortBy={filters.sortBy}
                  sortDir={filters.sortDir}
                  onSort={filters.toggleSort}
                  onView={(employee) => setDialog({ type: 'view', employee })}
                  onEdit={(employee) => setDialog({ type: 'edit', employee })}
                  onDeactivate={(employee) => setDialog({ type: 'deactivate', employee })}
                  onReactivate={(employee) => setDialog({ type: 'reactivate', employee })}
                />
              </div>
              <Pagination
                page={page}
                pageSize={PAGE_SIZE}
                total={total}
                onPageChange={filters.setPage}
              />
            </>
          )}
        </main>
      </div>

      <EmployeeFormDialog
        open={dialog?.type === 'create' || dialog?.type === 'edit'}
        employee={dialog?.type === 'edit' ? dialog.employee : null}
        onClose={closeDialog}
        onSaved={handleSaved}
      />

      <EmployeeDetailsDialog
        employee={dialog?.type === 'view' ? dialog.employee : null}
        onClose={closeDialog}
        onEdit={(employee) => setDialog({ type: 'edit', employee })}
      />

      <ConfirmDialog
        open={activation !== null}
        title={isDeactivating ? 'Deactivate employee' : 'Reactivate employee'}
        description={
          activation
            ? isDeactivating
              ? `${fullName(activation.employee)} will be marked as inactive and will no longer appear under active employees. Their record stays in the system and their details remain viewable.`
              : `${fullName(activation.employee)} will be marked as active again and will appear under active employees.`
            : ''
        }
        confirmLabel={isDeactivating ? 'Deactivate' : 'Reactivate'}
        pendingLabel={isDeactivating ? 'Deactivating…' : 'Reactivating…'}
        variant={isDeactivating ? 'danger' : 'primary'}
        isPending={activationMutation.isPending}
        error={
          activationMutation.error
            ? `Could not ${isDeactivating ? 'deactivate' : 'reactivate'}. ${activationMutation.error.message}`
            : undefined
        }
        onConfirm={confirmActivation}
        onClose={closeDialog}
      />
    </div>
  );
}
