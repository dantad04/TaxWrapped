# Ticket 002: Tax Engine

Status: Human Review

## Goal

Implement a client-side Commonwealth income tax estimate for taxable income.

## Allowed Scope

- Add a pure TypeScript tax calculation module.
- Add tests for tax brackets, edge cases, zero income, boundary values, and invalid inputs.
- Document assumptions in `docs/product/METHODOLOGY.md`.

## Non-goals

- Do not store income in localStorage, sessionStorage, cookies, a database, analytics, or server logs.
- Do not build the wrapped story flow.
- Do not build spending allocation.
- Do not add server actions, API routes, analytics, or persistence.

## Acceptance Commands

- `npm run validate`
- `npm run test:e2e`
- `git diff --check`

## Visual Acceptance

No full visual flow is required. Any UI exposure must be minimal and must keep income client-side only.

## Handoff Requirements

Report files changed, tax assumptions, commands run, validation result, and remaining risks. Stop after this ticket.
