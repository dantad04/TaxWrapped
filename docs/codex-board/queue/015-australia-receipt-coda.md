# Ticket 015: Australia Receipt Coda Card

Status: Human Review

## Scope

Add one final "Australia's receipt" coda card after the personal illustrative receipt.

## Hard Rules

- Do not change tax, Budget, or allocation logic.
- Do not invent figures; use the published 2025-26 Commonwealth total expenses figure already in `src/data/auBudget2025_26.ts`.
- Do not add a political angle.
- Do not store the user's income.
- Do not start any later ticket.

## Requirements

- Add a final coda card after the personal receipt card.
- Show label "ZOOMING OUT" and headline "Australia's 2025-26 Commonwealth bill."
- Format the existing total expenses figure as `$785.7B`.
- Show the user's illustrative slice as "about 1 in Y of the total" when the estimated tax amount is above zero.
- Omit the slice line for zero-tax cases.
- Round Y to the nearest 1,000 above 100,000.
- Include Share preview, Methodology, Sources, and Privacy links.
- Use the Ticket 011 count-up pattern for the total expenses hero.

## Tests

- Unit-test total formatting, `1 in Y` calculation, zero-tax omission, and coda source copy.
- Playwright-test that the coda appears after the personal receipt and Restart returns to the intro.

## Acceptance Commands

- `npm run validate`
- `npm run test:e2e`
- `git diff --check`
