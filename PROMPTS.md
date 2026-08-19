# AI usage disclosure

I used Claude (Claude Code CLI) throughout this task. Below are the main prompts, in
the order I used them, plus what I did with the output.

## 1. Understand the brief before writing anything

> I have a technical task document in this repo:
> `Employee_Management_Frontend_Technical_Task.docx`. Before writing any code, read it
> thoroughly and extract: the objective in your own words; every functional requirement
> listed explicitly (don't paraphrase away field names, validation rules or exact
> wording); technical constraints and preferences; data requirements (is an API
> provided, or do I build a mock?); non-functional requirements (responsiveness,
> accessibility, testing, performance); deliverables and submission format; evaluation
> criteria; and anything ambiguous, contradictory or underspecified.
>
> Then ask me clarifying questions before coding. Wait for my answers.

This produced a requirements checklist I worked from for the rest of the task, and
surfaced eight genuinely ambiguous points — the most important being that the brief has
a form field called *Employment Status* but an action called *Deactivate*, which are two
different concepts.

## 2. Resolve the ambiguities

I answered the clarifying questions with these decisions:

- **Stack:** Vite + React + TypeScript, Tailwind, TanStack Query, react-hook-form + zod,
  Vitest + Testing Library.
- **Status model:** two fields — `employmentStatus` (Full-time / Part-time / Contract /
  Intern) plus a separate `isActive` lifecycle flag — so deactivating someone doesn't
  erase their contract type.
- **Mock API:** server-side pagination and filtering with simulated latency, persisted
  to `localStorage`, so the client never holds the whole dataset.
- **Scope:** everything, including Storybook and deployment.

## 3. Plan before building

> Once requirements are clear, produce a concrete implementation plan: proposed tech
> stack and why it fits the document's constraints, project structure, data model,
> component breakdown, state management approach, routing, order of implementation
> prioritised by the evaluation criteria, and any assumptions you're making explicit so
> I can correct them before you build.

I reviewed and approved the plan before implementation started. The ordering mattered:
list + loading/empty/error/retry states first, since those carry the most weight in the
brief; polish last.

## 4. Build to a standard, not just to spec

> Implement the approved plan with: clean readable code and sensible naming; proper
> component decomposition, no giant monolithic components; loading, error and empty
> states handled, not just the happy path; input validation and user feedback including
> confirmation on destructive actions; responsive layout; comments only where the logic
> isn't self-explanatory. Follow the document's exact requirements and wording over your
> own assumptions — if you need to deviate for a good technical reason, tell me why
> first.

Specific follow-ups during implementation:

> Requirement 6 says to demonstrate what happens when an API operation fails. A reviewer
> can't see that on a deployed demo unless they can trigger it — add a visible failure
> injection control and document it in the README.

> Use the native `<dialog>` element for modals rather than a modal library, so focus
> trapping, Esc-to-close and background inerting come from the platform.

> Both the desktop table and the mobile cards render into the DOM and CSS hides one.
> Scope the tests to the table rather than asserting on duplicated text.

## 5. Verify rather than assume

> Run the tests and the production build. Then start the dev server and drive the real
> page in the browser: check the dialogs, validation, Esc-to-close, the failure toggle,
> and the error-and-retry path.

This caught two real bugs that neither the type checker nor the tests would have found:

1. **Modals rendered in the top-left corner instead of centred.** Tailwind's preflight
   sets `margin: 0` on every element, which removes the `margin: auto` that the browser's
   default stylesheet relies on to centre a `<dialog>`. Fixed in `src/index.css`.
2. **Storybook's `init` rewrote `vite.config.ts`** into a two-project Vitest setup that
   required Playwright browser testing, which would have made `npm test` depend on a
   browser download. Reverted the config and removed that addon.

It also caught a cosmetic issue — the seeded dataset produced two employees with
identical names, which reads as a rendering bug in a demo — so seeding now guarantees
unique names, with a test asserting the dataset has no duplicate emails or IDs.

## 6. Write the deliverables

> Write the README covering what the project is, tech stack and why, setup, folder
> structure, and the assumptions and trade-offs — especially where the brief was
> ambiguous. Include the two "Senior Touch" answers: how I'd handle the employee API
> being unavailable, and how I'd approach this page with 100,000+ employees. Answer them
> properly rather than as filler.

> Then run through the requirements checklist from the document and confirm each item is
> met, or flag anything intentionally left out and why.

## 7. Audit the result against the brief

> Recheck the README, the implementation and the task document. Note down everything
> that is still pending.

Deliberately adversarial, and it paid for itself. It found three defects I would
otherwise have shipped:

1. **`?fail=1` was a one-way trap.** The URL parameter overrode the failure toggle
   permanently, so a reviewer arriving through that link could never switch failures
   back off — on the one feature built for reviewers to try.
2. **A page could be left out of range.** Deactivating the last row on the last page
   shrank the result set without moving the pager, rendering an empty table under
   "Showing 211–210 of 210".
3. **A newly created employee was often invisible.** Sorted by name, a new record could
   land 20 pages away, so the success message appeared with nothing on screen.

It also caught four stale claims in the README, including a wrong Storybook version.

## 8. Close the gaps

> Fix those. Then add reactivation, sortable columns, and filters in the URL — and make
> the row actions icon buttons with tooltips.

Each fix landed with a regression test that fails against the old behaviour, rather
than a fix asserted to work.

## 9. Interaction and theming polish

> Reactivate should look like the other row actions. The cursor should be a pointer on
> hover, and the tooltip should be built from Tailwind utilities. Make the whole app
> responsive, and add light and dark themes.

The pointer turned out to be a real bug rather than an oversight: Tailwind v4's preflight
sets `cursor: default` on buttons, so it has to be opted into. Dark mode went in as
semantic CSS variables behind `[data-theme]` rather than a `dark:` class on every
element, so each component is still written once.

---

## How I worked with the AI

I used it as a fast pair, not as an oracle. The parts I drove myself were the ones that
determine whether the submission is any good: deciding that Employment Status and
Deactivate are separate concepts, choosing server-side pagination in the mock so the
100k-employee answer is architectural rather than hypothetical, insisting the failure
states be reachable by a reviewer instead of existing only in code, and calling for the
audit in step 7 rather than treating "the tests pass" as done.

Everything here builds and passes its 29 tests. The dialogs, validation, keyboard paths,
failure injection and the mobile layout were checked by driving the real page in a
browser — that is how the modal-centring bug surfaced, since no test would have caught
it. The theming and the final responsive pass were verified against the test suite and
the compiled CSS rather than by eye.
