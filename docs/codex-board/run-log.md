# Run Log

## Initial setup slice

Status: Complete

Scope:

- Scaffold Next.js TypeScript app.
- Add Tailwind CSS, Vitest, and Playwright.
- Add placeholder routes for `/`, `/methodology`, `/sources`, and `/privacy`.
- Add product docs and future ticket queue.
- Add minimal route and privacy tests.

Commands run:

- `npm run validate` - passed
- `npm run test:e2e` - passed after moving Playwright to a dedicated e2e port
- `git diff --check` - passed

Result:

- Initial setup slice completed.
- Future tickets remain `Status: Ready`.
- Ticket 001 was not started.

## Ticket 001: Budget Data Model

Status: Human Review

Scope:

- Added typed source registry for Budget Paper No. 1 2025-26 Statement 5 tables.
- Added 2025-26 top-level function expense dataset and selected non-additive spotlight programs.
- Added pure budget data helpers.
- Added focused unit tests for source coverage, amounts, labels, slugs, non-additive spotlight handling, and published-total rounding tolerance.
- Updated product sources and methodology docs for the budget data model only.

Commands run:

- `npm run validate` - passed
- `npm run test:e2e` - passed
- `git diff --check` - passed

Result:

- Ticket 001 implemented for human review.
- Ticket 002 was not started.

## Ticket 002: Tax Engine

Status: Human Review

Scope:

- Added Australian resident individual tax estimate types and pure 2025-26 calculation helpers.
- Added ATO source registry entries for resident tax rates, LITO, and Medicare levy.
- Added LITO handling capped so it cannot reduce income tax below zero.
- Added optional simplified Medicare levy at 2% of taxable income.
- Added focused unit tests for bracket boundaries, LITO thresholds, Medicare toggle, negative and non-finite inputs, and sample estimates.
- Updated product sources and methodology docs for tax-engine assumptions only.

Commands run:

- `npm run test:run` - passed
- `npm run validate` - passed
- `npm run test:e2e` - passed
- `git diff --check` - passed

Result:

- Ticket 002 implemented for human review.
- Ticket 003 was not started.

## Ticket 003: Allocation Engine

Status: Human Review

Scope:

- Added pure allocation types, cent rounding helpers, and Budget allocation functions.
- Added proportional allocation across additive top-level Budget functions.
- Added non-additive spotlight allocation helpers for later story highlights.
- Added deterministic largest-remainder cent rounding for final summary allocations.
- Added focused unit tests for zero tax, representative totals, determinism, additive/non-additive handling, source linkage, negative input, small totals, and rounding tie-breaks.
- Updated methodology docs for allocation assumptions only.

Commands run:

- `npm run test:run` - passed
- `npm run validate` - passed
- `npm run test:e2e` - passed
- `git diff --check` - passed

Result:

- Ticket 003 implemented for human review.
- Ticket 004 was not started.

## Ticket 004: Mobile Story Flow

Status: Human Review

Scope:

- Added `docs/product/DESIGN_DIRECTION.md` from the supplied design direction because ticket 004 requires it as the visible design source of truth.
- Replaced the placeholder home route with a client-side wrapped-style story flow.
- Added screens for intro, taxable income input, tax estimate, big-picture allocation, three category story cards, and a final summary shell.
- Kept taxable income in React component state only; no storage, cookies, server actions, or analytics.
- Integrated existing tax and allocation engines without changing their logic.
- Added motion and decorative wavy/poster motifs with reduced-motion handling.
- Added mobile Playwright interaction coverage for input, next/back/restart, final shell, caveat visibility, and empty browser storage.

Commands run:

- `npm run test:run` - passed
- `npm run test:e2e` - passed during iteration
- Playwright CLI mobile screenshot check at 390px width - passed after reducing headline scale to prevent clipping
- `npm run validate` - passed
- `npm run test:e2e` - passed
- `git diff --check` - passed

Result:

- Ticket 004 implemented for human review.
- Ticket 005 was not started.
