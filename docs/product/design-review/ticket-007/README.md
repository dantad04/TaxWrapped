# Ticket 007 Design Review

Date: 2026-04-30

Commit being reviewed: Ticket 007 working tree captured from parent commit `50476b7` before the final `Polish wrapped budget charts` commit.

## Screenshots

- `390-intro.png`
- `390-income-input.png`
- `390-tax-result.png`
- `390-big-picture-chart.png`
- `390-category-social-security-chart.png`
- `390-category-health-chart.png`
- `390-category-education-chart.png`
- `390-spotlight-states-territories-chart.png`
- `390-final-summary-chart.png`
- `430-intro.png`
- `430-income-input.png`
- `430-tax-result.png`
- `430-big-picture-chart.png`
- `430-category-social-security-chart.png`
- `430-category-health-chart.png`
- `430-category-education-chart.png`
- `430-spotlight-states-territories-chart.png`
- `430-final-summary-chart.png`

## Chart Changes

- Replaced the big-picture preview bars with an accessible stacked allocation strip built from additive top-level Budget functions.
- Added real category share meters to the additive function story cards.
- Added a distinct dashed spotlight marker for non-additive spotlight cards.
- Replaced the final summary shell with a ranked horizontal bar chart that reconciles to the estimated tax total.
- Added chart data helper tests covering additive-only summaries, spotlight exclusion, zero and low-tax inputs, and reconciled totals.

## Known Remaining Weaknesses

- The final chart is intentionally compact at 390px; longer labels are kept short rather than shown with full technical category names.
- Chart motion is subtle and poster-like, but the next ticket should focus on methodology, sources, and privacy content rather than more visual polish.
- Spotlight treatment is intentionally explanatory, not a full program-level breakdown.

## Next Recommended Ticket

`docs/codex-board/queue/008-methodology-sources-privacy.md`
