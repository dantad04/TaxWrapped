# Australian Budget Wrapped MVP Final Review

Date: 2026-04-30

## What the MVP Does

- Lets a user enter taxable income in the browser.
- Estimates 2025-26 Australian resident individual Commonwealth tax.
- Includes Low Income Tax Offset.
- Includes a simplified Medicare levy setting in the current flow.
- Allocates the estimated tax proportionally across additive top-level Australian Government Budget functions.
- Shows non-additive spotlight cards separately from the final summary.
- Provides methodology, sources, privacy, and sample share-preview surfaces.
- Provides a designed 1080 by 1920 sample share-card preview for review.

## What the MVP Does Not Do

- It does not calculate a full tax return.
- It does not model HELP/HECS, Medicare levy surcharge, Medicare levy reductions or exemptions, family thresholds, deductions, non-resident rules, working holiday maker rules, or unusual tax situations.
- It does not show a literal tracing of a person's tax payment.
- It does not claim taxes are hypothecated.
- It does not include a dynamic user-specific PNG export or download flow.
- It does not upload share images.
- It does not include analytics, login, accounts, backend storage, or deployment configuration.

## Data Sources

- Australian Government Budget Paper No. 1 2025-26, Statement 5, Table 5.3 for top-level expenses by function.
- Australian Government Budget Paper No. 1 2025-26, Statement 5, Table 5.3.1 for selected non-additive spotlight programs.
- Australian Taxation Office resident individual tax rates for 2025-26.
- Australian Taxation Office Low Income Tax Offset guidance.
- Australian Taxation Office Medicare levy guidance.

The `/sources` page is generated from the app source registry and explains what each source supports.

## Tax Assumptions

- Input is taxable income, not gross salary.
- Rules are for Australian resident individuals for the 2025-26 income year.
- LITO is included and cannot reduce income tax below zero.
- Medicare levy is simplified as 2% of taxable income when included.
- Negative taxable income inputs are treated as zero by the tax engine.
- Monetary outputs are rounded deterministically.

## Allocation Assumptions

- Final summary rows use additive top-level Budget functions only.
- Spotlight programs are non-additive and excluded from final-summary totals.
- Published Budget function rows are rounded; the app normalises across the additive row total for allocation.
- Allocation rounding uses a deterministic largest-remainder method so displayed final-summary rows reconcile to the estimated tax total.

## Privacy Posture

- Income remains in React/client state during the current page session.
- Income is not stored in localStorage, sessionStorage, cookies, a database, analytics, or server logs by app code.
- The app has no API routes or server actions that receive income.
- The share preview uses a fixed QA sample estimate and does not render raw taxable income.
- The final-summary entry point is labelled as a sample share preview to avoid implying it reflects the user's entered result.

## Known Limitations

- The share-card preview is static/sample-based, not user-specific.
- There is no client-side PNG download button.
- The wrapped flow currently has one simplified Medicare levy mode in the UI.
- Transparency pages are explanatory scroll pages, not story-card sequences.
- Visual QA has focused on 390px and 430px mobile widths plus screenshot review; broader device/browser review is still recommended.

## Launch Blockers

- Human review of source wording, tax assumptions, and privacy claims is still required before any public launch.
- A legal/tax disclaimer review is recommended before public release.
- The sample share-preview entry should remain labelled as sample until a dynamic client-side export is implemented and reviewed.
- No deployment/privacy review has been performed in this repo slice.

## Recommended Next Work After MVP

- Human review of methodology, caveats, and source presentation.
- Browser/device QA beyond the 390px and 430px screenshot set.
- Accessibility pass for keyboard, screen reader, contrast, and reduced-motion behavior.
- Decide whether to keep the sample share preview or implement a reviewed client-side user-specific export.
- Public-launch privacy review if analytics, hosting logs, or deployment services are introduced later.

## Manual Review Checklist

- Enter `0`, `20000`, and `90000` as taxable income and confirm the flow completes.
- Confirm Restart clears the visible income field.
- Confirm browser local storage, session storage, cookies, and URL query string do not contain entered income.
- Confirm final summary total matches the estimated tax amount.
- Confirm spotlight cards say non-additive and are not included in the final summary total.
- Confirm `/methodology`, `/sources`, and `/privacy` are reachable from the flow and readable on mobile.
- Confirm `/share-preview` is clearly labelled as a fixed sample preview.
- Confirm the 1080 by 1920 share-card screenshot is legible and does not include raw taxable income.
- Confirm copy does not imply literal earmarking or hypothecation.
