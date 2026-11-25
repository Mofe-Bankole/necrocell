# Steven: tasks for Necrocell (Kiroween 2026)

Deadline for everything: **Mon Dec 1**, except where noted. Final submission is Fri Dec 4, 2 PM PT (11 PM WAT).
Repo: github.com/Mofe-Bankole/necrocell. Don't edit `template/` or `.kiro/specs/`; Mofe is building those with Kiro.

## 1. Finish the toolchain spike (do first, by Nov 27)
Follow the spike checklist Mofe sent you (`steven-spike.md`). Report back with ✅ or ❌ for each step, plus a screenshot of the RPCS3 window only (not your whole desktop):
- the PSL1GHT sample builds to a `.self`
- it runs in RPCS3
- a tiny3d sample runs in RPCS3

Then pull the repo and run `make -C template/apps/hello -f Makefile.sdl && ./template/apps/hello/build/hello` (Linux). Tell Mofe if it works.

## 2. Verify the site's facts (no code)
For each claim, find a **public source URL** (official Sony page, press release, or a reputable outlet). Write each one as `claim | exact quote | URL | date accessed`.
- About 87 million PS3 consoles sold, 2006–2017
- PS3 production ended in 2017
- PS Store: new PS3 purchases end by July 2027 (find the actual announcement and the exact date)
- Cell: 1 PPE + 8 SPEs (7 enabled, 6 available to games)
- MGS4 / Metal Gear Online servers shut down in 2012
- Gran Turismo 5 online shut down in 2014
- MAG servers shut down in 2014
- Any claim on the site you can't source: mark it ❌ so we can remove it.

Put the results in `docs/sources.md` on a branch `steven/sources` and open a PR.

## 3. App icon `ICON0.PNG` (B6)
- 320×176 PNG, original art: an amber ember wave on near-black (#0b0a0d). Look at the site for the style.
- No PlayStation logos, fonts or symbols, and nothing traced from Sony art.
- Commit to `template/apps/hello/ICON0.PNG` on the same branch. Say which tool you made it with (for ASSETS.md).

## 4. PS3 hardware (target Dec 2)
- Confirm when the console will be ready (repaired or borrowed). Check its firmware version and whether HEN can be installed.
- Once it's ready: install webMAN MOD and check its web page shows CPU/RSX temperatures. Vitals uses that as its fallback.
- Later, Mofe will send a test build that reads the temperature directly. Run it and report what it shows next to webMAN's numbers.

## 5. Demo video plan (3 minutes max)
Write a storyboard of 6–8 shots, with what's on screen and the voice-over line for each. Suggested arc:
1. Hook: "87 million consoles, and the store is closing"
2. The site (console-style UI)
3. One sentence typed into Kiro produces an app
4. It builds, then runs in RPCS3
5. The same app on the real PS3 on a TV (needs the hardware)
6. Vitals and Ark
7. Benchmark chart: plain Kiro vs Kiro + Necrocell
8. Close: "Raise the dead."

Also list the recordings we'll need (screen captures, and a phone shot of the TV).
