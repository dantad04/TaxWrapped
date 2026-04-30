# Ticket 009 Design Review

Date: 2026-04-30

Commit being reviewed: `1d898ec` plus the pending Ticket 009 share-card changes.

## Screenshots

- `390-final-summary-share-entry.png`
- `390-share-preview.png`
- `390-share-card-portrait-preview.png`
- `430-final-summary-share-entry.png`
- `430-share-preview.png`
- `430-share-card-portrait-preview.png`
- `1080x1920-share-card.png`

## Share-Card Changes

- Added a `/share-preview` route for design QA using a fixed sample estimate.
- Added a portrait share-card component with a 1080 by 1920 SVG layout.
- Included product name, estimated Commonwealth tax, 2025-26 Budget label, top additive Budget allocations, a compact bar-list summary, methodology/source pointer, and the non-hypothecation caveat.
- Added a lightweight Share preview link on the final summary screen.
- Kept raw taxable income off the share card, share preview text, screenshots, filenames, and accessible labels.

## Export Status

True client-side PNG download/export is not implemented in this slice. The card is available as a polished client-rendered preview, and the review folder includes a Playwright-generated 1080 by 1920 PNG artifact.

## Known Remaining Weaknesses

- The preview route uses a fixed sample estimate for QA rather than a user-specific export flow.
- There is no one-tap browser download button yet.
- The SVG poster layout is manually tuned and may need another pass if the top allocation labels change.

## Next Recommended Ticket

Run `docs/codex-board/queue/010-qa-hardening.md` next.
