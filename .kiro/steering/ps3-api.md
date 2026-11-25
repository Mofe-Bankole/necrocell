---
inclusion: fileMatch
fileMatchPattern: ["template/**", "apps/**/src/**", "apps/**/Makefile"]
---
# PS3 API reference (verified against the `hldtux/ps3dev` headers, 2026-11-24)

Every signature below was copied from the toolchain headers. **If you need a function that is not listed here, grep the headers first** (`docker run --rm hldtux/ps3dev grep -rn "<name>" /usr/local/ps3dev/ppu/include /usr/local/ps3dev/portlibs/ppu/include`). Never guess a name or signature.

Header roots inside the container:
- PSL1GHT: `/usr/local/ps3dev/ppu/include` (io/, sysutil/, net/, lv2/, sysmodule/, pngdec/)
- Port libs: `/usr/local/ps3dev/portlibs/ppu/include` (tiny3d.h, libfont.h, debugnet.h, SDL2/, freetype2/)

## ⚠️ Gotchas (read first)
1. **tiny3d 2D space is 848×512 virtual units, not 1280×720.** `nc_gfx` takes 1280×720 coordinates and must scale (x · 848/1280, y · 512/720), or set `tiny3d_UserViewport` once. Do not hard-code 848/512 in apps.
2. **libfont draws bitmap fonts only** (`AddFontFromBitmapArray`). TrueType needs freetype2 rendering to a texture; that is optional and out of scope for v1.
3. **There is no temperature API in the headers.** Vitals' console-side reading uses a raw LV2 syscall that must be **verified on real HEN hardware** before we claim it works. The webMAN HTTP fallback is the safe path.
4. The tiny3d samples loop with `while(1)` and never handle exit. **Our template must** register a sysutil callback and leave the loop on `SYSUTIL_EXIT_GAME`, or the console hangs on quit.
5. The PPU is **big-endian**. Anything sent over the network must be written byte by byte or with explicit swaps.
6. `pngLoadFromFile` needs `sysModuleLoad(SYSMODULE_PNGDEC)` first; sockets need `netInitialize()` (and `SYSMODULE_NET`).

## tiny3d (`#include <tiny3d.h>`)
```c
int  tiny3d_Init(u32 vertex_buff_size);          /* samples use 1024*1024 */
void tiny3d_Exit(void);
void tiny3d_Clear(u32 color, clear_flags flags); /* color 0xAARRGGBB; flags TINY3D_CLEAR_ALL */
void tiny3d_Project2D();                         /* 2D mode, 848x512 virtual */
void tiny3d_UserViewport(int onoff, float pos_x, float pos_y, float scale2D_x, float scale2D_y, float scale3D_x, float scale3D_y);
void tiny3d_AlphaTest(int enable, u8 ref, alpha_func func);
void tiny3d_BlendFunc(int enable, blend_src_func src_fun, blend_dst_func dst_func, blend_func func);
int  tiny3d_SetPolygon(type_polygon type);       /* TINY3D_QUADS, TINY3D_LINES, TINY3D_TRIANGLES, TINY3D_LINE_STRIP */
void tiny3d_VertexPos(float x, float y, float z);
void tiny3d_VertexColor(u32 rgba);               /* NOTE: 0xRRGGBBAA here, unlike Clear */
void tiny3d_VertexTexture(float u, float v);
int  tiny3d_End();
void tiny3d_Flip();
int  tiny3d_MenuActive();                        /* true while the system menu is open */
void *tiny3d_AllocTexture(u32 size);
u32  tiny3d_TextureOffset(void *text);
void tiny3d_SetTexture(u32 unit, u32 offset, u32 width, u32 height, u32 stride, text_format fmt, int smooth);
```
Verify the colour byte order for `tiny3d_Clear` vs `tiny3d_VertexColor` against a sample before relying on it (the fonts sample clears with `0xff000000` = opaque black).

## libfont (`#include <libfont.h>`)
```c
void  ResetFont();
u8   *AddFontFromBitmapArray(u8 *font, u8 *texture, u8 first_char, u8 last_char, int w, int h, int bits_per_pixel, int byte_order);
      /* byte_order: BIT0_FIRST_PIXEL 0, BIT7_FIRST_PIXEL 1 */
void  SetCurrentFont(int nfont);
void  SetFontSize(int sx, int sy);
void  SetFontColor(u32 color, u32 bkcolor);
void  SetFontAutoCenter(int on_off);
float DrawString(float x, float y, char *str);  /* returns x after the text */
float DrawFormatString(float x, float y, char *format, ...);
```
Reference: `tiny3d/samples/fonts/source/main.c` (verified running in RPCS3 on 2026-11-24).

## Controller (`#include <io/pad.h>`)
```c
s32 ioPadInit(u32 max);              /* samples use 7 */
s32 ioPadEnd();
s32 ioPadGetInfo(padInfo *info);     /* info.status[i] != 0 means port i connected */
s32 ioPadGetData(u32 port, padData *data);
```
`padData` bitfields: `BTN_UP/DOWN/LEFT/RIGHT`, `BTN_CROSS/CIRCLE/SQUARE/TRIANGLE`, `BTN_START/SELECT`, `BTN_L1/R1/L2/R2/L3/R3`; sticks `ANA_L_H`, `ANA_L_V`, `ANA_R_H`, `ANA_R_V` (0–255, centre ≈ 128).
Mapping to `nc_input` actions: UP/DOWN/LEFT/RIGHT ← d-pad; CONFIRM ← BTN_CROSS; BACK ← BTN_CIRCLE; MENU ← BTN_START. (Region conventions differ; keep the mapping in one table.)

## System callbacks (`#include <sysutil/sysutil.h>`)
```c
typedef void (*sysutilCallback)(u64 status, u64 param, void *usrdata);
s32 sysUtilRegisterCallback(s32 slot, sysutilCallback cb, void *usrdata);
s32 sysUtilCheckCallback();          /* call once per frame */
s32 sysUtilUnregisterCallback(s32 slot);
/* status values: SYSUTIL_EXIT_GAME 0x0101, SYSUTIL_DRAW_BEGIN 0x0121, SYSUTIL_MENU_OPEN 0x0131 */
```

## Time (`#include <lv2/systime.h>`)
```c
s64 sysGetSystemTime();              /* microseconds; use for dt */
```

## Modules (`#include <sysmodule/sysmodule.h>`)
```c
s32 sysModuleLoad(sysModuleId id);   /* SYSMODULE_NET = 0x0, SYSMODULE_PNGDEC = 0x18 */
```

## PNG (`#include <pngdec/pngdec.h>`)
```c
s32 pngLoadFromFile(const char *filename, pngData *out);
s32 pngLoadFromBuffer(const void *buffer, u32 size, pngData *out);
```

## Network (`#include <net/net.h>`, `<net/socket.h>`)
```c
s32 netInitialize();
s32 netDeinitialize();
int socket(int domain, int type, int protocol);
ssize_t sendto(int socket, const void* message, size_t length, int flags, const struct sockaddr* dest_addr, socklen_t dest_len);
/* net/socket.h: MSG_DONTWAIT 0x0080, SO_NBIO 0x1100 (verified 2026-11-25) */
```

## Wall clock (`#include <sys/systime.h>`)
```c
s32 sysGetCurrentTime(u64 *sec, u64 *nsec);   /* seconds since 1970, UTC. Timezone source not verified yet. */
```

## Build rules (`$(PS3DEV)/ppu_rules`, verified 2026-11-25)
Built-in rules `%.self: %.elf` and `%.pkg: %.self`. Variables: `TITLE`, `APPID`, `CONTENTID`, `ICON0`, `SFOXML` (default `$(PS3DEV)/bin/sfo.xml`), `PKGFILES`. Tools in `$(PS3DEV)/bin`: `fself`, `pkg`, `sfo`. Don't hand-roll these.

## Not in the image
The tiny3d **samples** (and their font data) are not installed in `hldtux/ps3dev`. Use the vendored `template/assets/font8x8_basic.h` (public domain), never sample fonts.

## UDP debug logging (`#include <debugnet.h>`, port lib)
```c
int  debugNetInit(const char *serverIp, int port, int level);  /* levels NONE 0, INFO 1, ERROR 2, DEBUG 3 */
void debugNetUDPSend(const char *text);
void debugNetPrintf(int level, const char *format, ...);
void debugNetFinish();
```
`nc_log` sends our own binary `NCLG` packet (see the template design notes), so it uses raw sockets; debugnet is a fallback for quick debugging only.

## Main loop shape (from the verified fonts sample, plus our exit handling)
```c
tiny3d_Init(1024*1024);
ioPadInit(7);
sysUtilRegisterCallback(0, on_sysutil, NULL);   /* sets running = 0 on SYSUTIL_EXIT_GAME */
while (running) {
    tiny3d_Clear(0xff000000, TINY3D_CLEAR_ALL);
    tiny3d_AlphaTest(1, 0x10, TINY3D_ALPHA_FUNC_GEQUAL);
    tiny3d_BlendFunc(1, TINY3D_BLEND_FUNC_SRC_RGB_SRC_ALPHA | TINY3D_BLEND_FUNC_SRC_ALPHA_SRC_ALPHA,
                     TINY3D_BLEND_FUNC_DST_RGB_ONE_MINUS_SRC_ALPHA | TINY3D_BLEND_FUNC_DST_ALPHA_ZERO,
                     TINY3D_BLEND_RGB_FUNC_ADD | TINY3D_BLEND_ALPHA_FUNC_ADD);
    tiny3d_Project2D();
    /* read pads, app_update(dt, &input), app_draw(&gfx) */
    tiny3d_Flip();
    sysUtilCheckCallback();
}
/* app_shutdown(); ioPadEnd(); tiny3d_Exit(); */
```
The AlphaTest/BlendFunc lines are copied verbatim from `samples/fonts/source/main.c` (lines 151–156), which runs in RPCS3.
