# Requirements: necrocell-site

## Introduction
A static landing site for Necrocell, built with **Astro** and deployed to **GitHub Pages** from `site/`. It must make a first-time visitor (and a hackathon judge) understand in under 30 seconds what Necrocell is, why it matters now, and that it really works. It also serves as the project's public "working app URL", with interactive demos that need no PS3.

## Requirement 1: hero
**User story:** As a visitor, I want to grasp the product instantly.
1. The hero SHALL show a live animated **ember wave** (canvas/WebGL, using the same maths as the console `nc_gfx` wave), the headline "Raise the dead.", a one-line subtitle, and buttons for **Watch the demo** (YouTube) and **GitHub**.
2. WHEN the visitor has `prefers-reduced-motion` set THEN the wave SHALL render as a still frame.
3. WHEN WebGL is unavailable THEN a static image fallback SHALL appear, with no console errors.

## Requirement 2: why now
1. The page SHALL present 3 facts with sources linked: about 87M consoles sold, the PS3 store closing to new purchases by July 2027, and the Cell's reputation as hard to program.
2. It SHALL include the founder line (a PS3 bought in 2017, the year production ended).
3. Every factual claim SHALL link to a public source in a footnote.

## Requirement 3: how it works
1. An animated pipeline SHALL show: sentence → spec → build → deploy → running on the TV, with each step's real measured duration (data from `site/src/data/pipeline.json`).
2. WHEN the section scrolls into view THEN the steps SHALL animate in order, once.

## Requirement 4: proof (benchmark)
1. A chart SHALL compare plain Kiro vs Kiro + Necrocell on the benchmark prompts (compiled %, ran %, average fix iterations), read from `site/src/data/bench.json` (produced by `bench/`).
2. The chart SHALL be accessible: a text table alternative and labelled axes.

## Requirement 5: interactive app demos
1. **Vitals demo:** replays recorded telemetry (`vitals-recording.json`) as gauges + a line graph. The colour shifts towards red above warning thresholds, and play/pause/scrub controls are included.
2. **Ark demo:** a simulated save list. The visitor can "back up" entries and see status change from *at risk* to *saved*. A visible note states Ark's limit (own saves, own console/account, no game content).
3. Both demos SHALL work fully offline in the browser, and SHALL be clearly labelled "recorded on real hardware" or "simulated", whichever is true.

## Requirement 6: Worth saving (games)
1. A section SHALL feature 6 landmark PS3-era games as **text-and-original-art cards**: title, year, developer, and one sentence on why it mattered to gaming (and, where true, what has already been lost, e.g. shut-down online servers).
2. Cards SHALL NOT use box art, logos, screenshots, or trailers from those games. Card art is our own generated ember pattern, seeded by the title.
3. Content comes from `site/src/data/games.json`, and each claim has a source link.
4. A closing line ties it to the product: "Necrocell keeps the hardware alive and your saves safe."

## Requirement 7: Made with Necrocell
1. A gallery SHALL show apps built on the template (Vitals, Ark, the hello sample, and any app generated live in the demo video), each with our own screenshots or recordings, its prompt/spec link, and a `.pkg` download link from GitHub Releases.

## Requirement 8: under the hood
1. A section SHALL display real excerpts from `.kiro/` (steering, a spec, a hook, the MCP tool list), loaded at build time from the repo, so it never goes stale.

## Requirement 9: get started
1. It SHALL show the 3–4 commands to build the template with Docker and run it in RPCS3, plus RPCS3 firmware guidance pointing **only** to Sony's official site.

## Requirement 10: quality & safety
1. Lighthouse SHALL score ≥ 90 for Performance, Accessibility, and Best Practices on mobile.
2. The layout SHALL work from 360 px wide upward, with no horizontal scroll.
3. No Sony trademarks, logos, button glyphs, fonts, or sounds anywhere. The footer carries a non-affiliation notice.
4. The site SHALL deploy automatically to GitHub Pages on push to `main` (GitHub Actions).
5. The site SHALL ship with zero client-side JS except the wave, the chart, and the two demos (Astro islands).

## Requirement 11: console-as-website interface (pivot, 2026-11-24)
**User story:** As a visitor, I want the site itself to feel like switching on a console, so the product's purpose is felt, not just read.
1. The home view SHALL be a full-screen dashboard: a horizontal row of categories (Necrocell, Vitals, Ark, Worth saving, Why now, About) with a vertical item list under the active category, over the animated ember ribbons.
2. Arrow keys SHALL move between categories (left/right) and items (up/down). Enter SHALL open the item in a detail panel, and Esc/Backspace SHALL close it. Mouse, wheel, tap and swipe SHALL do the same.
3. Every item SHALL be deep-linkable by URL hash (e.g. `#game-journey`).
4. The interface SHALL be original: our own icons, ember identity and fonts. No copied console menus, icons, sounds or glyphs (button prompts use keyboard keys).
5. Without JavaScript, all panel content SHALL still render as a readable page.
6. Sections from Req 1–9 become panels in this dashboard; the long-scroll page is retired.
