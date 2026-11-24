# Tasks: necrocell-site

## v1 — this session ✓

- [x] **T1** Write `design.md` and `tasks.md` covering all 10 requirements.
- [x] **T2** Scaffold `site/` as an Astro project (manual, Astro 7, TypeScript strict, static output). Configure `base`, `site`, Google Fonts, and global CSS tokens.
- [x] **T3** Implement `src/lib/wave.ts` — layered sine-band canvas 2D ember wave with `prefers-reduced-motion` guard.
- [x] **T4** Implement `Hero.astro` — wave canvas island, "Raise the dead." headline, subtitle, Watch the demo (`href="#"`) and GitHub buttons (Req 1).
- [x] **T5** Implement `WhyNow.astro` — 3 facts (87M consoles, store closing July 2027, Cell reputation), founder line, TODO source footnotes (Req 2).
- [x] **T6** Copy `games-draft.json` to `site/src/data/games.json`. Implement `WorthSaving.astro` — 6 cards with deterministic SVG ember art, "lost" badge when present, closing line (Req 6).
- [x] **T7** Implement stub components for Pipeline, Bench, VitalsDemo, ArkDemo, MadeWith, UnderTheHood, GetStarted — each renders a titled section with "Coming soon".
- [x] **T8** Implement `Footer.astro` — non-affiliation notice + MIT licence line.
- [x] **T9** Wire up `src/pages/index.astro` with all components, semantic nav, skip-to-content link.
- [x] **T10** Add `.github/workflows/pages.yml` — `withastro/action` build from `site/` + `actions/deploy-pages`.
- [x] **T11** Run `npm run build` in `site/` — zero errors. Output in `site/dist/`.

## Future sessions

- [ ] **T12** (Req 3) Pipeline animated section — real timing data from `pipeline.json`, scroll-triggered animation.
- [ ] **T13** (Req 4) Bench chart — SVG bar chart reading `bench.json`, text table fallback, labelled axes.
- [ ] **T14** (Req 5a) Vitals demo island — `vitals-recording.json` playback, gauges + line graph, play/pause/scrub.
- [ ] **T15** (Req 5b) Ark demo island — simulated save list, back-up interaction, disclaimer.
- [ ] **T16** (Req 7) MadeWith gallery — Vitals, Ark, hello sample with screenshots/recordings, pkg download links.
- [ ] **T17** (Req 8) UnderTheHood — `import.meta.glob` load of `.kiro/` excerpts at build time.
- [ ] **T18** (Req 9) GetStarted — Docker + RPCS3 commands, firmware guidance pointing to Sony's official site.
- [ ] **T19** (Req 10) Lighthouse ≥ 90 audit pass; add Zod data-validation hook for `src/data/*.json`.
- [ ] **T20** (Req 2) Replace TODO source footnotes with verified public URLs.
- [ ] **T21** Add `ASSETS.md` entries for all fonts and SVG assets.

## Pivot 2026-11-24 (v1 rated 1/10 by Mofe: generic template look, wave hid the text, half the page was stubs, invented facts)
- [ ] **T22** (Req 11) Replace the long-scroll page with the console dashboard shell + detail panels.
- [ ] **T23** (Req 1) Ribbon wave: thin additive strands + rising embers, replacing the solid bands.
- [ ] **T24** Fix invented content: Cell = 1 PPE + 8 SPEs (7 enabled, 6 for games); remove the fabricated "temperature sensor" founder line.

## v3 2026-11-24 (Claude Code, "go all out")
- [x] **T25** Apps category replaces Vitals/Ark categories: Vitals, Ark (building), Grip, Hearth (next up), Hello, Cell (sample), Raise your own (prompt builder).
- [x] **T26** Live preview pane on wide screens: animated TV mockups per app (src/lib/screens.ts), cover cards, stats, code cards.
- [x] **T27** Per-game blurred cover backdrop; per-category tint.
- [x] **T28** Store-closure countdown (to 1 July 2027) in the top bar and the Why now panel.
- [x] **T29** Gamepad API navigation (d-pad/stick, confirm/back) + Grip mockup reads a real controller.
- [x] **T30** Optional synthesised UI sounds (WebAudio, off by default).
- [x] **T31** `?sel=<id>` selects an item without opening it (shareable, screenshot-friendly).
- [ ] **T32** Verify sources for every fact (87M, store date, server shutdowns) and add footnotes.
