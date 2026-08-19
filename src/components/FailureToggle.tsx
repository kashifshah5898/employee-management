import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { isFailureSimulated, setFailureSimulated } from '../api/employees';
import { employeeKeys } from '../hooks/useEmployees';

/**
 * Requirement 6 asks the UI to demonstrate a failed API call. On a deployed
 * demo that is only demonstrable if the reviewer can cause one, so failure
 * injection is a visible control rather than a code path nobody can reach.
 */
export function FailureToggle() {
  const queryClient = useQueryClient();
  const [enabled, setEnabled] = useState(isFailureSimulated);

  const toggle = (value: boolean) => {
    setFailureSimulated(value);
    setEnabled(value);
    // Refetch immediately so the effect is visible without another interaction.
    queryClient.invalidateQueries({ queryKey: employeeKeys.all });
  };

  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
      <input
        type="checkbox"
        checked={enabled}
        onChange={(event) => toggle(event.target.checked)}
        className="h-4 w-4 accent-amber-600"
      />
      Simulate API failure
    </label>
  );
}
