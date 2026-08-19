import { formatDate, fullName, type Employee } from '../types';
import { Modal } from './Modal';
import { StatusBadge } from './StatusBadge';
import { Button, ReactivateIcon } from './ui';

interface EmployeeDetailsDialogProps {
  employee: Employee | null;
  onClose: () => void;
  onEdit: (employee: Employee) => void;
  onReactivate: (employee: Employee) => void;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-2 py-2 max-sm:grid-cols-1 max-sm:gap-0.5">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900">{children}</dd>
    </div>
  );
}

export function EmployeeDetailsDialog({
  employee,
  onClose,
  onEdit,
  onReactivate,
}: EmployeeDetailsDialogProps) {
  return (
    <Modal open={employee !== null} onClose={onClose} title="Employee details">
      {employee && (
        <div className="flex flex-col overflow-y-auto">
          <dl className="divide-y divide-slate-100 px-5 py-2">
            <Row label="Name">{fullName(employee)}</Row>
            <Row label="Employee ID">
              <span className="font-mono text-xs">{employee.employeeId}</span>
            </Row>
            <Row label="Email">
              <a className="text-slate-900 underline underline-offset-2" href={`mailto:${employee.email}`}>
                {employee.email}
              </a>
            </Row>
            <Row label="Job title">{employee.jobTitle}</Row>
            <Row label="Department">{employee.department}</Row>
            <Row label="Status">
              <StatusBadge isActive={employee.isActive} employmentStatus={employee.employmentStatus} />
            </Row>
            <Row label="Joining date">{formatDate(employee.joiningDate)}</Row>
          </dl>
          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 p-5 sm:flex-row sm:justify-end">
            <Button onClick={onClose}>Close</Button>
            {/* Someone who opened an inactive record is the person most likely
                to want them back, so the action lives here too. */}
            {!employee.isActive && (
              <Button variant="success" onClick={() => onReactivate(employee)} className="gap-1.5">
                <ReactivateIcon />
                Reactivate employee
              </Button>
            )}
            <Button variant="primary" onClick={() => onEdit(employee)}>
              Edit employee
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
