# Ticket 007: Charts Polish

Status: Human Review

## Goal

Add or refine SVG-based charts for the budget allocation story.

## Allowed Scope

- Use SVG charts for allocation displays.
- Add accessible labels and text alternatives.
- Add tests for chart data binding and route rendering.
- Keep charts responsive on mobile.

## Non-goals

- Do not replace the allocation engine.
- Do not add canvas or a charting library unless the need is justified.
- Do not add share cards.
- Do not store income or add analytics.

## Acceptance Commands

- `npm run validate`
- `npm run test:e2e`
- `git diff --check`

## Visual Acceptance

Charts render on mobile and desktop, labels remain legible, and chart values match the allocation engine output.

## Handoff Requirements

Report files changed, chart behavior, visual checks performed, commands run, validation result, and risks. Stop after this ticket.
