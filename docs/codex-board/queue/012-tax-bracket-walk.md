# Ticket 012: Tax Bracket Walk Card

Status: Human Review

## Scope

Add one "How your tax was built" card between the tax estimate screen and the big-picture allocation screen.

## Hard Rules

- Do not change tax, Budget, allocation, or source data logic.
- Do not invent tax numbers; every figure must derive from the existing 2025-26 resident tax engine.
- Do not add a political angle, opinion, or value judgement about brackets, fairness, or government.
- Do not add analytics or storage.
- Do not start any later ticket.

## Requirements

- Show bracket-by-bracket rows for the ATO 2025-26 resident brackets the user's taxable income passes through.
- Include bracket range, marginal rate, dollars taxed in the bracket, and tax owed in the bracket.
- Include a LITO row showing the offset applied.
- Include a Medicare levy row only when Medicare levy is enabled.
- Include a final "Total estimate" row that matches the previous tax estimate screen.
- Ensure bracket rows, minus LITO, plus optional Medicare levy reconcile exactly to the engine total.
- Keep the card in the existing wrapped poster style with a charcoal background and compact editorial line items.
- Apply the Ticket 011 count-up reveal to the total only.

## Tests

- Add focused unit tests for representative incomes, LITO capping, Medicare toggle behavior, and ascending bracket order.
- Add Playwright coverage for tax estimate, bracket walk, allocation continuity, displayed total matching, and banned phrase absence on the card.

## Acceptance Commands

- `npm run validate`
- `npm run test:e2e`
- `git diff --check`
