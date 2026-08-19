import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ApiError } from '../api/employees';
import { useCreateEmployee, useUpdateEmployee } from '../hooks/useEmployees';
import {
  DEPARTMENTS,
  EMPLOYMENT_STATUSES,
  type Department,
  type Employee,
  type EmployeeInput,
  type EmploymentStatus,
} from '../types';
import { Modal } from './Modal';
import { Button, ErrorBanner, Field, inputClass } from './ui';

const today = () => new Date().toISOString().slice(0, 10);

const employeeSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50, 'Keep this under 50 characters'),
  lastName: z.string().trim().min(1, 'Last name is required').max(50, 'Keep this under 50 characters'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address, e.g. name@company.com'),
  jobTitle: z.string().trim().min(1, 'Job title is required').max(80, 'Keep this under 80 characters'),
  department: z.enum(DEPARTMENTS, { errorMap: () => ({ message: 'Department is required' }) }),
  employmentStatus: z.enum(EMPLOYMENT_STATUSES, {
    errorMap: () => ({ message: 'Employment status is required' }),
  }),
  joiningDate: z
    .string()
    .min(1, 'Joining date is required')
    .refine((value) => value <= today(), 'Joining date cannot be in the future'),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

// The selects start empty so the user has to choose; the cast keeps that
// placeholder representable without widening the field types everywhere else.
const EMPTY_FORM: EmployeeFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  jobTitle: '',
  department: '' as Department,
  employmentStatus: '' as EmploymentStatus,
  joiningDate: '',
};

export interface SaveResult {
  message: string;
  employee: Employee;
  /** False for an edit — the list only needs to relocate after a create. */
  created: boolean;
}

interface EmployeeFormDialogProps {
  open: boolean;
  /** Present in edit mode, null when creating. */
  employee: Employee | null;
  onClose: () => void;
  onSaved: (result: SaveResult) => void;
}

/**
 * One form for both Create and Edit. The mode only changes the title, the
 * mutation it calls and the values it starts from — the fields, validation and
 * error handling are shared.
 */
export function EmployeeFormDialog({ open, employee, onClose, onSaved }: EmployeeFormDialogProps) {
  const isEdit = employee !== null;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit employee' : 'Add employee'} size="md">
      {/* Modal only mounts children while open, so the form always starts from
          the right values instead of the previously edited employee's. */}
      <EmployeeForm employee={employee} onClose={onClose} onSaved={onSaved} />
    </Modal>
  );
}

function EmployeeForm({ employee, onClose, onSaved }: Omit<EmployeeFormDialogProps, 'open'>) {
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const mutation = employee ? updateEmployee : createEmployee;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: employee
      ? {
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          jobTitle: employee.jobTitle,
          department: employee.department,
          employmentStatus: employee.employmentStatus,
          joiningDate: employee.joiningDate,
        }
      : EMPTY_FORM,
  });

  const submit = handleSubmit((values) => {
    const input: EmployeeInput = values;

    // A rejection tied to a specific field belongs on that field, not in a
    // banner the user has to translate back into an input.
    const onError = (error: unknown) => {
      if (error instanceof ApiError && error.field) {
        setError(
          error.field as keyof EmployeeFormValues,
          { message: error.message },
          { shouldFocus: true },
        );
      }
    };
    const onSuccess = (saved: Employee) => {
      onSaved({
        message: employee ? 'Employee updated.' : 'Employee added.',
        employee: saved,
        created: employee === null,
      });
      onClose();
    };

    if (employee) {
      updateEmployee.mutate({ id: employee.id, input }, { onSuccess, onError });
    } else {
      createEmployee.mutate(input, { onSuccess, onError });
    }
  });

  // Field-level rejections are already rendered against the field itself.
  const bannerError =
    mutation.error && !(mutation.error instanceof ApiError && mutation.error.field)
      ? mutation.error.message
      : undefined;

  return (
    <form onSubmit={submit} noValidate className="flex flex-col overflow-hidden">
      <div className="flex flex-col gap-4 overflow-y-auto p-5">
        {bannerError && (
          <ErrorBanner
            message={`Could not save this employee. ${bannerError}`}
            onRetry={submit}
            isRetrying={mutation.isPending}
          />
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="firstName" label="First Name" required error={errors.firstName?.message}>
            {(props) => (
              <input {...props} {...register('firstName')} className={inputClass} autoFocus />
            )}
          </Field>
          <Field id="lastName" label="Last Name" required error={errors.lastName?.message}>
            {(props) => <input {...props} {...register('lastName')} className={inputClass} />}
          </Field>
        </div>

        <Field id="email" label="Email" required error={errors.email?.message}>
          {(props) => <input {...props} type="email" {...register('email')} className={inputClass} />}
        </Field>

        <Field id="jobTitle" label="Job Title" required error={errors.jobTitle?.message}>
          {(props) => <input {...props} {...register('jobTitle')} className={inputClass} />}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="department" label="Department" required error={errors.department?.message}>
            {(props) => (
              <select {...props} {...register('department')} className={inputClass}>
                <option value="">Select a department</option>
                {DEPARTMENTS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            )}
          </Field>

          <Field
            id="employmentStatus"
            label="Employment Status"
            required
            error={errors.employmentStatus?.message}
          >
            {(props) => (
              <select {...props} {...register('employmentStatus')} className={inputClass}>
                <option value="">Select a status</option>
                {EMPLOYMENT_STATUSES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>

        {/* Native date input: calendar, keyboard support and locale handling for free. */}
        <Field id="joiningDate" label="Joining Date" required error={errors.joiningDate?.message}>
          {(props) => (
            <input
              {...props}
              type="date"
              max={today()}
              {...register('joiningDate')}
              className={inputClass}
            />
          )}
        </Field>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-slate-200 p-5 sm:flex-row sm:justify-end">
        <Button type="button" onClick={onClose} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : employee ? 'Save changes' : 'Add employee'}
        </Button>
      </div>
    </form>
  );
}
