# Ticket 016: Client-Side Share Card PNG Export

Status: Human Review

## Scope

Add real browser-only PNG export to the share card preview.

## Hard Rules

- Do not include the user's raw taxable income on the exported PNG, filename,
  URL, metadata, or alt text.
- Export must run entirely in the browser with no backend, upload, or
  third-party service.
- Do not store the user's income in browser APIs.
- Do not change tax, Budget, allocation, or source data logic.
- Do not add analytics.
- Do not start any later ticket.

## Requirements

- Pass the user's estimated tax amount from the final story flow to
  `/share-preview` through in-memory client state only.
- Fall back to the fixed QA sample on direct `/share-preview` loads and label it
  clearly as a sample.
- Add a Download PNG button with a loading state.
- Render the exported card as exactly 1080 by 1920 pixels.
- Use the deterministic filename
  `australian-budget-wrapped-2025-26.png`.
- Keep the share card design, copy, chart bars, outlined hero figure, and
  caveat intact.

## Tests

- The export filename does not contain taxable income digits.
- The share preview DOM does not include the raw taxable income literal.
- Direct `/share-preview` loads fall back to the labelled sample.
- The share flow does not write storage, cookies, or URL parameters.
- Clicking Download PNG triggers a PNG download with non-zero size and 1080 by
  1920 dimensions.

## Acceptance Commands

- `npm run validate`
- `npm run test:e2e`
- `git diff --check`
