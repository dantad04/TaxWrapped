# Ticket 008: Methodology, Sources, and Privacy

Status: Human Review

## Goal

Replace placeholder methodology, sources, and privacy pages with reviewed product content.

## Allowed Scope

- Finalise methodology explanations based on implemented tax and allocation behavior.
- Add reviewed source references for budget data, tax assumptions, and caveats.
- Expand privacy content to explain client-side income handling.
- Add tests for the presence of key caveats and source links.

## Non-goals

- Do not change tax or allocation logic unless a documented content mismatch requires a separate fix.
- Do not add analytics, cookies, persistence, or income storage.
- Do not add share cards or chart polish.

## Acceptance Commands

- `npm run validate`
- `npm run test:e2e`
- `git diff --check`

## Visual Acceptance

Methodology, sources, and privacy pages are readable on mobile, use the app design system, and clearly state that taxes are not hypothecated.

## Handoff Requirements

Report files changed, source references added, commands run, validation result, and risks. Stop after this ticket.
