# Sorted Drilldown And Laptop Preview

Date: 2026-05-01

Commit being reviewed: this Ticket 017 review commit on top of `d216b09`.

## Screenshots

- `390-drilldown-social-security.png`
- `430-drilldown-social-security.png`
- `1280x800-intro.png`
- `1280x800-tax-estimate.png`
- `1280x800-category-social-security.png`
- `1280x800-drilldown-social-security.png`
- `1280x800-final-summary.png`
- `1440x900-intro.png`
- `1440x900-drilldown-social-security.png`
- `1440x900-coda.png`

## Drilldown Sorting

- Drilldown rows now sort by the computed user contribution amount, descending.
- Equal computed contributions keep the original source order as the stable tie-breaker.
- Sorting is applied to the returned drilldown view rows, so the visual list, bar colours, conic chart order, and row labels stay aligned.
- The raw Budget source data remains in its authored order and is not mutated.
- Row totals still reconcile to the parent contribution after cent rounding.

## Laptop Layout

- Added a desktop stage from the laptop breakpoint up, with the same wrapped story card framed as the central object.
- Added a lightweight side rail with product name, current step progress, caveat, and Methodology/Sources/Privacy links.
- The desktop card now uses a viewport-capped height and width so 1280x800 and 1440x900 keep controls inside the visible frame.
- The drilldown list uses a compact laptop/mobile list treatment with a scroll affordance so labels and amounts remain visible.
- The mobile flow remains the same route and story order; no preview route, analytics, storage, or extra dependency was added.

## Known Remaining Weaknesses

- The constrained 390px and 430px drilldown card shows the top rows first and relies on the existing internal scroll affordance for later rows.
- 1366x768 has less vertical headroom than the captured 1280x800 and 1440x900 views; the card is viewport-capped, but category cards with callouts remain the laptop viewport most likely to feel tight.
- The side rail intentionally does not duplicate Back/Next/Restart controls, so keyboard users still use the in-card controls.
