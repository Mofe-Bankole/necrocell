---
inclusion: always
---
# Product: Necrocell

Necrocell is a Kiro-native skeleton for building homebrew apps for the PlayStation 3 (Cell Broadband Engine), plus two apps built from it:
- **Vitals** (`apps/vitals`): live CPU/RSX temperature and fan health, with overheating warnings for aging consoles.
- **Ark** (`apps/ark`): backs up the user's **own** save data to their own computer over the LAN. `apps/ark/host` receives it.

## Audience
- PS3 owners keeping old consoles alive.
- People preserving their saves before the PS3 store closes (July 2027).
- New homebrew developers.

## Non-negotiables
- Apps are small, fast, and reliable. 60 fps, clean exit to the system menu, no crashes on bad input.
- **Ark handles save data only. It never touches game content, licenses, keys, or DRM.** Saves are tied to the owner's console/account, and we state this plainly in the UI and docs.
- No piracy features, no PSN/online circumvention, no cheats.
- No Sony trademarks, logos, fonts, icons, sounds, or firmware anywhere in the repo or UI (see `trademark-safe.md`).

## Scope discipline
Prefer the smallest design that works. No new dependency, AI feature, or service unless the spec asks for it.
