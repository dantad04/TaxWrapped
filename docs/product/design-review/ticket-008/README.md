# Ticket 008 Design Review

Date: 2026-04-30

Commit being reviewed: Ticket 008 working tree captured from parent commit `81b0336` before the final `Add methodology sources and privacy pages` commit.

## Screenshots

- `390-methodology.png`
- `390-sources.png`
- `390-privacy.png`
- `390-final-summary-transparency-links.png`
- `430-methodology.png`
- `430-sources.png`
- `430-privacy.png`
- `430-final-summary-transparency-links.png`

## Methodology, Sources, and Privacy Changes

- Replaced placeholder transparency pages with mobile-first wrapped-style pages.
- Added methodology content covering taxable income, resident 2025-26 tax rates, LITO, simplified Medicare levy, exclusions, proportional allocation, non-hypothecation, additive functions, non-additive spotlights, and deterministic rounding.
- Built the sources page from the app source registry and added source-specific support notes.
- Added privacy content explaining client-side income handling, no stored taxable income, no income browser storage, no cookies for income, and no analytics in v1.
- Added compact methodology, sources, and privacy links to the story flow near result/final-summary surfaces.

## Known Remaining Weaknesses

- Long source URLs are shown directly for transparency and can look dense on narrow mobile screens.
- The methodology page is intentionally concise; a later public copy pass could tune tone further without changing the model.
- Transparency pages are scroll pages, not story-card sequences.

## Next Recommended Ticket

`docs/codex-board/queue/009-share-card.md`
