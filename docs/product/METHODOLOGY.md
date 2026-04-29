# Methodology

Status: Budget data model and tax estimate engine added

This document will be completed in future tickets after the allocation engine is implemented and reviewed.

## Budget Data Model

The 2025-26 Budget dataset uses Australian Government Budget Paper No. 1 2025-26, Statement 5.

- Top-level expense functions use Statement 5, Table 5.3.
- Selected spotlight programs use Statement 5, Table 5.3.1.
- Amounts are stored as AUD millions.
- Top-level expense functions are additive and are the only items intended to sum to total expenses.
- Spotlight programs are non-additive examples from the top program expenses table and must not be added to the function total.
- The published top-level function rows are rounded to the nearest million. The stored function rows sum to AUD 785,671 million while the published total is AUD 785,670 million, so the data model records a one million rounding tolerance.

## Tax Estimate Engine

The tax estimate engine uses taxable income, not gross salary. It is a public-facing explanatory estimate for Australian resident individuals for the 2025-26 income year, not an ATO-grade tax return calculator.

The v1 estimate includes:

- Australian resident individual income tax rates for 2025-26.
- Low income tax offset (LITO), capped so it cannot reduce income tax below zero.
- Optional simplified Medicare levy, calculated as 2% of taxable income when enabled.

The v1 estimate excludes:

- HELP/HECS repayments.
- Medicare levy surcharge.
- Medicare levy reductions and exemptions.
- Spouse, dependant, and family Medicare thresholds.
- Seniors and pensioners tax offset.
- Private health insurance rebate.
- Non-resident and working holiday maker tax rules.
- Deductions, business income complexity, capital gains complexity, and unusual tax situations.
- Offsets other than LITO.

Negative taxable income inputs are treated as zero. Monetary outputs are rounded deterministically to cents.

Planned methodology coverage:

- How Australian Government spending categories are selected.
- How the estimated tax amount is proportionally allocated across spending categories.
- Why the result is illustrative and not an exact trace of a user's tax dollars.

Core caveat:

This is an estimate. Taxes are not hypothecated.

Privacy constraint:

Income must remain client-side only and must not be stored in browser storage, cookies, a database, analytics, or server logs.
