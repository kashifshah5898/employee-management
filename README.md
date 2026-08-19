# Employee Management Page

An HR-facing employee directory built for the Frontend Engineer technical assessment:
search, filter, sort, paginate, view, add, edit, deactivate and reactivate employees.
Responsive from phone to desktop, with light and dark themes.

- **Live demo:** https://employee-management-by-kashif-shah.vercel.app/
- **Repository:** https://github.com/kashifshah5898/employee-management

There is no backend. A mock API layer in `src/api/employees.ts` simulates one — with
latency, server-side pagination, validation and failures — and persists to
`localStorage`.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 29 tests, Vitest + Testing Library
npm run build      # type-check + production build
npm run storybook  # component states in isolation
```

## Reviewing the error states

The task asks the UI to demonstrate what happens when an API operation fails. That is
only demonstrable if you can cause a failure, so failure injection is a control in the
app rather than a code path nobody can reach:

| To see | Do this |
|---|---|
| **Fetch error + recovery** | Tick **Simulate API failure** (top right), or load the page with `?fail=1`. The list shows an error with a **Retry** button. Untick it and retry to recover — the parameter only seeds the initial value, so the toggle always wins. |
| **Mutation error** | Tick the toggle, then add or edit an employee. The dialog stays open, keeps everything you typed, and offers **Try again**. |
| **Field-level server error** | Add an employee using an email that already exists. The rejection lands on the email field, not in a generic banner. |
| **Empty state** | Search for a name that does not exist. Offers **Clear filters**. |
| **Loading states** | Skeleton rows on first load; the table dims during refetches; the submit button shows _Saving…_ and disables. |
| **Reactivating someone** | Set **Status → Inactive**. Inactive rows swap the deactivate action for a green **Reactivate** icon (tooltip on hover or keyboard focus), and the same action sits in that employee's details dialog. |
| **Light / dark theme** | The control top right: light, dark, or follow the OS. The choice persists, and an inline script in `index.html` applies it before first paint so there is no flash of the wrong palette. |
| **Shareable views** | Sort a column or change a filter and check the address bar — `?department=Sales&sort=joiningDate&dir=desc` reloads into the same view. |

Data resets to the seeded 247 employees if you clear `localStorage`.

---

## Tech stack

| Choice | Why |
|---|---|
| **React 19 + TypeScript (strict)** + **Vite** | Required by the task. Vite keeps the repo free of framework machinery that isn't being used. |
| **TanStack Query v5** | The task's state requirements *are* query states: loading, error, retry, pending mutations, cache invalidation. Query provides them directly, and its pagination/caching model is what a 100k-row directory would need anyway. |
| **react-hook-form + zod** | One schema drives both create and edit. RHF wires `aria-invalid`/`aria-describedby` per field and focuses the first invalid input on submit. |
| **Tailwind CSS v4** | "Design is not a focus" — utility classes keep styling co-located with markup and responsive breakpoints inline, with no design system to invent. |
| **Semantic colour tokens** | Components use `bg-surface` / `text-content` / `border-line`, mapped through `@theme inline` to CSS variables that `[data-theme]` swaps. Dark mode is therefore one block of variables rather than a `dark:` class on every element. |
| **Native `<dialog>`** | Focus trap, `Esc` to close, backdrop and background inerting come from the platform. A modal library would reimplement all four, worse. |
| **Vitest + Testing Library** | Shares Vite's transform pipeline; tests exercise the page the way a user drives it. |
| **Storybook 10** | Optional in the brief; used to show the table's loading / empty / error / populated states side by side. |

**No Redux, no Context, no router — deliberately.** Server state lives in TanStack Query,
which is global by construction, so no employee data is ever threaded through props.
Filter state is one hook (`useEmployeeFilters`) owned by the page and passed one level
down to the toolbar. Adding a store would mean writing reducers to duplicate a cache
Query already maintains. That satisfies "avoid unnecessary prop drilling" with less
machinery, not more.

---

## Project structure

```
src/
├─ types.ts                    Employee model, enums, formatters
├─ api/
│  ├─ seed.ts                  deterministic 247-employee dataset (seeded LCG, no faker)
│  └─ employees.ts             mock backend: latency, pagination, filtering,
│                              validation, failure injection, localStorage
├─ hooks/
│  ├─ useEmployees.ts          list query + create/update/(de)activate mutations
│  └─ useEmployeeFilters.ts    debounced search, filters, sort, page — synced to the URL
├─ components/
│  ├─ EmployeeListPage.tsx     composition + which dialog is open
│  ├─ EmployeeToolbar.tsx      search, department + status filters, mobile sort, add
│  ├─ EmployeeTable.tsx        sortable table on desktop, stacked cards on mobile
│  ├─ EmployeeFormDialog.tsx   ONE form, create and edit
│  ├─ EmployeeDetailsDialog.tsx
│  ├─ ConfirmDialog.tsx        gates deactivate, reused for reactivate
│  ├─ Pagination.tsx
│  ├─ Modal.tsx                thin wrapper over native <dialog>
│  ├─ StatusBadge.tsx
│  ├─ states.tsx               loading / empty / error views
│  ├─ FailureToggle.tsx        failure injection control
│  ├─ ui.tsx                   Button, IconButton + tooltip, Field, ErrorBanner, icons
│  └─ *.stories.tsx            Storybook stories, colocated with their components
└─ test/                       setup, fixtures, 7 specs
```

Only the mock API and the `FailureToggle` demo control know the data is fake. Every
other component and hook talks to it through the same async, paginated contract a real
endpoint would expose — so pointing this at a real service means rewriting the bodies in
`src/api/employees.ts` and deleting the toggle.

## Data model

```ts
interface Employee {
  id: string;                  // internal record id
  employeeId: string;          // 'EMP-0142' — system-generated, never user-editable
  firstName: string;
  lastName: string;
  email: string;               // unique, enforced by the mock API
  jobTitle: string;
  department: Department;      // 8-value enum
  employmentStatus: EmploymentStatus;  // Full-time | Part-time | Contract | Intern
  joiningDate: string;         // 'YYYY-MM-DD'
  isActive: boolean;           // lifecycle flag, flipped by Deactivate / Reactivate
}
```

The list endpoint takes `{ search, department, status, sortBy, sortDir, page, pageSize }`
and returns `{ data, total, page, pageSize }`. It clamps the requested page to the
result set, so deactivating the last row on the last page can't strand the UI on a page
that no longer exists.

## Responsive behaviour

| Width | Layout |
|---|---|
| **< 640px** | Single-column filters, stacked employee cards, stacked pagination, dialogs at `100vw - 2rem` with a scrolling body. |
| **640–1023px** | Filters in two columns; still cards rather than a table, since seven columns cannot fit honestly. |
| **≥ 1024px** | The real `<table>`, sized to its own `overflow-x-auto` container so a wide column set scrolls instead of spilling out of the page. Sorting moves from the mobile "Sort by" select to the column headers. |

## Accessibility

- Every form control has a `<label for>`; every icon-only or repeated button has a
  meaningful accessible name (`Deactivate Sarah Chen`, not `Deactivate`).
- Validation errors use `role="alert"`, are linked with `aria-describedby`, mark the
  control `aria-invalid`, and focus moves to the first invalid field on submit.
- Modals are native `<dialog>` elements: focus is trapped, `Esc` closes, the rest of the
  page is inert. Every flow — filter, sort, page, add, edit, deactivate, reactivate — is
  keyboard-only operable.
- Row actions are icon buttons whose tooltips appear on hover **and** on keyboard focus,
  so they are not mouse-only. The tooltip is `aria-hidden`; the real name comes from
  `aria-label` and includes the employee, and the short visible label is contained in it
  (WCAG 2.5.3, Label in Name).
- Sortable column headers carry `aria-sort`, so the current order is announced rather
  than conveyed by an arrow glyph alone.
- Result counts and success messages are announced through `aria-live` regions.
- Visible focus rings are kept on all interactive elements, and every control carries
  `cursor-pointer` — Tailwind v4's preflight sets buttons to `cursor: default`, so the
  pointer has to be opted into rather than inherited.
- The theme control is a labelled group of toggle buttons with `aria-pressed`, so the
  active choice is exposed rather than implied by colour.

## Testing

`npm test` — 29 tests across 7 files, covering the behaviour the brief calls out rather
than implementation details:

- `employee-list` — loading → populated, search, department filter, status filter,
  empty state with recovery, pagination boundaries
- `employee-form` — required-field validation, email format, successful create, a
  server-side rejection landing on the email field with input preserved, edit
  pre-filled through the same form
- `deactivate` — the action does nothing until confirmed, cancel is safe, confirm
  updates the row and announces it
- `error-retry` — a failed fetch renders the error, Retry re-attempts, recovery restores
  the table
- `seed` — the dataset is deterministic and has no duplicate emails or IDs
- `theme` — defaults to the system preference, switches and persists, and falls back
  when the stored value is junk
- `regressions` — one test per edge case that is easy to get wrong: `?fail=1` can be switched
  back off, an out-of-range page is clamped instead of rendering an empty table, a newly
  created employee is on screen when the form closes, reactivation restores an employee,
  sorting reorders and reports `aria-sort`, and URL filters round-trip while rejecting
  junk parameters

---

## The "Senior Touch"

### 1. How I would handle the employee API being unavailable

**In this codebase today** the page never dead-ends: a failed fetch renders an
explanation plus a **Retry**, a failed mutation keeps the dialog open with the user's
input intact and offers **Try again**, and retries are disabled at the client so a real
outage surfaces immediately instead of hiding behind three silent attempts. Everything
below is what I would add for production, roughly in the order I'd add it.

**Classify the failure before reacting to it.** A 500, a network drop and a 422 are
three different problems. Only transient ones (network, 5xx, 429) should retry, with
exponential backoff and jitter so a recovering service doesn't get stampeded by every
client at once. A 4xx should never be retried — it will fail identically forever.

**Keep the app useful while it's down.** Persist the Query cache
(`@tanstack/query-persist-client` → IndexedDB) and serve the last-known list read-only
behind an honest banner: *"Showing employees as of 14:32 — reconnecting."* Stale data
with a timestamp beats an empty screen; silently stale data does not.

**Decide deliberately what happens to writes.** Two defensible options, and the choice
is a product decision, not a technical one:

- *Disable them* — grey out Add/Edit/Deactivate with a tooltip explaining why. Honest,
  cheap, no consistency risk.
- *Queue them* — optimistic UI backed by an outbox that replays on reconnect. Each
  request carries a client-generated idempotency key so a replay after an ambiguous
  timeout can't create the same employee twice, and conflicts surface as a review step
  rather than a silent overwrite.

I would ship the first and only build the second if HR actually works offline, because
an outbox introduces a whole conflict-resolution surface that has to be designed, not
just coded.

**Recover without making the user think.** Refetch on reconnect (`navigator.onLine` +
the `online` event) and on window focus, with a circuit breaker so a dead service isn't
hammered while it's trying to come back up.

**Contain the blast radius.** An error boundary around the list means a failure in one
widget doesn't blank the page. Failed requests get logged with a correlation ID, and a
sustained error rate pages someone — the fastest recovery from an outage is noticing it
before your users report it.

### 2. How I would approach this page with 100,000+ employees

**The architecture here already assumes it.** `listEmployees` filters, sorts and slices
server-side and returns one page plus a total; the client never holds the full
collection. That is the single decision that matters, and it's why swapping the mock for
a real endpoint changes one file. Everything else is tuning.

**Pagination.** `OFFSET 99_000` makes the database walk 99,000 rows to discard them, so
deep pages get progressively slower. Switch to keyset (cursor) pagination on a stable
`(sort_key, id)` tuple: `WHERE (last_name, id) > (?, ?) LIMIT 25`. Constant time at any
depth. The trade-off is losing "jump to page 500", which nobody uses on a directory —
they search instead.

**Counts.** An exact filtered `COUNT(*)` over 100k+ rows costs about as much as the
query itself. Either drop the precise total for a "load more" affordance, or serve an
approximate count and only compute the exact one when the result set is small.

**Search.** `LIKE '%chen%'` cannot use a B-tree index, so it degrades into a full scan at
this size. Use a trigram index (Postgres `pg_trgm`) or a dedicated search service for
prefix/fuzzy matching across name, email and job title, and keep the input debounced —
Query already cancels superseded requests by key.

**Payload.** Return only the columns the table renders; a full employee record per row
is wasted bandwidth when six fields are shown. Details load on demand when a row is
opened.

**Client rendering.** With a modest page size — 10 here — the DOM stays small, so
virtualisation is unnecessary. It only becomes necessary if the UX moves to infinite scroll, and then
`@tanstack/react-virtual` plus `useInfiniteQuery` is the pairing — but I'd push back on
infinite scroll for an HR tool where people need stable, referenceable positions.

**Perceived speed.** `keepPreviousData` (already in place) keeps the current page visible
while the next loads; prefetching the next page on idle makes paging feel instant.
Filter option lists come from a small cached lookup endpoint, never derived from the
employee data.

**Shareable state.** At this scale a filtered view is a work artefact — "the 40 contract
staff in Ops joining this quarter". Filters, sort and page live in the URL here
(`?department=Operations&status=Contract&sort=joiningDate&dir=desc`) via the History API,
so a view can be bookmarked and shared without pulling in a router. `replaceState`
rather than `pushState`: refining a filter is not a new place, and one history entry per
keystroke-settled search would bury the back button.

**Bulk work moves to the server.** Exports and bulk deactivations become async jobs with
a download link or a progress indicator, never a client-side loop over 100k records.

**Then measure.** Seed a staging environment with 100k rows and watch p95 query latency,
TTFB and INP. Every claim above is a hypothesis until it's measured against real data
volume.

---

## Assumptions and trade-offs

The brief left a few things open. Where it did, I chose the reading that preserved the
most information and noted it here rather than silently picking one.

1. **"Employment Status" and "Deactivate" are two different things.** The form field is
   *Employment Status* (Full-time / Part-time / Contract / Intern); *Deactivate* flips a
   separate `isActive` flag. Collapsing them into one enum would mean deactivating an
   employee erases the fact that they were Full-time. The Status column shows both
   facets and the filter covers both, grouped with `<optgroup>`.
2. **`employeeId` is system-generated** (`EMP-0001`, sequential). It's a list column but
   not one of the form's fields, so it cannot be user-entered.
3. **Dialogs, not routes.** View, edit and confirm are modals, so the app needs no
   router. Filters, sort and page still round-trip through the URL via the History API,
   so views stay shareable; what's missing is a deep link to one employee's dialog,
   which would be the reason to add a router.
4. **Writes persist to `localStorage`** so the deployed demo survives a reload. Clearing
   site data restores the seeded 247 employees.
5. **Search matches full name only**, case-insensitive and partial, exactly as worded.
   I did not silently widen it to email or job title.
6. **Departments are a fixed 8-value enum** — the brief provided no list.
7. **Email uniqueness is enforced by the mock API**, not just the client, to demonstrate
   mapping a server rejection back onto the field that caused it.
8. **The responsive table renders twice** — a real `<table>` above `lg`, stacked cards
   below — with CSS hiding one. That keeps proper table semantics on desktop instead of
   forcing a table to `display: block`, at the cost of duplicated markup for ten rows.
   Screen readers see one copy, since the hidden branch is `display: none`.
9. **No deployment config file.** Vercel and Netlify both auto-detect Vite, and with no
   router there are no SPA rewrites to declare. `npm run build` → deploy `dist/`.

## What I'd add next

Ordered by what would matter most on a real product, not by effort:

- Column-level filters, and multi-select on department/status
- Optimistic updates on deactivate, with rollback on failure
- Persisted query cache, so a reload during an outage still shows the last-known list
- E2E coverage (Playwright) for the create → edit → deactivate path against a real browser
