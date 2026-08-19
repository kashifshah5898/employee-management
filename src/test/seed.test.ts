import { describe, expect, it } from 'vitest';
import { SEED_COUNT, createSeedEmployees } from '../api/seed';

describe('seed data', () => {
  it('is deterministic and internally consistent', () => {
    const first = createSeedEmployees();
    const second = createSeedEmployees();

    expect(first).toHaveLength(SEED_COUNT);
    expect(first).toEqual(second);

    // The mock API rejects duplicate emails, so the seed must not contain any.
    expect(new Set(first.map((employee) => employee.email)).size).toBe(SEED_COUNT);
    expect(new Set(first.map((employee) => employee.employeeId)).size).toBe(SEED_COUNT);
    expect(first.some((employee) => !employee.isActive)).toBe(true);
  });
});
