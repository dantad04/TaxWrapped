# Ticket 009: Share Card

Status: Ready

## Goal

Create a shareable result card that communicates the illustrative budget allocation without exposing private income.

## Allowed Scope

- Add a client-side share card component.
- Avoid including raw taxable income unless explicitly approved in the ticket prompt.
- Add download or copy behavior only if it does not require analytics or server storage.
- Add tests for privacy-sensitive output.

## Non-goals

- Do not add server-side rendering of private income.
- Do not store income in localStorage, sessionStorage, cookies, a database, analytics, or server logs.
- Do not add social tracking pixels or analytics.
- Do not change tax or allocation logic except for a documented integration defect.

## Acceptance Commands

- `npm run validate`
- `npm run test:e2e`
- `git diff --check`

## Visual Acceptance

Share card is legible on mobile and desktop, does not reveal raw income by default, and includes the illustrative estimate caveat.

## Handoff Requirements

Report files changed, privacy behavior, visual checks performed, commands run, validation result, and risks. Stop after this ticket.
