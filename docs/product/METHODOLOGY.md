# Methodology

Status: Budget data model added

This document will be completed in future tickets after the tax engine and allocation engine are implemented and reviewed.

## Budget Data Model

The 2025-26 Budget dataset uses Australian Government Budget Paper No. 1 2025-26, Statement 5.

- Top-level expense functions use Statement 5, Table 5.3.
- Selected spotlight programs use Statement 5, Table 5.3.1.
- Amounts are stored as AUD millions.
- Top-level expense functions are additive and are the only items intended to sum to total expenses.
- Spotlight programs are non-additive examples from the top program expenses table and must not be added to the function total.
- The published top-level function rows are rounded to the nearest million. The stored function rows sum to AUD 785,671 million while the published total is AUD 785,670 million, so the data model records a one million rounding tolerance.

Planned methodology coverage:

- How taxable income is converted into an estimated Commonwealth income tax amount.
- Which offsets, levies, thresholds, and assumptions are included or excluded.
- How Australian Government spending categories are selected.
- How the estimated tax amount is proportionally allocated across spending categories.
- Why the result is illustrative and not an exact trace of a user's tax dollars.

Core caveat:

This is an estimate. Taxes are not hypothecated.

Privacy constraint:

Income must remain client-side only and must not be stored in browser storage, cookies, a database, analytics, or server logs.
