# Ticket 003: Allocation Engine

Status: Ready

## Goal

Allocate the estimated Commonwealth tax amount proportionally across reviewed Australian Government spending categories.

## Allowed Scope

- Add a pure TypeScript allocation module.
- Consume the budget data model from Ticket 001.
- Add rounding and total reconciliation tests.
- Document allocation assumptions in `docs/product/METHODOLOGY.md`.

## Non-goals

- Do not build the full wrapped story flow.
- Do not add charts or share cards.
- Do not change the tax engine except for a tightly scoped integration need.
- Do not store income or add analytics.

## Acceptance Commands

- `npm run validate`
- `npm run test:e2e`
- `git diff --check`

## Visual Acceptance

No new visual acceptance is required unless a minimal readout is added for integration proof.

## Handoff Requirements

Report files changed, rounding behavior, commands run, validation result, and risks. Stop after this ticket.
