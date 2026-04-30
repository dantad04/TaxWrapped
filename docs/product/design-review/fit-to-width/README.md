# Fit-to-Width Hero Typography Review

Date: 2026-05-01

## Matrix

Taxable incomes:

- 0
- 5
- 18,200
- 90,000
- 250,000
- 1,000,000

Viewport widths:

- 360px
- 390px
- 430px

Captured screens per income and viewport:

- intro
- tax estimate
- big-picture allocation
- Social security & welfare category
- Health category
- Education category
- States and territories spotlight
- final summary
- coda

## Result

Generated 162 screenshots under income-specific folders. The fit-to-width
matrix uses the shared `useFitText` primitive and the automated regression test
confirms each fitted hero element stays within its visible container at all
listed incomes and viewport widths.
