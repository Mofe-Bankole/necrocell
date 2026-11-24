---
inclusion: fileMatch
fileMatchPattern: ["template/**", "apps/**/src/**", "apps/**/Makefile"]
---
# PS3 platform rules (PSL1GHT homebrew, C)

## Toolchain facts
- SDK: **PSL1GHT** + ps3toolchain, used via the Docker image `hldtux/ps3dev` (`$PS3DEV=/usr/local/ps3dev`).
- Available libraries in `$PS3DEV/portlibs/ppu`: **tiny3d**, **libfont**, SDL2 (PS3 port), NoRSX, cairo, libpng/jpeg. **Before using any function, confirm it exists by grepping the headers in `$PS3DEV`**. Never invent APIs. If unsure, say so and check.
- Outputs: `.elf` → `.self` (and `.fake.self`) → optional `.pkg`. Build with `make` inside the container.
- Do **not** use the Cg shader compiler (not installed). Use tiny3d's built-in shaders.

## CPU / memory
- The PPU is **big-endian PowerPC 64**. Any data shared with the host (network packets, files read on Linux) must use explicit byte-order helpers, never raw struct dumps.
- Keep memory use small (the system has 256 MB main RAM and 256 MB video RAM). No large static buffers without justification.
- RSX/DMA-visible buffers must be properly aligned (tiny3d/rsx helpers handle this; don't hand-roll unless required). SPU DMA needs 16-byte alignment, 128 preferred. SPU work is out of scope unless a spec asks for it.

## App lifecycle
- One main loop: poll input → update → draw → flip, at vsync (60 Hz).
- Register a system-utility callback and **exit cleanly when the user quits from the system menu** (handle the exit-game event). Never hang on exit.
- Never block the main loop on network or disk I/O. Use a worker thread or a non-blocking/polled design.

## Graphics
- Apps draw only through `nc_gfx` (`template/include/nc/gfx.h`). Backends: `ps3` (tiny3d) and `sdl` (Linux desktop). App code must compile against both.
- Target 1280×720, with safe margins of about 5% for TVs.

## Logging & debugging
- Use `nc_log()` (UDP to the host, plus stdout on the SDL build). Every error path logs a clear message.

## Testing order
1. SDL desktop build (fast).
2. RPCS3 (`rpcs3 --no-gui app.self`).
3. Real PS3 (HEN + webMAN MOD), when available.
