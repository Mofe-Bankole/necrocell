# Design notes to give Kiro (not committed as-is)
- Layout:
  - `template/include/nc/{app.h,gfx.h,input.h,log.h}`
  - `template/src/{main.c,log.c}`
  - `template/backends/ps3/{gfx_tiny3d.c,input_pad.c,sys_ps3.c}`
  - `template/backends/sdl/{gfx_sdl.c,input_kbd.c,sys_sdl.c}`
  - `template/apps/hello/` (sample)
  - `Makefile` (PS3, PSL1GHT `ppu_rules`) + `Makefile.sdl`
- Backend selection happens at **link time** (different .c files per Makefile). No `#ifdef` soup in app code.
- Text: tiny3d + libfont on the PS3. On SDL, SDL_ttf with the **same OFL font file** so both look alike.
- Ember wave: N horizontal triangle strips whose y-offsets are sin(x·k + t·w), with alpha-blended amber → violet. Identical maths on both backends.
- Log packet (big-endian on the wire): `u32 magic 'NCLG' | u8 version | u8 level | u16 app_len | u64 t_us | u16 msg_len | app bytes | msg bytes`. The host parser is in `mcp/` (TS) with fast-check round-trip tests.
- Verified in the spike: `hldtux/ps3dev` ships tiny3d, libfont, SDL2 (PS3), NoRSX. The tiny3d samples `fonts` and `sprites2D` build. Use them as reference code.

- **Coordinate space (verified 2026-11-24):** apps draw in 1280×720 logical units. The ps3 backend maps them to tiny3d's 848×512 2D virtual space (see `.kiro/steering/ps3-api.md`, gotcha 1); the sdl backend uses 1280×720 directly.
