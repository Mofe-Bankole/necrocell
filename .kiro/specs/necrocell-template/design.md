# Design: necrocell-template

## Purpose
A C skeleton that any Necrocell app starts from. It provides a 60 fps main loop, controller/keyboard input, a small drawing API (`nc_gfx`) with two backends (PS3/tiny3d, Linux/SDL2), UDP network logging, and clean exit. App code never touches platform APIs directly.

---

## File layout

```
template/
  include/nc/
    app.h          — app hook prototypes: app_init, app_update, app_draw, app_shutdown
    gfx.h          — nc_gfx public API
    input.h        — NcInput struct, NcAction enum, edge/held helpers
    log.h          — nc_log public API
  src/
    sys.h          — internal sys_* interface the backends implement
    main.c         — entry point, main loop (uses only sys.h)
    log.c          — nc_log implementation: NCLG packet serialisation, raw UDP send
  backends/
    ps3/
      gfx_tiny3d.c — nc_gfx over tiny3d
      input_pad.c  — nc_input over ioPad
      sys_ps3.c    — init/shutdown, sysutil callback, time (sysGetSystemTime)
      net_ps3.c    — UDP open/send/close for nc_log
    sdl/
      gfx_sdl.c    — nc_gfx over SDL2 + SDL_ttf
      input_kbd.c  — nc_input over SDL keyboard events
      sys_sdl.c    — init/shutdown, window, time (SDL_GetPerformanceCounter)
      net_sdl.c    — UDP open/send/close for nc_log
  apps/
    hello/
      src/hello.c  — sample app: ember wave, title, UP/DOWN/CONFIRM menu, fps counter
      (TITLE/APPID set in the Makefile; ppu_rules makes PARAM.SFO)
      ICON0.PNG     — our own ember-pattern icon (placeholder until art session)
      Makefile      — includes ../../Makefile (PS3 build)
      Makefile.sdl  — includes ../../Makefile.sdl (SDL build)
  Makefile          — PS3 (PSL1GHT ppu_rules), builds to build/<app>.self + .pkg
  Makefile.sdl      — Linux, links SDL2 + SDL_ttf, builds to build/<app>
```

Backend selection is entirely at **link time** — a Makefile variable `BACKEND` selects which `.c` files to compile. No `#ifdef` in app or `nc_gfx` consumer code.

---

## Public API

### `nc/app.h`

```c
// Implement these four functions in your app. main.c calls them.
int  app_init(void);                            // return 0 = ok, non-zero = abort
void app_update(float dt, const NcInput *in);
void app_draw(void);
void app_shutdown(void);                        // called exactly once, by main.c only

// Provided by the template: ask the loop to stop after this frame.
// Apps never call app_shutdown themselves.
void nc_quit(void);
// Wall clock, seconds since 1970 UTC. PS3: sysGetCurrentTime (sys/systime.h).
// Timezone offset on PS3 is not verified yet; show UTC until it is.
uint64_t nc_time_unix(void);
```

### Internal `src/sys.h` (backends implement, apps never include)

```c
int      sys_init(const char *app_name);   // everything in the backend init sequence
void     sys_frame_begin(void);            // clear + blend state + Project2D (ps3) / clear (sdl)
void     sys_frame_end(void);              // Flip + sysUtilCheckCallback (ps3) / Present (sdl)
int      sys_running(void);                // 0 after EXIT_GAME, window close or nc_quit()
uint64_t sys_time_us(void);                // monotonic
void     sys_poll_input(NcInput *out);
void     sys_shutdown(void);
```
`main.c` uses only these, so it has no `#ifdef`.

### `nc/gfx.h`

```c
// Colours everywhere: 0xRRGGBBAA, independent of platform byte order.
// Coordinate space: 1280x720 logical units on both backends.

void nc_gfx_clear(uint32_t rgba);
void nc_gfx_rect(int x, int y, int w, int h, uint32_t rgba);
void nc_gfx_line(int x0, int y0, int x1, int y1, uint32_t rgba);
void nc_gfx_text(int x, int y, int size, uint32_t rgba, const char *fmt, ...);
int  nc_gfx_text_width(int size, const char *str);   // for centring; monospace on ps3
void nc_gfx_image(int x, int y, int w, int h, const char *path);   // PNG; placeholder on load fail
void nc_gfx_wave(float t);                      // animated ember wave background
// Safe-margin helper: returns the inset rect for 5% TV safe area
void nc_gfx_safe_rect(int *x, int *y, int *w, int *h);
```

### `nc/input.h`

```c
typedef enum {
    NC_UP, NC_DOWN, NC_LEFT, NC_RIGHT,
    NC_CONFIRM, NC_BACK, NC_MENU,
    NC_ACTION_COUNT
} NcAction;

// Raw buttons, for apps like Grip that need every one (bitmask of NC_BTN_*).
enum {
    NC_BTN_UP=1<<0, NC_BTN_DOWN=1<<1, NC_BTN_LEFT=1<<2, NC_BTN_RIGHT=1<<3,
    NC_BTN_CROSS=1<<4, NC_BTN_CIRCLE=1<<5, NC_BTN_SQUARE=1<<6, NC_BTN_TRIANGLE=1<<7,
    NC_BTN_L1=1<<8, NC_BTN_R1=1<<9, NC_BTN_L2=1<<10, NC_BTN_R2=1<<11,
    NC_BTN_L3=1<<12, NC_BTN_R3=1<<13, NC_BTN_START=1<<14, NC_BTN_SELECT=1<<15
};

typedef struct {
    uint8_t  pressed[NC_ACTION_COUNT];  // edge: true for exactly one frame
    uint8_t  held[NC_ACTION_COUNT];     // true while the button is held
    uint32_t buttons;                   // raw NC_BTN_* currently down
    uint32_t buttons_pressed;           // raw NC_BTN_* that went down this frame
    float    lx, ly, rx, ry;            // sticks, -1..1, deadzone 0.12 applied
    int      connected;                 // 0 if no controller (ps3) — apps may show a hint
} NcInput;
```
SDL raw mapping: arrows→d-pad, Enter→Cross, Esc→Circle, Backspace→Square, Space→Triangle, Q/E→L1/R1, Tab→Start, Shift→Select; WASD→left stick, IJKL→right stick. If an SDL game controller is present, use it too.

### `nc/log.h`

```c
typedef enum { NC_LOG_INFO=1, NC_LOG_WARN=2, NC_LOG_ERROR=3 } NcLogLevel;

// Sends a NCLG packet over UDP; also prints to stdout on SDL builds.
// Non-blocking: drops silently if the socket is not ready.
void nc_log(NcLogLevel level, const char *fmt, ...);

// Called once at startup; pass NULL host to disable UDP.
int  nc_log_init(const char *host, uint16_t port, const char *app_name);
void nc_log_shutdown(void);
```

---

## NCLG packet format (big-endian on the wire)

```
Offset  Size  Field
0       4     magic: 'N','C','L','G' (0x4E434C47)
4       1     version: 1
5       1     level: NcLogLevel (1/2/3)
6       2     app_len: length of app_name string (no NUL)
8       8     t_us: monotonic timestamp, microseconds (u64)
16      2     msg_len: length of message string (no NUL)
18      app_len   app_name bytes
18+app_len  msg_len   message bytes
```

Total minimum size: 18 bytes. No NUL terminators included in lengths.
All multi-byte fields written byte-by-byte (no struct cast) to handle the PPU big-endian and host little-endian difference. The host-side TypeScript parser lives in `mcp/` and is property-tested with fast-check round-trips.

---

## nc_gfx backends

### PS3 backend (`backends/ps3/gfx_tiny3d.c`)

Coordinate mapping: app draws in 1280×720 logical units. The backend scales **every** coordinate and size itself with two static helpers, `sx(x) = x * 848.0f/1280` and `sy(y) = y * 512.0f/720`, before calling tiny3d or libfont. Do **not** use `tiny3d_UserViewport` (its scale semantics are unverified and it would not cover libfont the same way). App code never sees 848 or 512.

Colour conversion: `nc_gfx` takes `0xRRGGBBAA`. Assumed: `tiny3d_VertexColor` takes `0xRRGGBBAA`, `tiny3d_Clear` takes `0xAARRGGBB`. **Unverified**: the hello app's first PS3 run draws three patches (pure red, green, blue) plus a half-alpha white bar; if colours are wrong, fix the conversion in one place and record the answer in ps3-api.md.

Filled rect: `tiny3d_SetPolygon(TINY3D_QUADS)` + four `tiny3d_VertexPos` + `tiny3d_VertexColor` calls per corner + `tiny3d_End()`.

Lines: `tiny3d_SetPolygon(TINY3D_LINES)`.

Text: `libfont` bitmap font (`AddFontFromBitmapArray`) — TrueType rendering is out of scope for v1 (see ps3-api.md gotcha 2). Font data: **font8x8_basic** by Daniel Hepper (public domain, 8×8, 1 bpp, chars 0x00–0x7F, leftmost pixel = bit 0 → `BIT0_FIRST_PIXEL`), vendored as `template/assets/font8x8_basic.h` and listed in ASSETS.md. Do not copy fonts from the tiny3d samples (licence unclear). Upload once at init: `texture = tiny3d_AllocTexture(64*1024)`, `AddFontFromBitmapArray(font, texture, 32, 127, 8, 8, 1, BIT0_FIRST_PIXEL)`; then `SetFontSize(sx(size*0.6), sy(size))` / `SetFontColor` / `DrawString` per call (format with `vsnprintf` into a 256-byte buffer first).

PNG image: `sysModuleLoad(SYSMODULE_PNGDEC)` at startup, then `pngLoadFromFile` → upload texture → `tiny3d_SetTexture`. On failure: log the error, draw a magenta placeholder rect.

Ember wave: N horizontal quad strips, y-offset = `sin(x·k + t·w)`, alpha-blended amber `0xFF8C00FF` → violet `0x2A0A3AFF`. Same maths as the site's `wave.ts`. Drawn with `tiny3d_SetPolygon(TINY3D_QUADS)` strips.

Alpha blending: set once per frame before drawing, using the exact lines from the verified fonts sample (ps3-api.md "Main loop shape").

### SDL backend (`backends/sdl/gfx_sdl.c`)

Logical canvas: 1280×720 window, no scaling needed.

Filled rect: `SDL_SetRenderDrawColor` + `SDL_RenderFillRect`.

Lines: `SDL_RenderDrawLine`.

Text: `SDL_ttf` with **JetBrains Mono** (OFL, already the site's mono font; vendor `template/assets/JetBrainsMono-Regular.ttf`) so widths stay close to the monospace PS3 font. `TTF_OpenFont` once at init, `TTF_RenderUTF8_Blended` → `SDL_Texture` → `SDL_RenderCopy`.

PNG image: `SDL_LoadBMP` / `IMG_Load` → `SDL_Texture`. On failure: log + magenta placeholder.

Ember wave: same trigonometry as PS3 backend, rendered as coloured quads (two triangles each) with `SDL_RenderGeometry` (SDL ≥ 2.0.18), blend mode `SDL_BLENDMODE_BLEND`.

---

## Input backends

### PS3 (`backends/ps3/input_pad.c`)

`ioPadInit(7)` at startup. Each frame: `ioPadGetInfo` → find first connected port → `ioPadGetData`. Map `padData` bits to `NcAction` using the table in ps3-api.md. Compute `pressed` as `(current & ~previous)`, `held` as `current`.

### SDL (`backends/sdl/input_kbd.c`)

`SDL_PollEvent` loop. Map `SDLK_UP/DOWN/LEFT/RIGHT → NC_UP/DOWN/LEFT/RIGHT`, `SDLK_RETURN → NC_CONFIRM`, `SDLK_ESCAPE → NC_BACK`, `SDLK_TAB → NC_MENU`. `SDL_QUIT` event sets the global `running = 0` via the same path as the PS3 sysutil callback.

---

## System backends

### PS3 (`backends/ps3/sys_ps3.c`)

Init sequence (order matters):
1. `sysModuleLoad(SYSMODULE_NET)` → `netInitialize()` (needed before nc_log)
2. `sysModuleLoad(SYSMODULE_PNGDEC)` (needed before any image load)
3. `tiny3d_Init(1024*1024)`
4. `ioPadInit(7)`
5. `sysUtilRegisterCallback(0, on_sysutil, NULL)` — sets `running = 0` on `SYSUTIL_EXIT_GAME`
6. `nc_log_init(host, port, app_name)` — host from compile-time define `NC_LOG_HOST`

Shutdown (reverse order): `app_shutdown()` → `nc_log_shutdown()` → `ioPadEnd()` → `tiny3d_Exit()` → `netDeinitialize()`.

Time: `sysGetSystemTime()` returns microseconds; `dt = (now - prev) / 1e6f`.

Main loop shape: verbatim from ps3-api.md, plus `app_update` / `app_draw` calls and the 1-second exit deadline.

### SDL (`backends/sdl/sys_sdl.c`)

`SDL_Init(SDL_INIT_VIDEO | SDL_INIT_EVENTS)` → `TTF_Init()` → create 1280×720 window + renderer. Time via `SDL_GetPerformanceCounter` / `SDL_GetPerformanceFrequency`. On window close event, set `running = 0`.

---

## Build system

### `Makefile` (PS3)

Uses PSL1GHT `ppu_rules` (verified in the image: it already has `%.self: %.elf` and `%.pkg: %.self` rules driven by the variables `TITLE`, `APPID`, `CONTENTID`, `ICON0`, `SFOXML`, `PKGFILES`; `SFOXML` defaults to `$(PS3DEV)/bin/sfo.xml`). Set: `TITLE := Necrocell Hello`, `APPID := NCLL00001`, `CONTENTID := UP0001-$(APPID)_00-0000000000000000`, `ICON0 := ICON0.PNG`. Do not write a custom sfo.xml or call fself/pkg by hand. Copy the structure of a PSL1GHT sample Makefile (e.g. `samples/graphics/...`), add `-ltiny3d -lfont -lpngdec -lnet -lsysutil -lio -lsysmodule -lrt -llv2 -lm` and grep `/usr/local/ps3dev` for any lib name before adding it.
Warnings: `-Wall -Wextra` on PS3 (toolchain headers emit warnings we cannot fix); `-Werror` only in the SDL build.

### `Makefile.sdl` (Linux)

`cc` with `-Wall -Wextra -Werror`. Links: `$(shell pkg-config --libs sdl2 SDL2_ttf SDL2_image)`. Produces `build/$(TARGET)`.

Both Makefiles expose a `clean` target. The PS3 Makefile expects to run inside the `hldtux/ps3dev` container.

---

## Hello sample (`apps/hello/`)

Shows all template capabilities in one screen:
- Ember wave fills the background (`nc_gfx_wave`).
- Title text at top ("Necrocell Hello") in amber.
- A three-item menu (Start, Options, Quit) navigable with UP/DOWN/CONFIRM.
- FPS counter, bottom-right, inside the safe margin.
- Selecting Quit calls `nc_quit()`; main.c then calls `app_shutdown` once.
- First version also draws the red/green/blue/half-white colour check strip (remove once verified).
- TITLE_ID: `NCLL00001`.

---

## Constraints

- **Only APIs from `ps3-api.md`** are used in the PS3 backend. Any needed function not listed there must be grepped from the headers inside the container first and added to `ps3-api.md` before use.
- No `#ifdef PLATFORM` in `include/nc/` headers or in app code.
- No Sony trademarks, fonts, icons, or sounds anywhere.
- No SPU code, audio, 3D, or save-data access in this template (out of scope per requirements).
- nc_log UDP send must never block the main loop. Use `sendto(..., MSG_DONTWAIT, ...)` (both verified in `net/socket.h`: `MSG_DONTWAIT 0x0080`). No threads.
- `src/log.c` holds only packet encoding and formatting; the socket open/send/close lives in `backends/{ps3,sdl}/net_*.c` so log.c has no `#ifdef`.
- Paths: the hello sample lives at `template/apps/hello/`; real apps (Vitals, Ark, Grip…) live in top-level `apps/<name>/` and include `../../template/Makefile`.
