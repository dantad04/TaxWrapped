# Ticket 014: Sourced Program Callouts

Status: Human Review

## Scope

Add one or two sourced program callouts to each top-level additive category card currently shown in the wrapped flow.

## Hard Rules

- Do not change tax, Budget, or allocation logic.
- Do not invent program names, amounts, or descriptions.
- Every program callout must trace to Budget Paper No. 1 2025-26, preferably Statement 5 sub-functions or Appendix A, or to a Portfolio Budget Statement already in the source registry.
- Do not add a political angle, party names, government names, policy critique, or campaign-style framing.
- Do not double-count spotlights; if a program is already in the spotlight rail, do not also surface it as a callout on the same card.
- Do not store the user's income.
- Do not start any later ticket.

## Requirements

- Extend the existing category model with optional `callouts: ProgramCallout[]`.
- Render at most two callouts per additive category card, below the hero amount and above the drilldown button.
- Each callout displays the user's proportional dollar contribution and one short neutral description.
- Callout amounts come from existing sourced sub-function rows in the drilldown dataset.
- Source links reach `/sources`.
- Use the Ticket 011 count-up pattern for callout amounts.

## Tests

- Every callout source ID resolves to `sourceRegistry`.
- Per-card callout contributions sum to no more than the parent category contribution.
- No callout duplicates a spotlight item on the same card.
- Banned political or judgemental phrases do not appear in callout copy.
- Playwright verifies callouts on at least three category cards and source-link navigation.

## Acceptance Commands

- `npm run validate`
- `npm run test:e2e`
- `git diff --check`
