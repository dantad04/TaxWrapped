# Run Log

## Initial setup slice

Status: Complete

Scope:

- Scaffold Next.js TypeScript app.
- Add Tailwind CSS, Vitest, and Playwright.
- Add placeholder routes for `/`, `/methodology`, `/sources`, and `/privacy`.
- Add product docs and future ticket queue.
- Add minimal route and privacy tests.

Commands run:

- `npm run validate` - passed
- `npm run test:e2e` - passed after moving Playwright to a dedicated e2e port
- `git diff --check` - passed

Result:

- Initial setup slice completed.
- Future tickets remain `Status: Ready`.
- Ticket 001 was not started.

## Ticket 001: Budget Data Model

Status: Human Review

Scope:

- Added typed source registry for Budget Paper No. 1 2025-26 Statement 5 tables.
- Added 2025-26 top-level function expense dataset and selected non-additive spotlight programs.
- Added pure budget data helpers.
- Added focused unit tests for source coverage, amounts, labels, slugs, non-additive spotlight handling, and published-total rounding tolerance.
- Updated product sources and methodology docs for the budget data model only.

Commands run:

- `npm run validate` - passed
- `npm run test:e2e` - passed
- `git diff --check` - passed

Result:

- Ticket 001 implemented for human review.
- Ticket 002 was not started.

## Ticket 002: Tax Engine

Status: Human Review

Scope:

- Added Australian resident individual tax estimate types and pure 2025-26 calculation helpers.
- Added ATO source registry entries for resident tax rates, LITO, and Medicare levy.
- Added LITO handling capped so it cannot reduce income tax below zero.
- Added optional simplified Medicare levy at 2% of taxable income.
- Added focused unit tests for bracket boundaries, LITO thresholds, Medicare toggle, negative and non-finite inputs, and sample estimates.
- Updated product sources and methodology docs for tax-engine assumptions only.

Commands run:

- `npm run test:run` - passed
- `npm run validate` - passed
- `npm run test:e2e` - passed
- `git diff --check` - passed

Result:

- Ticket 002 implemented for human review.
- Ticket 003 was not started.

## Ticket 003: Allocation Engine

Status: Human Review

Scope:

- Added pure allocation types, cent rounding helpers, and Budget allocation functions.
- Added proportional allocation across additive top-level Budget functions.
- Added non-additive spotlight allocation helpers for later story highlights.
- Added deterministic largest-remainder cent rounding for final summary allocations.
- Added focused unit tests for zero tax, representative totals, determinism, additive/non-additive handling, source linkage, negative input, small totals, and rounding tie-breaks.
- Updated methodology docs for allocation assumptions only.

Commands run:

- `npm run test:run` - passed
- `npm run validate` - passed
- `npm run test:e2e` - passed
- `git diff --check` - passed

Result:

- Ticket 003 implemented for human review.
- Ticket 004 was not started.

## Ticket 004: Mobile Story Flow

Status: Human Review

Scope:

- Added `docs/product/DESIGN_DIRECTION.md` from the supplied design direction because ticket 004 requires it as the visible design source of truth.
- Replaced the placeholder home route with a client-side wrapped-style story flow.
- Added screens for intro, taxable income input, tax estimate, big-picture allocation, three category story cards, and a final summary shell.
- Kept taxable income in React component state only; no storage, cookies, server actions, or analytics.
- Integrated existing tax and allocation engines without changing their logic.
- Added motion and decorative wavy/poster motifs with reduced-motion handling.
- Added mobile Playwright interaction coverage for input, next/back/restart, final shell, caveat visibility, and empty browser storage.

Commands run:

- `npm run test:run` - passed
- `npm run test:e2e` - passed during iteration
- Playwright CLI mobile screenshot check at 390px width - passed after reducing headline scale to prevent clipping
- `npm run validate` - passed
- `npm run test:e2e` - passed
- `git diff --check` - passed

Result:

- Ticket 004 implemented for human review.
- Ticket 005 was not started.

## Ticket 005: Design System

Status: Human Review

Scope:

- Inspected the four attached visual reference images before implementation.
- Consolidated the current story flow around a stronger poster-like visual system.
- Added off-white and charcoal card treatments, bold red/blue/green/magenta accent blocking, outlined hero dollar figures, checker blocks, mini pie marks, contour-line motifs, and stronger rounded story controls.
- Kept the existing story screens, tax engine, allocation engine, source data, and client-only income state unchanged.
- Generated mobile screenshots at 390px and 430px widths for intro, income input, tax result, big-picture allocation, one category story card, and final summary shell.

Commands run:

- `git status --short` - clean before editing
- `npm run typecheck` - passed during iteration
- `npm run test:run` - passed during iteration
- `npm run lint` - passed during iteration
- Playwright screenshot capture at 390px and 430px widths - passed after visual iteration
- `npm run validate` - passed
- `npm run test:e2e` - passed
- `git diff --check` - passed

Result:

- Ticket 005 implemented for human review.
- Ticket 006 was not started.

## Ticket 006: Story Card Polish

Status: Human Review

Scope:

- Re-inspected the four visual reference images and the Ticket 005 design-review screenshots before implementation.
- Expanded the post-tax story sequence using existing sourced Budget model data only.
- Added additive function story cards for social security and welfare, health, education, defence, and fuel and energy.
- Added non-additive spotlight story cards for revenue assistance to States and Territories and Commonwealth Debt Management.
- Improved the big-picture allocation card, story progress treatment, category card copy hierarchy, lightweight caveats, and final summary ending.
- Kept tax, Budget, allocation, source data, storage, and analytics behaviour unchanged.
- Generated Ticket 006 screenshots at 390px and 430px for intro, input, tax result, big picture, five function cards, two spotlight cards, and final summary.
- Updated Playwright coverage for the expanded story path and non-additive spotlight language.

Commands run:

- `git status --short` - clean before editing
- `npm run typecheck` - passed during iteration
- `npm run lint` - passed during iteration
- `npm run test:run` - passed during iteration
- `npm run test:e2e` - failed once during iteration on a strict locator, then passed after tightening the assertion
- `npm run build` - passed for production screenshot capture
- Playwright screenshot capture at 390px and 430px widths - passed after visual inspection
- `npm run validate` - passed
- `npm run test:e2e` - passed
- `git diff --check` - passed

Result:

- Ticket 006 implemented for human review.
- Ticket 007 was not started.

## Ticket 007: Charts Polish

Status: Human Review

Scope:

- Replaced presentational preview bars with accessible chart components for the wrapped flow.
- Added a stacked allocation strip for the big-picture Budget allocation card using additive top-level functions only.
- Added category share meters to additive function story cards.
- Added a distinct non-additive spotlight marker treatment for States and Territories and debt interest spotlight cards.
- Added a final ranked horizontal bar chart that reconciles to the estimated tax total and excludes spotlight programs.
- Added chart data helpers and focused tests for additive-only chart rows, spotlight exclusion, reconciled totals, and zero/low-tax inputs.
- Generated Ticket 007 screenshots at 390px and 430px for intro, input, tax result, big-picture chart, three category chart cards, one spotlight chart, and final summary chart.
- Kept tax, Budget, allocation, source data, storage, and analytics behaviour unchanged.

Commands run:

- `git status --short` - clean before editing
- `command -v npx >/dev/null 2>&1; echo $?` - returned `0`
- `npm run typecheck` - passed during iteration
- `npm run lint` - passed during iteration
- `npm run test:run` - passed during iteration
- `npm run build` - passed for production screenshot capture
- Playwright screenshot capture at 390px and 430px widths - passed after correcting the capture step count
- `npm run validate` - passed
- `npm run test:e2e` - failed once on an outdated chart-key text assertion, then passed after updating the assertion
- `git diff --check` - passed

Result:

- Ticket 007 implemented for human review.
- Ticket 008 was not started.

## Ticket 008: Methodology, Sources, and Privacy

Status: Human Review

Scope:

- Replaced placeholder `/methodology`, `/sources`, and `/privacy` pages with wrapped-style transparency pages.
- Added methodology content for taxable income, 2025-26 resident tax rates, LITO, simplified Medicare levy, exclusions, proportional allocation, non-hypothecation, additive Budget functions, non-additive spotlights, and deterministic rounding.
- Surfaced every existing source registry entry on `/sources` with title, publisher, source year/context, URL, locator, and plain-English support notes.
- Added privacy copy confirming income stays client-side, taxable income is not stored, no income browser storage or cookies are used, no analytics are added in v1, and the result is not tax advice.
- Added compact Methodology, Sources, and Privacy links near the tax/allocation/final story surfaces without changing calculation logic.
- Updated tests for transparency content, source registry rendering, banned phrase absence, storage API absence, and final-summary transparency links.
- Generated Ticket 008 screenshots at 390px and 430px for methodology, sources, privacy, and the final summary with transparency links.
- Kept tax, Budget, allocation, source data, analytics, storage, and share-card functionality unchanged.

Commands run:

- `git status --short` - clean before editing
- `npm run typecheck` - passed during iteration
- `npm run lint` - passed during iteration
- `npm run test:run` - failed once during iteration on outdated heading assertions, then passed after restoring route-name primary headings
- `npm run build` - passed for production screenshot capture
- Playwright screenshot capture at 390px and 430px widths - passed after correcting the final-summary step count and tightening transparency heading scale
- `npm run validate` - passed
- `npm run test:e2e` - passed
- `git diff --check` - passed

Result:

- Ticket 008 implemented for human review.
- Ticket 009 was not started.

## Ticket 009: Share Card

Status: Human Review

Scope:

- Added a `/share-preview` route for a polished social-poster share-card preview.
- Added a 1080 by 1920 SVG share-card component with product name, estimated Commonwealth tax, source year, top additive Budget allocations, compact bar-list summary, caveat, and methodology/source pointer.
- Added share-card data helpers that reuse existing additive allocation/chart helpers and reconcile displayed rows to the estimated tax total.
- Added a lightweight Share preview link from the final summary screen.
- Added unit and e2e coverage for share-preview rendering, additive-only share rows, reconciled totals, banned phrase absence, and privacy-sensitive raw-income omission.
- Generated Ticket 009 screenshots at 390px and 430px for final summary share entry, share preview, and share-card portrait preview, plus an exact 1080 by 1920 share-card PNG.
- Kept tax, Budget, allocation, source data, storage, analytics, backend upload, and share-card export/download functionality unchanged.

Commands run:

- `git status --short` - clean before editing
- `npm run typecheck` - passed during iteration
- `npm run lint` - passed during iteration
- `npm run test:run` - failed once during iteration on a source-year case mismatch, then passed after aligning rendered copy
- `npm run build` - passed for production screenshot capture
- Playwright screenshot capture at 390px, 430px, and 1080 by 1920 - passed after waiting for reveal animation and correcting the exact poster capture
- `npm run validate` - passed
- `npm run test:e2e` - passed
- `git diff --check` - passed

Result:

- Ticket 009 implemented for human review.
- Ticket 010 was not started.

## Ticket 010: QA Hardening

Status: Human Review

Scope:

- Re-read the one-ticket rule, Ticket 010, product docs, prior design-review READMEs, app routes, tax/Budget/allocation/chart/share helpers, and existing tests.
- Inspected representative Ticket 007, 008, and 009 screenshots before generating the Ticket 010 screenshot set.
- Added QA hardening tests for storage/API/analytics/server-action absence, risky hypothecation wording, calculation/allocation/share reconciliation, source registry connections, spotlight exclusion, and share-card raw-income omission.
- Relabelled the final-summary share entry and `/share-preview` heading as a sample share preview because the route uses a fixed QA estimate.
- Reworded allocation caveats and methodology/product framing to avoid exact-dollar or literal assignment wording.
- Added `docs/product/MVP_FINAL_REVIEW.md` with MVP scope, non-goals, data sources, tax assumptions, privacy posture, limitations, launch blockers, recommended follow-up, and manual review checklist.
- Generated Ticket 010 screenshots at 390px and 430px for intro, input, tax result, big-picture allocation, three category cards, one spotlight card, final summary, methodology, sources, privacy, and share preview, plus an exact 1080 by 1920 share-card PNG.
- Kept tax, Budget, allocation, source data, analytics, storage, backend upload, deployment, and major feature scope unchanged.

Commands run:

- `git status --short` - clean before editing
- Manual source scans for risky copy, storage, cookies, API calls, analytics hooks, and server actions - passed after copy fixes
- `npm run test:run -- --runInBand` - failed because Vitest does not support the Jest `--runInBand` option
- `npm run test:run` - passed during iteration
- `npm run build` - passed for production screenshot capture
- Playwright screenshot capture at 390px, 430px, and 1080 by 1920 - passed
- `npm run validate` - passed
- `npm run test:e2e` - passed
- `git diff --check` - passed

Result:

- Ticket 010 implemented for human review.
- No ticket 011 was created.

## Typography Clipping Hotfix

Status: Human Review

Scope:

- Fixed mobile hero copy clipping at 390px and 430px by tightening width-aware `clamp()` ranges for story titles, tax/allocation/category/summary numeric hero text, and the share-preview hero heading.
- Preserved normal word boundaries by disabling mid-word breaking and hyphenation on hero typography.
- Centered and width-scaled the intro `25-26` poster numerals so the full text remains inside the card at 390px and 430px.
- Added topbar counter shrink protection so the internal page counter remains visible.
- Generated typography hotfix screenshots at 390px and 430px for intro, income input, tax result, big-picture allocation, one category card, final summary, and share preview.
- Kept tax, Budget, allocation, source data, copy, storage, analytics, route structure, and decorative poster shapes unchanged.

Commands run:

- `git status --short` - clean before editing after parking unrelated pre-existing work
- Playwright DOM overflow audit at 390px and 430px - passed after typography changes
- `npm run build` - passed for production screenshot capture
- Playwright production screenshot capture at 390px and 430px - passed
- `npm run validate` - passed
- `npm run test:e2e` - passed
- `git diff --check` - passed

Result:

- Typography clipping hotfix implemented for human review.
- No new ticket was started.

## Ticket 011: Count-Up Reveal And Drilldown Scroll Affordance

Status: Human Review

Scope:

- Applied a reusable React count-up hook to the tax estimate hero, category contribution hero, drilldown contribution headline, final summary receipt total, and live share-card hero figure.
- Preserved existing currency formatting and reserved final text width so animated values do not cause layout shift.
- Added `prefers-reduced-motion` handling so count-up values render immediately at their final amount when reduced motion is requested.
- Added a pointer-transparent drilldown bar-list fade that appears only while more list content remains below and hides at the bottom of the scroll range.
- Added focused unit tests for reduced-motion count-up behavior, final count-up completion, and drilldown scroll affordance overflow behavior.
- Created the missing Ticket 011 queue file and design-review README without screenshots, per implementation instruction.
- Kept tax, Budget, allocation, source data, copy, palette, analytics, storage, and route scope unchanged.

Commands run:

- `git status --short` - clean before applying the parked drilldown base stash
- `git stash apply stash@{0}` - applied the earlier drilldown base work
- `git diff --check` - passed before the drilldown base commit
- `git commit -m "Add category drilldown card and minor visual fixes"` - created base commit `f723b57`
- `npm run test:run` - passed during Ticket 011 iteration
- `npm run lint` - failed once on synchronous count-up hook state updates, then passed through `npm run validate` after moving updates into timer callbacks
- `npm run typecheck` - failed once on test helper `this` typing, then passed after adding explicit `HTMLElement` annotations
- Playwright browser smoke at 390px - passed for count-up start/end, drilldown fade show/hide, and nested row interaction
- `npm run validate` - passed
- `npm run test:e2e` - failed once on duplicate hidden reserve text, then passed after reserving HTML width without duplicate text
- `git diff --check` - passed

Result:

- Ticket 011 implemented for human review.
- No new ticket was started.

## Ticket 012: Tax Bracket Walk Card

Status: Human Review

Scope:

- Added a pure `buildBracketWalk` helper that derives bracket rows, LITO, and optional Medicare levy from the existing 2025-26 resident tax engine and exported bracket data.
- Inserted one charcoal "How your tax was built" card between the tax estimate and big-picture allocation screens.
- Rendered bracket range, marginal rate, dollars taxed, and tax owed per bracket, with a final animated total using the Ticket 011 count-up pattern.
- Updated story progress and navigation through the existing step array so back, next, restart, and later drilldown behavior remain consistent.
- Added focused unit coverage for bracket reconciliation, LITO capping, Medicare row toggling, and ascending bracket order.
- Added Playwright coverage for tax estimate, bracket walk, allocation continuity, total matching, and banned phrase absence on the bracket card.
- Created the missing Ticket 012 queue file and marked it for human review.
- Kept tax, Budget, allocation, source data, analytics, storage, and political copy scope unchanged.

Commands run:

- `git status --short` - clean before editing
- `npm run typecheck` - failed once on helper row inference, then passed after explicit row typing
- `npm run test:run -- tests/unit/tax-engine.test.ts` - passed
- `npm run lint` - passed
- `npm run test:e2e` - timed out once waiting for the configured dev server, then passed on rerun
- `npm run validate` - failed once after the new step moved the drilldown unit test one screen early, then passed after updating that test path
- `npm run test:e2e` - passed after the validation fix
- `git diff --check` - passed

Result:

- Ticket 012 implemented for human review.
- No later ticket was started.

## Ticket 014: Sourced Program Callouts

Status: Human Review

Scope:

- Added optional `ProgramCallout` metadata to sourced drilldown category nodes.
- Added BP1 Appendix A callouts for Social security and welfare, Health, Education, and Fuel and energy.
- Added Defence PBS callouts for Workforce and Capability Acquisition Program.
- Added proportional per-callout contribution calculations using the same stable-cent allocation approach as drilldown rows, while keeping callout sums within the parent category contribution.
- Rendered at most two compact callouts under category-card hero amounts, with count-up dollar figures and source links back to `/sources`.
- Added `/sources` anchors for registry entries so callout source links resolve to the referenced source card.
- Added unit coverage for source registry resolution, source-row amount matching, parent contribution bounds, spotlight duplicate avoidance, and banned callout phrasing.
- Added Playwright coverage for callout rendering on Social security and welfare, Health, and Education cards, plus source-link navigation.
- Kept tax, Budget, allocation, source registry, storage, analytics, and political copy scope unchanged.

Commands run:

- `git status --short` - clean before editing
- `npm run typecheck` - failed once on a narrow Set type in the new duplicate-spotlight test, then passed after widening the Set to string
- `npm run test:run -- tests/unit/budget-drilldown-data.test.ts` - passed
- `npm run test:e2e` - passed during iteration
- `npm run validate` - passed
- `npm run test:e2e` - passed
- `git diff --check` - passed

Result:

- Ticket 014 implemented for human review.
- No later ticket was started.

## Ticket 015: Australia Receipt Coda Card

Status: Human Review

Scope:

- Added a final off-white "Zooming out" coda card after the personal illustrative receipt.
- Derived the national hero figure from `auBudget2025_26.totalExpensesM` and formatted it as `$785.7B`.
- Added a pure helper for the national-total formatter and the "1 in Y" scale calculation, including nearest-1,000 rounding above 100,000 and zero-tax omission.
- Applied the existing count-up pattern to the `$785.7B` hero figure.
- Added Share preview, Methodology, Sources, and Privacy links to the coda card.
- Updated story progression so the personal receipt advances to the coda and Restart from the coda returns to the intro.
- Added focused unit tests for total formatting, representative scale calculations, zero-tax handling, and banned political/value-laden coda source terms.
- Updated Playwright coverage for the coda card after the personal receipt and restart behavior.
- Kept tax, Budget, allocation, source data, storage, analytics, and political copy scope unchanged.

Commands run:

- `git status --short` - clean before editing
- `npm run typecheck` - failed once on literal inference for the total expenses helper, then passed after widening helper parameters to `number`
- `npm run test:run -- tests/unit/australia-receipt-coda.test.ts` - passed
- `npm run test:e2e` - passed during iteration
- `npm run validate` - passed
- `npm run test:e2e` - passed
- `git diff --check` - passed

Result:

- Ticket 015 implemented for human review.
- No later ticket was started.

## Ticket 016: Client-Side Share Card PNG Export

Status: Human Review

Scope:

- Added `html-to-image` for browser-only DOM-to-PNG export of the existing
  SVG-based 1080 by 1920 share card.
- Added a deterministic export filename:
  `australian-budget-wrapped-2025-26.png`.
- Added an in-memory estimated-tax handoff from the final receipt and coda share
  links to `/share-preview`, with direct route loads still falling back to the
  labelled fixed sample.
- Added a Download PNG action with a loading state and a hidden fixed-size
  export source so the visible preview remains responsive while the downloaded
  PNG is exactly 1080 by 1920.
- Kept raw taxable income out of the share preview route, URL parameters,
  filename, alt text, browser storage, cookies, and app-managed PNG metadata.
- Added unit coverage for the deterministic filename and Playwright coverage for
  direct sample fallback, privacy checks, PNG MIME, non-zero blob size, and PNG
  dimensions.
- Kept tax, Budget, allocation, source data, storage, analytics, and share-card
  visual design scope unchanged.

Commands run:

- `git status --short` - clean before editing
- `npm view html-to-image version description repository.url license` - used to
  evaluate the preferred export library
- `npm view dom-to-image-more version description repository.url license` - used
  to evaluate the alternative export library
- `npm install html-to-image` - added the chosen browser export dependency
- `npm run typecheck` - passed
- `npm run test:run -- tests/unit/share-card-data.test.ts tests/unit/pages.test.tsx`
  - passed
- `npm run test:e2e -- --grep "share preview"` - failed once before the hidden
  export source ref was wired, then passed
- `npm run lint` - passed
- `npm run validate` - passed
- `npm run test:e2e` - passed
- `git diff --check` - passed

Result:

- Ticket 016 implemented for human review.
- No later ticket was started.

## Ticket 017: Sort Drilldowns And Laptop Preview

Status: Human Review

Scope:

- Sorted category drilldown view rows by computed contribution amount,
  descending, with original source order preserved for equal computed values.
- Kept raw Budget subcategory data in authored order and avoided in-place source
  mutation.
- Kept drilldown totals and proportional cent allocation unchanged; sorted rows
  still reconcile to their parent category contribution.
- Applied the sorted row output consistently to the visible drilldown list,
  accessible row labels, conic chart slices, and visual bars.
- Added a laptop/desktop presentation layer from the wide breakpoint up, with
  the existing story card framed as the central object and a lightweight side
  rail for product name, step progress, caveat, and policy links.
- Preserved the same mobile route, story order, controls, tax calculation,
  Budget facts, allocation logic, source registry, share-card/export logic,
  storage posture, and analytics-free behaviour.
- Added fresh design-review screenshots in
  `docs/product/design-review/sorted-drilldown-laptop-preview/`.

Commands run:

- `git status --short` - clean before editing
- `npm run test:run -- tests/unit/budget-drilldown-data.test.ts` - passed
  during implementation
- `npm run typecheck` - passed during implementation
- `npm run lint` - passed during implementation
- `npm run validate` - failed once on the JSDOM `scrollTo` browser API, failed
  once on duplicate hypothecation disclaimer text after adding the desktop rail,
  failed once on an unsupported Playwright `reducedMotion` config option, then
  passed after the targeted fixes
- `npm run test:e2e -- --grep "mobile story flow|drilldown row ordering|renders a privacy-safe additive share card"`
  - passed after the final mobile Back-flow adjustment
- `npm run test:e2e` - passed
- `git diff --check` - passed

Result:

- Ticket 017 implemented for human review.
- No later ticket was started.
