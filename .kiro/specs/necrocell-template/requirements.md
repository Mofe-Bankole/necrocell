# Requirements: necrocell-template

## Introduction
The Necrocell template is the reusable C skeleton every Necrocell app starts from. It gives an app a 60 fps main loop, controller/keyboard input, a small drawing API (`nc_gfx`) with a PS3 backend (tiny3d) and a Linux desktop backend (SDL2), network logging to the host, and clean exit. A developer (or Kiro) should be able to copy the template, rename it, and see a working app on the desktop, in RPCS3, and on a real PS3 without touching platform code.

## Requirement 1: build targets
**User story:** As a developer, I want one source tree to build for the PS3 and for Linux, so I can iterate on my laptop and ship to the console.
1. WHEN `make` runs inside the `hldtux/ps3dev` container THEN the system SHALL produce `build/<app>.self` with no warnings treated as errors being silently ignored.
2. WHEN the desktop build target runs on Linux with SDL2 installed THEN the system SHALL produce a native executable `build/<app>`.
3. WHEN the app metadata file is edited (title, TITLE_ID, icon) THEN the PS3 build SHALL embed it, and a package target SHALL produce `build/<app>.pkg`.
4. The template SHALL contain no Sony firmware, keys, trademarks, or copyrighted assets.

## Requirement 2: main loop & lifecycle
**User story:** As a user, I want apps to run smoothly and exit cleanly, so my console never hangs.
1. The app SHALL run a loop of input → update → draw → present, synchronized to vsync (target 60 fps).
2. WHEN the user requests exit from the system menu (PS3) or closes the window (desktop) THEN the app SHALL release resources and exit within 1 second.
3. The template SHALL expose app hooks `app_init`, `app_update(dt, input)`, `app_draw(gfx)`, and `app_shutdown`, so apps never edit the loop itself.

## Requirement 3: input
**User story:** As a user, I want to control apps with a controller on the PS3 and a keyboard on the desktop.
1. The system SHALL map input to logical actions: `UP, DOWN, LEFT, RIGHT, CONFIRM, BACK, MENU`.
2. WHEN an action is pressed THEN the app SHALL see a "pressed" edge event exactly once, plus a "held" state while it is held.
3. Desktop mapping SHALL be arrows / Enter / Escape / Tab. PS3 mapping SHALL use the first connected controller.

## Requirement 4: drawing (`nc_gfx`)
**User story:** As an app author, I want a tiny drawing API that works the same on both backends.
1. `nc_gfx` SHALL provide: clear, filled rectangle, line, text (with size and colour), image draw (PNG), and an animated **ember wave** background.
2. Colours SHALL be specified as 0xRRGGBBAA, independent of platform byte order.
3. The logical canvas SHALL be 1280×720 on both backends, with a helper for TV-safe margins.
4. WHEN a PNG asset fails to load THEN `nc_gfx` SHALL log the error and draw a visible placeholder instead of crashing.
5. The same app source SHALL compile unchanged against both backends.

## Requirement 5: logging
**User story:** As a developer (and Kiro), I want to read what the app is doing from my laptop.
1. `nc_log(level, fmt, ...)` SHALL send each line over UDP to a configurable host:port and print it on the desktop build.
2. WHEN the network is unavailable THEN logging SHALL drop messages without blocking the main loop.
3. Each log packet SHALL carry the app name, a monotonic timestamp, the level, and the message, in a documented, byte-order-safe format (so the host-side TypeScript parser can be property-tested).

## Requirement 6: sample app
**User story:** As a new developer, I want a working example in the template.
1. The template SHALL include a "hello" app showing the ember wave, a title, a menu navigable with UP/DOWN/CONFIRM, and the current fps.
2. The sample SHALL run on the desktop build and in RPCS3.

## Out of scope
SPU code, audio, 3D, networking beyond logging, and save-data access (Ark adds that).
