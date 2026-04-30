# Typography Clipping Hotfix Review

Date: 2026-04-30

Commit at capture time: `d8c61ec` plus pending typography clipping hotfix changes.

## Screenshots

- `390-intro.png`
- `390-income-input.png`
- `390-tax-result.png`
- `390-big-picture-allocation.png`
- `390-category-social-security.png`
- `390-final-summary.png`
- `390-share-preview.png`
- `430-intro.png`
- `430-income-input.png`
- `430-tax-result.png`
- `430-big-picture-allocation.png`
- `430-category-social-security.png`
- `430-final-summary.png`
- `430-share-preview.png`

## What Changed

- Hero title clamps now scale down at narrow mobile widths instead of letting long words clip.
- Hero text disables mid-word breaking and hyphenation.
- Hero numbers stay on one line with narrower mobile clamps.
- The intro `25-26` poster numerals are centered and remain fully inside the card at 390px and 430px.
- The top-right story counter is prevented from shrinking or clipping.

## Checks

- Compared against the matching `ticket-010` screenshots for the same screens and widths.
- Confirmed palette, copy, decorative poster shapes, and screen sequence are unchanged.
- Confirmed the only visual changes are typography sizing and overflow handling.
