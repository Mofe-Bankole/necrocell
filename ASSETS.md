# Asset registry

All new assets must be listed here with source and licence, per `trademark-safe.md`.

## Template assets (template/assets/)

| Asset | Source | Licence |
|---|---|---|
| `font8x8_basic.h` | [dhepper/font8x8](https://github.com/dhepper/font8x8), Daniel Hepper | Public Domain |
| `JetBrainsMono-Regular.ttf` | [JetBrains/JetBrainsMono](https://github.com/JetBrains/JetBrainsMono) v2.x | SIL OFL 1.1 (licence: `JetBrainsMono-OFL.txt`) |

## Fonts (site/)

| Font | Weight(s) | Source | Licence |
|---|---|---|---|
| Manrope | 200, 300, 400, 600 | [Google Fonts](https://fonts.google.com/specimen/Manrope) | SIL OFL 1.1 |
| JetBrains Mono | 400 | [Google Fonts](https://fonts.google.com/specimen/JetBrains+Mono) | SIL OFL 1.1 |

Fonts are served from Google Fonts CDN at build time. No font files are committed to this repo.

## Favicon (site/public/favicon.svg)

Original SVG glyph, hand-authored. No third-party artwork. Licence: MIT (this project).

## Game card art (generated at build time by WorthSaving.astro)

Inline SVG ember patterns, generated deterministically from the game title seed.
No box art, logos, screenshots, or trailers from the referenced games.
Original work. Licence: MIT (this project).

## Wave animation (site/src/lib/wave.ts)

Canvas 2D implementation, original. No third-party assets. Licence: MIT (this project).

## Dashboard icons (site/src/data/menu.ts)

Original line icons, hand-authored for Necrocell. Licence: MIT (this project).

## Game cover art (site/public/covers/) — third-party, optional
Twenty low-resolution covers taken from their English Wikipedia articles (non-free, publisher copyright), converted to WebP. They are shown only in the "Worth saving" panels, credited as homage, and gated by `SHOW_COVERS` in `site/src/data/covers.ts`. **Kiroween rules disqualify third-party trademarks: set it to `false` before submitting if in doubt.**

## Game backdrops (site/public/backdrops/) — third-party, optional
Full-screen 16:9 images (ideally 1920×1080) shown behind the dashboard when a game is selected, and in that game's panel. Same `SHOW_COVERS` switch and same disqualification caveat as the covers. Record each file's source below when added.
Source for the 18 current backdrops: the "Sony PlayStation 3 (Backgrounds)(ReDump)(EM 1.0)" collection (the console's own per-game background images), resized from 2560×1440 to 1920×1080 WebP. Flower and Tokyo Jungle were digital-only, so they fall back to their covers.
