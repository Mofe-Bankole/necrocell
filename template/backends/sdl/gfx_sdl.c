/*
 * backends/sdl/gfx_sdl.c — nc_gfx implementation over SDL2 + SDL_ttf.
 *
 * Colour convention: nc_gfx takes 0xRRGGBBAA, converted here to SDL's
 * SDL_SetRenderDrawColor(r, g, b, a).
 *
 * Coordinate space: 1280×720 logical units, matches the window size.
 *
 * Ember wave: horizontal quad strips, y-offset driven by sin(x·k + t·w),
 * amber #FF8C00 → violet #2A0A3A, using SDL_RenderGeometry (SDL ≥ 2.0.18).
 */

#include "../../include/nc/gfx.h"
#include "../../include/nc/log.h"

#include <SDL2/SDL.h>
#include <SDL2/SDL_ttf.h>
#include <SDL2/SDL_image.h>
#include <stdio.h>
#include <stdarg.h>
#include <string.h>
#include <math.h>

#define LOGICAL_W  1280
#define LOGICAL_H  720

/* Declared in sys_sdl.c */
extern SDL_Renderer *g_renderer;

/* ---- colour helper ------------------------------------------------------ */

static void set_color(uint32_t rgba)
{
    Uint8 r = (rgba >> 24) & 0xFF;
    Uint8 g = (rgba >> 16) & 0xFF;
    Uint8 b = (rgba >>  8) & 0xFF;
    Uint8 a =  rgba        & 0xFF;
    SDL_SetRenderDrawColor(g_renderer, r, g, b, a);
}

/* ---- font cache --------------------------------------------------------- */

#define FONT_CACHE_SIZE 8
typedef struct {
    int      size;
    TTF_Font *font;
} FontEntry;
static FontEntry g_font_cache[FONT_CACHE_SIZE];
static int       g_font_count = 0;

/* Return a TTF_Font for the given logical size, opening from NC_ASSET_DIR.
   Returns NULL on failure. */
static TTF_Font *get_font(int size)
{
    for (int i = 0; i < g_font_count; i++) {
        if (g_font_cache[i].size == size) return g_font_cache[i].font;
    }
    if (g_font_count >= FONT_CACHE_SIZE) {
        TTF_CloseFont(g_font_cache[0].font);
        memmove(&g_font_cache[0], &g_font_cache[1],
                (size_t)(g_font_count - 1) * sizeof(FontEntry));
        g_font_count--;
    }
    /* NC_ASSET_DIR is the template's absolute assets/ path, set by Makefile.sdl,
     * so this works from any working directory and never picks up system fonts. */
    TTF_Font *f = TTF_OpenFont(NC_ASSET_DIR "JetBrainsMono-Regular.ttf", size);
    if (!f) {
        nc_log(NC_LOG_WARN, "get_font: TTF_OpenFont(size=%d) failed: %s", size, TTF_GetError());
        return NULL;
    }
    g_font_cache[g_font_count].size = size;
    g_font_cache[g_font_count].font = f;
    g_font_count++;
    return f;
}

/* ---- nc_gfx_* ---------------------------------------------------------- */

void nc_gfx_clear(uint32_t rgba)
{
    set_color(rgba);
    SDL_RenderClear(g_renderer);
}

void nc_gfx_rect(int x, int y, int w, int h, uint32_t rgba)
{
    set_color(rgba);
    SDL_Rect r = { x, y, w, h };
    SDL_RenderFillRect(g_renderer, &r);
}

void nc_gfx_line(int x0, int y0, int x1, int y1, uint32_t rgba)
{
    set_color(rgba);
    SDL_RenderDrawLine(g_renderer, x0, y0, x1, y1);
}

void nc_gfx_text(int x, int y, int size, uint32_t rgba, const char *fmt, ...)
{
    char buf[512];
    va_list ap;
    va_start(ap, fmt);
    vsnprintf(buf, sizeof(buf), fmt, ap);
    va_end(ap);

    TTF_Font *font = get_font(size);
    if (!font) {
        /* Fallback: draw a magenta rect so the caller can see something went wrong. */
        nc_gfx_rect(x, y, (int)(strlen(buf) * size * 0.6f), size, 0xFF00FFFF);
        return;
    }

    SDL_Color col = {
        (Uint8)((rgba >> 24) & 0xFF),
        (Uint8)((rgba >> 16) & 0xFF),
        (Uint8)((rgba >>  8) & 0xFF),
        (Uint8)( rgba        & 0xFF)
    };
    SDL_Surface *surf = TTF_RenderUTF8_Blended(font, buf[0] ? buf : " ", col);
    if (!surf) return;
    SDL_Texture *tex = SDL_CreateTextureFromSurface(g_renderer, surf);
    SDL_FreeSurface(surf);
    if (!tex) return;

    int tw, th;
    SDL_QueryTexture(tex, NULL, NULL, &tw, &th);
    SDL_Rect dst = { x, y, tw, th };
    SDL_RenderCopy(g_renderer, tex, NULL, &dst);
    SDL_DestroyTexture(tex);
}

int nc_gfx_text_width(int size, const char *str)
{
    TTF_Font *font = get_font(size);
    if (!font) return (int)(strlen(str) * size * 0.6f);
    int w = 0, h = 0;
    TTF_SizeUTF8(font, str, &w, &h);
    return w;
}

void nc_gfx_image(int x, int y, int w, int h, const char *path)
{
    SDL_Surface *surf = IMG_Load(path);
    if (!surf) {
        nc_log(NC_LOG_WARN, "nc_gfx_image: IMG_Load('%s') failed: %s", path, IMG_GetError());
        nc_gfx_rect(x, y, w, h, 0xFF00FFFF); /* magenta placeholder */
        return;
    }
    SDL_Texture *tex = SDL_CreateTextureFromSurface(g_renderer, surf);
    SDL_FreeSurface(surf);
    if (!tex) {
        nc_gfx_rect(x, y, w, h, 0xFF00FFFF);
        return;
    }
    SDL_Rect dst = { x, y, w, h };
    SDL_RenderCopy(g_renderer, tex, NULL, &dst);
    SDL_DestroyTexture(tex);
}

/* ---- ember wave --------------------------------------------------------- */

/*
 * Renders the ember wave background.
 * N horizontal strips, each a quad pair (two triangles via SDL_RenderGeometry).
 * y-displacement: A * sin(x * kx + t * speed)
 * Colour lerp: amber #FF8C00FF → violet #2A0A3AFF based on strip index.
 */
void nc_gfx_wave(float t)
{
    SDL_SetRenderDrawBlendMode(g_renderer, SDL_BLENDMODE_BLEND);

    const int   W      = LOGICAL_W;
    const int   H      = LOGICAL_H;
    const int   STRIPS = 24;
    const int   COLS   = 32;    /* horizontal segments per strip */
    const float A      = 28.0f; /* wave amplitude in px */
    const float kx     = 0.012f;
    const float speed  = 1.1f;

    /* Amber: FF8C00  Violet: 2A0A3A */
    for (int s = 0; s < STRIPS; s++) {
        float fy = (float)(s * H) / STRIPS;
        float fy_next = (float)((s + 1) * H) / STRIPS;
        float frac = (float)s / (STRIPS - 1);

        Uint8 cr = (Uint8)(0xFF * (1.0f - frac) + 0x2A * frac);
        Uint8 cg = (Uint8)(0x8C * (1.0f - frac) + 0x0A * frac);
        Uint8 cb = (Uint8)(0x00 * (1.0f - frac) + 0x3A * frac);
        Uint8 ca = (Uint8)(180 + (int)(60 * frac)); /* more opaque toward bottom */

        SDL_Color col = { cr, cg, cb, ca };

        /* Build quad strips as triangle pairs for SDL_RenderGeometry. */
        SDL_Vertex verts[4];
        for (int c = 0; c < COLS; c++) {
            float x0 = (float)(c * W) / COLS;
            float x1 = (float)((c + 1) * W) / COLS;

            float y0t = fy      + A * sinf(x0 * kx + t * speed + (float)s * 0.3f);
            float y0b = fy_next + A * sinf(x0 * kx + t * speed + (float)s * 0.3f + 0.5f);
            float y1t = fy      + A * sinf(x1 * kx + t * speed + (float)s * 0.3f);
            float y1b = fy_next + A * sinf(x1 * kx + t * speed + (float)s * 0.3f + 0.5f);

            /* Clamp to screen */
            if (y0t < 0) { y0t = 0; } if (y0t > H) { y0t = (float)H; }
            if (y0b < 0) { y0b = 0; } if (y0b > H) { y0b = (float)H; }
            if (y1t < 0) { y1t = 0; } if (y1t > H) { y1t = (float)H; }
            if (y1b < 0) { y1b = 0; } if (y1b > H) { y1b = (float)H; }

            verts[0].position.x = x0; verts[0].position.y = y0t; verts[0].color = col; verts[0].tex_coord.x = 0; verts[0].tex_coord.y = 0;
            verts[1].position.x = x1; verts[1].position.y = y1t; verts[1].color = col; verts[1].tex_coord.x = 0; verts[1].tex_coord.y = 0;
            verts[2].position.x = x1; verts[2].position.y = y1b; verts[2].color = col; verts[2].tex_coord.x = 0; verts[2].tex_coord.y = 0;
            verts[3].position.x = x0; verts[3].position.y = y0b; verts[3].color = col; verts[3].tex_coord.x = 0; verts[3].tex_coord.y = 0;

            int idx[6] = { 0, 1, 2, 0, 2, 3 };
            SDL_RenderGeometry(g_renderer, NULL, verts, 4, idx, 6);
        }
    }
}

void nc_gfx_safe_rect(int *x, int *y, int *w, int *h)
{
    int margin_x = LOGICAL_W * 5 / 100;
    int margin_y = LOGICAL_H * 5 / 100;
    *x = margin_x;
    *y = margin_y;
    *w = LOGICAL_W - 2 * margin_x;
    *h = LOGICAL_H - 2 * margin_y;
}
