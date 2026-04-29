# Ticket 004: Mobile Story Flow

Status: Ready

## Goal

Create the first mobile-first story flow that accepts taxable income client-side and presents the estimated tax and allocation result.

## Allowed Scope

- Add the income input UI.
- Keep income in component state only.
- Integrate the tax engine and allocation engine.
- Add route, render, interaction, and privacy tests.
- Update copy only where needed for the flow.

## Non-goals

- Do not store income in localStorage, sessionStorage, cookies, a database, analytics, or server logs.
- Do not add analytics.
- Do not build final animation polish, SVG charts, or share cards.
- Do not change source data unless a blocker is found and documented.

## Acceptance Commands

- `npm run validate`
- `npm run test:e2e`
- `git diff --check`

## Visual Acceptance

On mobile width, the user can enter taxable income, advance through the placeholder story, and see the caveat that taxes are not hypothecated without layout overlap.

## Handoff Requirements

Report files changed, flow behavior, privacy checks, commands run, validation result, and risks. Stop after this ticket.
