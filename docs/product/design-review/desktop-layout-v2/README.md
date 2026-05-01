# Desktop Layout V2

Date: 2026-05-01

## Screenshot Matrix

1280x800:

- `1280x800-intro.png`
- `1280x800-income-input.png`
- `1280x800-tax-estimate.png`
- `1280x800-bracket-walk.png`
- `1280x800-big-picture.png`
- `1280x800-category-social-security.png`
- `1280x800-category-health.png`
- `1280x800-category-education.png`
- `1280x800-drilldown-social-security.png`
- `1280x800-spotlight-states.png`
- `1280x800-final-summary.png`
- `1280x800-coda.png`

1366x768:

- `1366x768-intro.png`
- `1366x768-drilldown-social-security.png`
- `1366x768-final-summary.png`

1440x900:

- `1440x900-intro.png`
- `1440x900-tax-estimate.png`
- `1440x900-drilldown-social-security.png`
- `1440x900-final-summary.png`
- `1440x900-coda.png`

## Before / After

Before: `docs/product/design-review/sorted-drilldown-laptop-preview/`

The previous laptop layout centred the mobile card on a black canvas, used
separate side rails, and could let category-card content extend past the rounded
card frame.

After: this folder.

The desktop layout now uses the full viewport as the stage surface. At desktop
widths, content is arranged as an editorial grid with persistent top and bottom
chrome, a left hero column, and a right support column for charts, callouts, and
drilldown bars.

## Visual Fit Confirmation

- No black void surrounds a smaller mobile card.
- The previous side rails are removed.
- Bottom controls remain visible at 1280x800 and 1366x768.
- The drilldown subcategory list fits in the right column without the mobile
  scroll affordance.
- The final summary receipt spans the desktop composition below the hero figure.
- Final summary bars now render visible fills proportional to each row's
  computed weight.

## Remaining Risk

1366x768 remains the tightest supported laptop viewport. The final summary and
category cards fit in the captured state, but they are the views most likely to
need another density pass if more callouts or receipt rows are added later.
