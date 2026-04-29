# Ticket 001: Budget Data Model

Status: Human Review

## Goal

Create the first reviewed Australian Government spending data model that can support proportional allocation in later tickets.

## Allowed Scope

- Define static data structures for budget categories.
- Add a small reviewed fixture or source-derived dataset only if source provenance is documented.
- Add tests for category totals, ordering, and required fields.
- Update `docs/product/SOURCES.md` only for sources actually used in this ticket.

## Non-goals

- Do not build the tax engine.
- Do not build the allocation engine.
- Do not build the wrapped story flow.
- Do not add charts, sharing, analytics, or persistence.
- Do not store or request user income.

## Acceptance Commands

- `npm run validate`
- `npm run test:e2e`
- `git diff --check`

## Visual Acceptance

No new visual surface is required unless a small placeholder label is needed to expose the data safely.

## Handoff Requirements

Report files changed, sources used, checks run, validation result, and any data caveats. Stop after this ticket.
