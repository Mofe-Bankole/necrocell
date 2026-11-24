# Design: necrocell-site

## Stack
- **Astro** static output, project root `site/`.
- No UI framework. Vanilla TypeScript islands only.
- `base: "/necrocell"`, `site: "https://mofe-bankole.github.io"`.
- Deployed via `withastro/action` → `actions/deploy-pages` from `.github/workflows/pages.yml`.

## Visual identity
| Token | Value |
|---|---|
| Background | `#0B0710` |
| Amber | `#FF8C00` |
| Violet dark | `#2A0A3A` |
| Violet mid | `#7B3FA0` |
| Bone white | `#EDE6DA` |
| Body font | Space Grotesk (OFL, Google Fonts) |
| Heading font | Cinzel (OFL, Google Fonts) |
| Mono font | JetBrains Mono (OFL, Google Fonts) |

One spooky motif: the ember wave. No Sony trademarks, logos, fonts, or glyphs anywhere.

## Route & component layout
```
src/pages/index.astro
src/components/
  Hero.astro          (Req 1)  — wave canvas island + headline + CTA buttons
  WhyNow.astro        (Req 2)  — 3 facts + founder line
  Pipeline.astro      (Req 3)  — animated step pipeline
  Bench.astro         (Req 4)  — bar chart from bench.json
  VitalsDemo.astro    (Req 5a) — telemetry playback
  ArkDemo.astro       (Req 5b) — save-backup simulation
  WorthSaving.astro   (Req 6)  — 6 game cards
  MadeWith.astro      (Req 7)  — app gallery
  UnderTheHood.astro  (Req 8)  — .kiro/ excerpts
  GetStarted.astro    (Req 9)  — build commands
  Footer.astro        — non-affiliation notice
src/lib/
  wave.ts             — 2D canvas ember wave (layered sine bands)
src/data/
  games.json          — copied from games-draft.json
  pipeline.json       — pipeline steps (stub)
  bench.json          — benchmark results (stub)
```

## Ember wave (Req 1)
- Pure canvas 2D (no WebGL dependency; Req 1.3 fallback is trivially satisfied).
- Layered sine bands, each animated with a different frequency/phase.
- Colour interpolation: amber `#FF8C00` → violet `#2A0A3A`.
- `prefers-reduced-motion`: draw one frame, no `requestAnimationFrame` loop.
- Exported as a plain TS module; the Hero island calls it after mount.

## WorthSaving cards (Req 6)
- Card art: inline SVG ember pattern, 6–8 sine-path segments, seed derived from `title.charCodeAt` sum → deterministic.
- No box art, logos, screenshots.
- Source links: TODO placeholders until verified.

## Footer
Non-affiliation notice verbatim: "An independent fan project. Not affiliated with or endorsed by Sony Interactive Entertainment."

## Accessibility & performance targets (Req 10)
- Mobile-first CSS, works at 360 px, no horizontal scroll.
- Zero client JS except the wave island and the two demo islands.
- Semantic HTML landmarks, `aria-label` on all interactive elements.
- All images have `alt`.
