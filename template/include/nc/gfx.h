/**
 * nc/gfx.h — 2-D drawing API.
 *
 * Colour convention: all colours are 0xRRGGBBAA, independent of platform
 * byte order.  The backend converts to whatever the underlying API expects.
 *
 * Coordinate space: 1280×720 logical units on both backends.  The PS3 backend
 * scales internally to the native 848×512 framebuffer; app code never sees
 * those numbers.
 *
 * No #ifdef in this header.
 */
#ifndef NC_GFX_H
#define NC_GFX_H

#include <stdint.h>

/**
 * Fill the entire framebuffer with rgba.
 * @param rgba  Background colour, 0xRRGGBBAA.
 */
void nc_gfx_clear(uint32_t rgba);

/**
 * Draw a filled axis-aligned rectangle.
 * @param x,y   Top-left corner in logical units.
 * @param w,h   Width and height in logical units.
 * @param rgba  Fill colour, 0xRRGGBBAA.
 */
void nc_gfx_rect(int x, int y, int w, int h, uint32_t rgba);

/**
 * Draw a 1-pixel line.
 * @param x0,y0  Start point.
 * @param x1,y1  End point.
 * @param rgba   Line colour, 0xRRGGBBAA.
 */
void nc_gfx_line(int x0, int y0, int x1, int y1, uint32_t rgba);

/**
 * Draw formatted text.
 * @param x,y   Top-left anchor in logical units.
 * @param size  Font height in logical units (approximate; monospace on PS3).
 * @param rgba  Text colour, 0xRRGGBBAA.
 * @param fmt   printf-style format string.
 */
void nc_gfx_text(int x, int y, int size, uint32_t rgba, const char *fmt, ...);

/**
 * Measure text width before drawing (useful for centring).
 * Returns the pixel width of str at the given size in logical units.
 * On PS3 (monospace): returns strlen(str) * (size * 0.6).
 */
int nc_gfx_text_width(int size, const char *str);

/**
 * Draw a PNG image, scaling to the given logical rect.
 * On load failure: logs the error and draws a magenta placeholder rectangle.
 * @param path  File-system path to the PNG.
 */
void nc_gfx_image(int x, int y, int w, int h, const char *path);

/**
 * Draw the animated ember wave background (amber #FF8C00 → violet #2A0A3A).
 * Call once per frame before drawing UI elements.
 * @param t  Monotonic time in seconds (drives the animation).
 */
void nc_gfx_wave(float t);

/**
 * Return the inset rectangle for the 5% TV safe area.
 * Pass pointers to x, y, w, h; they will be overwritten with the safe rect.
 * Use this to keep text and UI elements visible on all screens.
 */
void nc_gfx_safe_rect(int *x, int *y, int *w, int *h);

#endif /* NC_GFX_H */
