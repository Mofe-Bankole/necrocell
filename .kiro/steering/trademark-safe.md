---
inclusion: always
---
# Trademark & asset safety (judging rule: no third-party trademarks)

- Never use "PlayStation", "PS3", the PlayStation logo, button-symbol artwork, XMB icons, Sony fonts, the boot sound, or the official wave background **in app UI, icons, the site hero, or video graphics**.
- Docs may describe compatibility factually ("runs on the PS3 via homebrew"), with a "not affiliated with Sony" note.
- Controller prompts: use words or our own glyphs ("Confirm", "Back"), not Sony's button symbols.
- Visual identity is our own: the **ember wave** (amber #FF8C00 → violet #2A0A3A), our own icons, and an open-licence font (OFL/CC0 only, with the licence file committed alongside).
- Audio: original or CC0 only.
- Any new asset needs its source and licence noted in `ASSETS.md`.
- **Exception (owner decision, 2026-11-24):** the site's "Worth saving" panels may show publisher cover art from `site/public/covers/`, credited as homage. It is gated by `SHOW_COVERS` in `site/src/data/covers.ts`. Never use cover art anywhere else (hero, icons, app UI, video graphics). Do not remove the switch.
