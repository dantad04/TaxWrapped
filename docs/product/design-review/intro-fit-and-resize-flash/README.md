# Intro fit and resize flash review

Generated: 2026-05-01

## Intro viewport captures

- `intro-360x780.png` - START rect top 679.17, bottom 724.77, no page scroll.
- `intro-390x844.png` - START rect top 739.47, bottom 785.06, no page scroll.
- `intro-430x932.png` - START rect top 822.36, bottom 867.95, no page scroll.

Mobile intro headline max: 58px. Observed fitted sizes were 45.63px at
360x780, 50.13px at 390x844, and 55.84px at 430x932.

## Resize flash capture

- `transition-01-income-input-ready.png` - income input filled before advancing.
- `transition-02-first-frame-hidden.png` - first tax-estimate transition frame with fit text hidden.
- `transition-03-tax-total-fitted.png` - tax total revealed after fit.
- `transition-intro-income-tax.webm` - short intro to income input to tax estimate recording.

Transition check at 390x844: the first tax-total frame was
`visibility: hidden` with `data-fit-ready="false"` at the max 108px layout
size. The revealed tax total was `visibility: visible`,
`data-fit-ready="true"`, and 67.71px.
