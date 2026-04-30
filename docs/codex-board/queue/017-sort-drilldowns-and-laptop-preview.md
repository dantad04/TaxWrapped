# Ticket 017: Sort Drilldowns And Laptop Preview

Status: Human Review

## Scope

Sort category drilldown rows by computed contribution size and add a polished
laptop presentation layer for the existing wrapped story flow.

## Hard Rules

- Do not change tax, Budget, allocation, source, share-card, or export logic.
- Do not change factual Budget subcategory values.
- Do not invent new subcategories, program names, or descriptions.
- Do not add analytics or storage.
- Do not store the user's income.
- Do not introduce a third-party library.
- Do not start any later ticket.

## Completed

- Drilldown view rows sort by computed contribution amount, descending.
- Equal computed contributions keep original source order as the stable
  tie-breaker.
- Raw source data arrays are not mutated.
- Drilldown visual bars and row labels use the same sorted row output.
- Added laptop-stage framing and a lightweight desktop side rail for wider
  viewports while preserving the same mobile story sequence.
- Added fresh design-review screenshots under
  `docs/product/design-review/sorted-drilldown-laptop-preview/`.

## Acceptance Commands

- `npm run validate`
- `npm run test:e2e`
- `git diff --check`
