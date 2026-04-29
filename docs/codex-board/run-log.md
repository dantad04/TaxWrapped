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
