# Tasks: necrocell-template

Tasks are grouped into four implementation phases that can run in order. Each phase ends with a working, testable state. Code is not written until a session picks up a phase.

---

## Group A — Public headers + SDL backend + Hello on Linux

Goal: a developer can run `make -f Makefile.sdl` and see the hello app in a desktop window. No PS3 toolchain needed.

- [ ] **A1** Create `template/include/nc/app.h` — `app_init`, `app_update`, `app_draw`, `app_shutdown` prototypes exactly as specified in `design.md`. No implementation.
- [ ] **A2** Create `template/include/nc/input.h` — `NcAction` enum (`NC_UP … NC_MENU, NC_ACTION_COUNT`), `NcInput` struct (`pressed[]`, `held[]`), and inline edge/held helpers.
- [ ] **A3** Create `template/include/nc/gfx.h` — `nc_gfx_clear`, `nc_gfx_rect`, `nc_gfx_line`, `nc_gfx_text`, `nc_gfx_image`, `nc_gfx_wave`, `nc_gfx_safe_rect`. Colour convention comment: `0xRRGGBBAA`. Coordinate space comment: `1280×720 logical units`.
- [ ] **A4** Create `template/include/nc/log.h` — `NcLogLevel` enum, `nc_log`, `nc_log_init`, `nc_log_shutdown`. Document the `NCLG` packet layout in a comment.
- [ ] **A5** Create `template/src/log.c` — `nc_log_init` / `nc_log_shutdown` / `nc_log`. On SDL builds: `printf` to stdout + UDP send via POSIX `sendto` with `MSG_DONTWAIT`. Packet serialised byte-by-byte per the `NCLG` spec in `design.md`. On unavailable network: drop silently, no blocking.
- [ ] **A6** Create `template/backends/sdl/sys_sdl.c` — `SDL_Init`, window (1280×720), renderer, `TTF_Init`, `SDL_GetPerformanceCounter` time, `running` global, window-close → `running = 0`.
- [ ] **A7** Create `template/backends/sdl/input_kbd.c` — `SDL_PollEvent` loop mapping `SDLK_*` to `NcAction`. Compute `pressed` (edge) and `held` per frame.
- [ ] **A8** Create `template/backends/sdl/gfx_sdl.c` — implement all `nc_gfx_*` functions using `SDL_RenderFillRect`, `SDL_RenderDrawLine`, `SDL_ttf`, `SDL_LoadBMP`/`IMG_Load`. Colour `0xRRGGBBAA` → `SDL_SetRenderDrawColor(r,g,b,a)`. Ember wave: N quad strips with sine offsets, alpha-blended amber→violet. PNG fail: log + magenta rect.
- [ ] **A9** Create `template/src/main.c` — the main loop, calling `sys_*` init, `app_init`, then `while(running): input → app_update(dt, &input) → app_draw() → present → syscheck`. Calls `app_shutdown` on exit. No platform `#ifdef` — backend differences are hidden in `sys_*` and the backend files.
- [ ] **A10** Create `template/Makefile.sdl` — links SDL2, SDL2_ttf, SDL2_image via `pkg-config`. `-Wall -Wextra -Werror`. Output: `build/$(TARGET)`. Provides `clean` target. Accepts `TARGET` and `APPDIR` variables.
- [ ] **A11** Create `template/apps/hello/src/hello.c` — implements `app_init/update/draw/shutdown`. Draws ember wave background, amber title, three-item menu (Start / Options / Quit) navigated with `NC_UP/DOWN/CONFIRM`, fps counter bottom-right inside safe margin.
- [ ] **A12** Create `template/apps/hello/Makefile.sdl` — sets `TARGET=hello`, `APPDIR=.`, includes `../../Makefile.sdl`.
- [ ] **A13** Verify: `make -f Makefile.sdl` in `template/apps/hello/` produces `build/hello`, it launches, shows the wave + menu, UP/DOWN moves selection, CONFIRM on Quit exits cleanly, window close exits cleanly. Fix any build errors.

---

## Group B — PS3 backend with tiny3d + RPCS3 run

Goal: `make` inside the Docker container produces `build/hello.self`; it boots in RPCS3, renders correctly, and exits cleanly from the system menu.

- [ ] **B1** Create `template/backends/ps3/sys_ps3.c` — full init sequence: `sysModuleLoad(SYSMODULE_NET)` → `netInitialize()` → `sysModuleLoad(SYSMODULE_PNGDEC)` → `tiny3d_Init(1024*1024)` → `ioPadInit(7)` → `sysUtilRegisterCallback(0, on_sysutil, NULL)` (sets `running=0` on `SYSUTIL_EXIT_GAME`) → `nc_log_init`. Shutdown in reverse. Time via `sysGetSystemTime()`. All APIs from `ps3-api.md` only.
- [ ] **B2** Create `template/backends/ps3/input_pad.c` — `ioPadGetInfo` + `ioPadGetData` each frame. Map d-pad + BTN_CROSS/CIRCLE/START to `NcAction` per the table in `ps3-api.md`. Compute `pressed` and `held`.
- [ ] **B3** Create `template/backends/ps3/gfx_tiny3d.c` — implement all `nc_gfx_*` functions:
    - Init: call `tiny3d_UserViewport` once to establish the 1280×720 → 848×512 mapping (scale factors `848.0/1280.0`, `512.0/720.0`). Never hard-code 848/512 in app-visible code.
    - `nc_gfx_clear`: `tiny3d_Clear` with `0xAARRGGBB` (note: byte order differs from vertex colour; convert from `0xRRGGBBAA`).
    - Rect / line: `tiny3d_SetPolygon(TINY3D_QUADS/TINY3D_LINES)` → `tiny3d_VertexPos` + `tiny3d_VertexColor` (`0xRRGGBBAA`) → `tiny3d_End()`.
    - Text: `libfont` bitmap font — `ResetFont`, `AddFontFromBitmapArray`, `SetFontSize`, `SetFontColor`, `DrawFormatString`. (TrueType out of scope for v1.)
    - PNG image: `pngLoadFromFile` → `tiny3d_AllocTexture` → `tiny3d_SetTexture`. On fail: log + magenta rect.
    - Ember wave: same trigonometry as SDL backend, rendered as quad strips.
    - Alpha blend setup: exact lines from ps3-api.md "Main loop shape" called once per frame before any drawing.
- [ ] **B4** Create `template/Makefile` — PSL1GHT `ppu_rules`. Compiles template srcs + PS3 backend files, links `-ltiny3d -lfont -lnet -lpngdec`. `-Wall -Wextra -Werror`. Targets: `build/$(TARGET).elf` → `build/$(TARGET).self` (via `fself.py`). Package target: `build/$(TARGET).pkg` (via `pkg.py` with `sfo.xml` + `ICON0.PNG`). `clean` target.
- [ ] **B5** Create `template/apps/hello/sfo.xml` — `TITLE_ID: NCLL00001`, title "Necrocell Hello", no Sony trademarks.
- [ ] **B6** Create `template/apps/hello/ICON0.PNG` — 320×176 original ember-pattern icon (amber wave on near-black). Our own artwork, no third-party assets.
- [ ] **B7** Create `template/apps/hello/Makefile` — sets `TARGET=hello`, includes `../../Makefile`.
- [ ] **B8** Verify (inside Docker): `docker run --rm -u $(id -u):$(id -g) -v $PWD:/src -w /src/template/apps/hello hldtux/ps3dev make` produces `build/hello.self` with no errors or suppressed warnings.
- [ ] **B9** Verify (RPCS3): launch `build/hello.self` via `necrocell-mcp launch --target rpcs3`. Confirm: ember wave renders, menu navigable with controller, pressing Start on "Quit" exits, pressing system menu button and selecting exit also exits within 1 second. Fix any issues.

---

## Group C — nc_log UDP + host listener

Goal: `nc_log` calls on the console send `NCLG` packets to the host; `mcp/` parses and prints them.

- [ ] **C1** Extend `template/src/log.c` for the PS3 path — raw UDP socket via `socket(AF_INET, SOCK_DGRAM, 0)` + `sendto`. Socket opened non-blocking. Write each packet field byte-by-byte (no struct cast) to handle big-endian PPU sending to little-endian host. `MSG_DONTWAIT` on send; drop on `EAGAIN`.
- [ ] **C2** Add `NC_LOG_HOST` and `NC_LOG_PORT` to the PS3 Makefile as compile-time defines (`-DNC_LOG_HOST=\"192.168.x.x\"` pattern). Document how to override them.
- [ ] **C3** Write `mcp/log-listener.ts` (or extend the existing MCP server) — binds a UDP socket on the configured port, parses incoming `NCLG` packets (magic check, version check, big-endian u64 timestamp, app_name + message extraction), prints `[app] [level] [t_us] message`. Rejects malformed packets without crashing.
- [ ] **C4** Write fast-check round-trip property tests for the NCLG parser: for any `{app_name, level, t_us, message}`, serialise with the same byte layout, parse, assert fields equal. Run with `npm test` in `mcp/`.
- [ ] **C5** Verify end-to-end: hello app running in RPCS3 emits `nc_log(NC_LOG_INFO, "hello init")` on startup; the host listener prints it within 1 second of app launch.

---

## Group D — Template documentation

Goal: a new developer (or Kiro on a fresh prompt) can build and ship an app from the template without reading implementation code.

- [ ] **D1** Write `template/README.md` — what the template provides, the two build commands, the four app hooks, and the nc_gfx / nc_input / nc_log APIs in brief. Links to `design.md` for full detail.
- [ ] **D2** Write `template/PORTING.md` — step-by-step: copy `apps/hello/`, rename `TARGET` in both Makefiles, change `TITLE_ID` in `sfo.xml`, replace `hello.c` with app logic. Notes on the coordinate space, colour convention, and the nc_log host define.
- [ ] **D3** Add inline Doxygen-style comments to all four public headers (`app.h`, `gfx.h`, `input.h`, `log.h`) covering: what each function does, units/conventions for parameters, and what happens on error.
- [ ] **D4** Update the top-level `README.md` to link to `template/README.md` and note that the template is the starting point for new apps.
