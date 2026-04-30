# Ticket 011: Count-Up Reveal And Drilldown Scroll Affordance

Status: Human Review

## Scope

Add animated count-up reveal to hero dollar figures, and add a scroll affordance to drilldown lists.

## Hard Rules

- Do not change tax, Budget, allocation, or source data logic.
- Do not change copy.
- Do not change the palette or visual system.
- Do not add analytics or storage.
- Do not start any new ticket after this one.

## Goal A: Number Count-Up Reveal

When a screen with a hero dollar figure is revealed, the number should count up from 0 to its final value over 600-800ms with an ease-out curve.

Apply this to:

- the tax estimate hero dollar figure
- each category card hero contribution
- the drilldown headline contribution
- the final summary receipt total
- the share-card preview hero figure if it is rendered live in the DOM

Implementation requirements:

- Pure React, no external animation libraries.
- Use a small `useCountUp(target, durationMs)` hook that respects `prefers-reduced-motion`; when reduced motion is set, render the final value immediately with no animation.
- Format the displayed value with the existing currency formatter so commas and the dollar sign behave correctly during the count.
- The animation should not cause layout shift. Reserve the final width.
- Tie the animation to mount of the hero element. When the user goes back and forward between cards, the count should re-trigger.
- The animation must not block `Next`, `Done`, or `Open breakdown` interactions.

## Goal B: Drilldown Scroll Affordance

On the category drilldown card, the bar list scrolls and currently gives no visual cue that more content exists below the visible area.

Add a subtle scroll affordance:

- A short fade gradient at the bottom of the scroll container, matching the card background, that appears only when there is more content below.
- The fade must hide when the user has scrolled to the bottom.
- It must work on both off-white and charcoal card variants.
- It must not interfere with bar interactions; use `pointer-events: none`.
- Respect `prefers-reduced-motion`; no fancy transition required.

## Tests

- Count-up hook returns the final value immediately when `prefers-reduced-motion` is set.
- Count-up hook eventually returns the final target value.
- Drilldown scroll container renders the affordance when content overflows.
- Existing flow tests still pass without modification.

## Review Notes

- Create `docs/product/design-review/ticket-011/README.md` with date, commit, and change summary.
- No screenshot generation is required for this ticket.

## Acceptance Commands

- `npm run validate`
- `npm run test:e2e`
- `git diff --check`
