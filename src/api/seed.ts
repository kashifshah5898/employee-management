import {
  DEPARTMENTS,
  type Department,
  type Employee,
  type EmploymentStatus,
} from '../types';

const FIRST_NAMES = [
  'Sarah', 'Omar', 'Priya', 'Daniel', 'Aisha', 'Marcus', 'Lena', 'Tomas',
  'Yara', 'Noah', 'Farida', 'Elias', 'Mei', 'Jonas', 'Amara', 'Victor',
  'Nadia', 'Hugo', 'Ines', 'Karim', 'Sofia', 'Leo', 'Zainab', 'Ravi',
  'Clara', 'Mateo', 'Hana', 'Felix', 'Layla', 'Anton',
];

const LAST_NAMES = [
  'Chen', 'Farouk', 'Nair', 'Whitfield', 'Rahman', 'Okonkwo', 'Bergstrom',
  'Novak', 'Haddad', 'Lindqvist', 'Mansour', 'Petrov', 'Tanaka', 'Muller',
  'Diallo', 'Rossi', 'Aziz', 'Moreau', 'Costa', 'Kaur', 'Almeida', 'Fischer',
  'Ibrahim', 'Sorensen', 'Vasquez', 'Kowalski', 'Osei', 'Dubois', 'Reyes', 'Halvorsen',
];

const JOB_TITLES: Record<Department, string[]> = {
  Engineering: ['Frontend Engineer', 'Backend Engineer', 'Staff Engineer', 'QA Engineer', 'Engineering Manager'],
  Product: ['Product Manager', 'Associate Product Manager', 'Product Analyst', 'Head of Product'],
  Design: ['Product Designer', 'UX Researcher', 'Design Systems Lead', 'Brand Designer'],
  Sales: ['Account Executive', 'Sales Development Rep', 'Sales Manager', 'Solutions Consultant'],
  Marketing: ['Content Strategist', 'Growth Marketer', 'Marketing Manager', 'SEO Specialist'],
  HR: ['HR Business Partner', 'Recruiter', 'People Operations Lead', 'HR Coordinator'],
  Finance: ['Financial Analyst', 'Accountant', 'Payroll Specialist', 'Finance Manager'],
  Operations: ['Operations Analyst', 'Office Manager', 'Logistics Coordinator', 'Operations Lead'],
};

/**
 * Seeded LCG. The dataset has to be identical on every reload and in every
 * test run, so Math.random() is not an option.
 */
function lcg(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const pick = <T,>(rand: () => number, items: readonly T[]): T =>
  items[Math.floor(rand() * items.length)];

export const SEED_COUNT = 247;

export function createSeedEmployees(): Employee[] {
  const rand = lcg(20260819);
  const employees: Employee[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < SEED_COUNT; i++) {
    const firstName = pick(rand, FIRST_NAMES);
    // Two identical rows read as a rendering bug in a demo, so names stay
    // unique. The scan is bounded: with more rows than name pairs the suffix
    // below keeps emails unique anyway.
    let lastIndex = Math.floor(rand() * LAST_NAMES.length);
    for (let attempt = 0; attempt < LAST_NAMES.length; attempt++) {
      if (!usedNames.has(`${firstName} ${LAST_NAMES[lastIndex]}`)) break;
      lastIndex = (lastIndex + 1) % LAST_NAMES.length;
    }
    const lastName = LAST_NAMES[lastIndex];
    const isDuplicateName = usedNames.has(`${firstName} ${lastName}`);
    usedNames.add(`${firstName} ${lastName}`);
    const department = pick(rand, DEPARTMENTS);
    const jobTitle = pick(rand, JOB_TITLES[department]);

    // Employment status is weighted so the filters have a realistic spread.
    const roll = rand();
    const employmentStatus: EmploymentStatus =
      roll < 0.68 ? 'Full-time' : roll < 0.82 ? 'Part-time' : roll < 0.94 ? 'Contract' : 'Intern';

    const year = 2015 + Math.floor(rand() * 11);
    const month = 1 + Math.floor(rand() * 12);
    const day = 1 + Math.floor(rand() * 28);

    const email = (
      isDuplicateName
        ? `${firstName}.${lastName}.${i}@example.com`
        : `${firstName}.${lastName}@example.com`
    ).toLowerCase();

    employees.push({
      id: `seed-${i + 1}`,
      employeeId: `EMP-${String(i + 1).padStart(4, '0')}`,
      firstName,
      lastName,
      email,
      jobTitle,
      department,
      employmentStatus,
      joiningDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      isActive: rand() > 0.12,
    });
  }

  return employees;
}
