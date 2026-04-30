# Methodology

Status: Budget data model, tax estimate engine, allocation engine, and public methodology surface added

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

## Allocation Engine

The allocation engine takes the user's estimated Commonwealth tax amount and allocates it proportionally across Australian Government Budget categories.

- Allocations are illustrative only.
- Taxes are not hypothecated.
- The allocation does not imply that a user's exact dollars went to specific functions or programs.
- Final summary allocations use additive top-level Budget functions from Statement 5, Table 5.3.
- The top-level Budget function rows are normalised against their own additive row total of AUD 785,671 million, not the rounded published total of AUD 785,670 million.
- Spotlight programs from Table 5.3.1 are non-additive highlights and must not be added to the final summary total.
- Final summary rounding uses a deterministic largest-remainder method at cent precision so displayed function allocations sum exactly to the user's estimated tax total.
- Stable tie-breaking follows original Budget function order.

Core caveat:

This is an estimate. Taxes are not hypothecated.

Privacy constraint:

Income must remain client-side only and must not be stored in browser storage, cookies, a database, analytics, or server logs.
