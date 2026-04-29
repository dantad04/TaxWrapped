# Australian Budget Wrapped - Design Direction

## 1. Core design goal

The website should feel like a polished, mobile-first, full-screen "wrapped" story experience.

It should feel much closer to:

- an editorial story card experience
- a visual social-share product
- a motion-led narrative sequence

And much less like:

- a dashboard
- a generic startup landing page
- a default Tailwind website
- a boring government explainer

The visible website should look very similar in style and energy to the provided reference screenshots.

## 2. Reference style summary

The design language should closely follow these reference qualities:

- oversized, bold typography
- strong visual hierarchy
- one big idea per screen
- large central numbers
- rounded full-screen mobile cards
- minimal layouts with lots of space
- bold accent colours
- graphic, poster-like composition
- playful but clean charts
- thin flowing line illustrations used decoratively
- occasional abstract pattern shapes near edges or backgrounds
- a "story reveal" / "wrapped" feeling

The goal is not to create an exact clone, but the website should feel very close in visual mood, composition style, and interaction model.

## 3. Product feel

The website should feel:

- bold
- playful
- visual
- sharp
- modern
- mobile-native
- narrative
- social-shareable
- a little dramatic
- easy to swipe through or tap through

It should not feel:

- bureaucratic
- plain
- spreadsheet-like
- corporate SaaS
- heavy-handed
- over-explained on each screen

## 4. Visual references to emulate

### Layout style

- Mostly full-screen vertical mobile cards
- Strong centring
- Big blocks of empty space
- Large focal element per screen
- Rounded card/screen corners
- Content stacked vertically with strong rhythm

### Typography style

- Very large bold headings
- Big outlined or filled dollar figures
- Short punchy lines
- Limited copy per screen
- Strong contrast between headline and supporting text

### Graphic motifs

- Thin wavy contour-like lines across the screen
- Simple abstract background shapes
- Bold colour blocks
- Checker / warped-grid / poster-like shapes where useful
- Pie charts and bars integrated into the editorial composition, not looking like standard dashboard widgets

### Colour style

Use a small but strong palette. Candidate direction:

- warm off-white / light grey base
- charcoal / near-black dark mode screen
- magenta accent
- bright red accent
- vivid green accent
- electric blue accent
- occasional soft muted fills for secondary chart areas

The palette should be bold and memorable.

## 5. What the website must NOT look like

The website must not look like:

- a dashboard
- a standard card UI library demo
- a generic Tailwind template
- a finance calculator
- a government service portal
- a spreadsheet visualisation tool

Avoid:

- tiny labels everywhere
- cramped layouts
- too many boxes
- too many controls visible at once
- chart-heavy clutter
- "enterprise" styling
- overly subtle design

## 6. Mobile-first layout principles

This website is primarily a mobile story experience.

Design for narrow mobile widths first, especially around:

- 390px wide
- 430px wide

Principles:

- one screen = one moment
- one primary message per screen
- large touch targets
- clean vertical rhythm
- minimal on-screen clutter
- components should feel like story slides, not app panels

## 7. Story flow principles

The experience should feel like a sequence of story cards.

Suggested flow feel:

1. Intro / title screen
2. Input step
3. Estimated tax result
4. Big-picture allocation screen
5. Individual category story cards
6. Final summary
7. Shareable ending

Each screen should:

- have one dominant message
- feel distinct
- be visually satisfying
- invite the user to continue

The interaction should feel closer to "next story card" than "scroll a long webpage".

## 8. Animation and motion direction

The website should include light motion, inspired by the feel of Spotify Wrapped-style reveals.

Motion should be:

- smooth
- quick
- polished
- subtle, not excessive
- optional / disabled or reduced for reduced-motion users

Preferred motion patterns:

- fade + slight slide-up reveal for card content
- number/count emphasis reveal
- chart segment reveal
- gentle motion on decorative line motifs
- smooth transitions between story cards
- subtle scale or opacity transitions for main figures

Avoid:

- heavy/parallax gimmicks
- long delays
- overly bouncy motion
- animations that hurt readability

Respect `prefers-reduced-motion`.

## 9. Typography direction

Use a bold, modern sans-serif display style.

The typography should support:

- giant headline moments
- oversized dollar values
- bold section titles
- short, punchy supporting copy
- readable labels

If a display font is added, it should feel:

- clean
- geometric
- heavy
- contemporary

Body text can be simpler, but the display style should carry the visual identity.

## 10. Chart and data visualisation direction

Charts should feel like part of the design, not generic components.

Requirements:

- large, clear, bold
- visually integrated with the screen composition
- readable on mobile
- minimal clutter
- category highlights should feel editorial

Pie/donut style:

- simple
- bold selected slice
- muted surrounding slices
- no cramped dashboard legends

Bar style:

- thick horizontal bars
- strong numeric labels
- minimal decoration
- clear emphasis on the important lines

Do not let charts become tiny or overly technical.

## 11. Australian-specific direction

This is an Australian version, so the content and feel should be locally relevant.

However, the visual language should not become cheesy or literal.

Allowed subtle motifs:

- budget-paper / receipt-like feel
- contour / map-like flowing lines
- public-data / poster feel
- subtle civic or institutional tone in the structure

Avoid:

- cliche Australian iconography
- heavy flag use
- kitsch national symbols
- Indigenous visual motifs unless appropriately commissioned or licensed

## 12. Copy style direction

Copy should be:

- short
- direct
- human
- lightly playful
- not too jokey
- not overly bureaucratic

It should feel approachable and modern.

Avoid:

- dense paragraphs
- academic language on story cards
- overly technical caveats on the main screens

Caveats should still exist, but be handled lightly and clearly.

## 13. Accessibility and reduced motion

Requirements:

- maintain readable contrast
- ensure mobile readability
- proper semantic structure
- chart labels must remain understandable
- reduced-motion mode must be respected
- interaction must still work without animation

## 14. Design acceptance checklist

Before visible UI work is accepted, the result should satisfy all of the below:

- It feels very similar in style and energy to the provided references.
- It does not look like a generic Tailwind website.
- It feels like a mobile-first story experience.
- It has strong visual hierarchy.
- The main number on a card feels visually exciting.
- The charts feel designed, not default.
- The flow feels like "wrapped" story cards.
- Animations are present but tasteful.
- Reduced-motion is respected.
- The visible result is something a user would actually describe as "good-looking".
