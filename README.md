# Necrocell

**A Kiro-native skeleton for building homebrew apps for the PS3's Cell processor, and two apps raised from it.**

> Kiroween 2026 · Skeleton Crew. Work in progress.

## What's here
| Path | What it is |
|---|---|
| `template/` | The skeleton: a C app loop, input, logging, and `nc_gfx`, a small drawing layer with two backends: `ps3` (tiny3d on real hardware / RPCS3) and `sdl` (a Linux desktop window for fast iteration) |
| `.kiro/` | Steering, specs, and hooks that make Kiro reliable at PS3 homebrew |
| `mcp/` | `necrocell-mcp`: Kiro tools to build, package, deploy, launch, and read logs |
| `apps/vitals/` | App 1: live temperature and fan health for aging consoles |
| `apps/ark/` | App 2: back up **your own** save data to your computer over the LAN. `host/` is the receiver |
| `docker/` | A pinned PS3 toolchain image (PSL1GHT) |
| `bench/` | Benchmark: plain Kiro vs Kiro + Necrocell on the same prompts |
| `site/` | Project site: docs, downloads, demo dashboards |
| `docs/` | Write-ups, including how Kiro was used |

## Ark's honest limit
PS3 save data is tied to the console and account that created it. Ark backs up and restores **your own** saves to **your own** machine. It is not for sharing saves, and it never touches game content.

## Not affiliated
An independent fan project. Not affiliated with or endorsed by Sony Interactive Entertainment. No Sony firmware, keys, or assets are included. You must install firmware for RPCS3 yourself, from Sony's official site.

## License
MIT
