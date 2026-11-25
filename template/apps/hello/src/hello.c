/*
 * apps/hello/src/hello.c — Necrocell Hello sample app.
 *
 * Demonstrates all template capabilities:
 *   - nc_gfx_wave: animated ember wave background
 *   - nc_gfx_text: amber title, three-item menu, fps counter
 *   - nc_gfx_rect: colour-check strip (red / green / blue / half-alpha white)
 *   - A moving box to verify per-frame animation
 *   - NC_UP/DOWN/CONFIRM navigation; Quit calls nc_quit()
 *
 * NC_BACK (Esc) also exits cleanly.
 */

#include <nc/app.h>
#include <nc/gfx.h>
#include <nc/input.h>
#include <nc/log.h>

#include <math.h>
#include <stdint.h>

/* ---- state ------------------------------------------------------------- */

static const char *k_items[] = { "Start", "Options", "Quit" };
#define NUM_ITEMS 3

static int   g_sel      = 0;
static float g_t        = 0.0f;   /* monotonic time for wave + box animation */
static float g_fps_acc  = 0.0f;
static int   g_fps_frames = 0;
static float g_fps_shown  = 0.0f;

/* Moving box */
static float g_box_x = 0.0f;
static float g_box_y = 360.0f;
static float g_box_vx = 180.0f;  /* logical px / sec */
static float g_box_vy = 120.0f;

#define BOX_W 40
#define BOX_H 40

/* ---- app hooks --------------------------------------------------------- */

int app_init(void)
{
    nc_log(NC_LOG_INFO, "hello init");
    g_sel    = 0;
    g_t      = 0.0f;
    g_box_x  = 200.0f;
    g_box_y  = 360.0f;
    return 0;
}

void app_update(float dt, const NcInput *in)
{
    g_t += dt;

    /* FPS counter — update once per second */
    g_fps_acc += dt;
    g_fps_frames++;
    if (g_fps_acc >= 1.0f) {
        g_fps_shown  = (float)g_fps_frames / g_fps_acc;
        g_fps_acc    = 0.0f;
        g_fps_frames = 0;
    }

    /* Menu navigation */
    if (nc_pressed(in, NC_UP)) {
        g_sel = (g_sel - 1 + NUM_ITEMS) % NUM_ITEMS;
    }
    if (nc_pressed(in, NC_DOWN)) {
        g_sel = (g_sel + 1) % NUM_ITEMS;
    }

    /* Confirm */
    if (nc_pressed(in, NC_CONFIRM)) {
        if (g_sel == 2) { /* Quit */
            nc_log(NC_LOG_INFO, "quit selected");
            nc_quit();
        }
    }

    /* Esc / Circle also exits */
    if (nc_pressed(in, NC_BACK)) {
        nc_log(NC_LOG_INFO, "back pressed — quitting");
        nc_quit();
    }

    /* Bounce the demo box */
    g_box_x += g_box_vx * dt;
    g_box_y += g_box_vy * dt;
    if (g_box_x < 0.0f)             { g_box_x = 0.0f;             g_box_vx = -g_box_vx; }
    if (g_box_x > 1280.0f - BOX_W)  { g_box_x = 1280.0f - BOX_W; g_box_vx = -g_box_vx; }
    if (g_box_y < 0.0f)             { g_box_y = 0.0f;             g_box_vy = -g_box_vy; }
    if (g_box_y > 720.0f - BOX_H)   { g_box_y = 720.0f - BOX_H;  g_box_vy = -g_box_vy; }
}

void app_draw(void)
{
    /* 1 — ember wave background */
    nc_gfx_wave(g_t);

    /* 2 — title */
    int title_size = 48;
    const char *title = "Necrocell Hello";
    int tw = nc_gfx_text_width(title_size, title);
    nc_gfx_text((1280 - tw) / 2, 60, title_size, 0xFF8C00FF, "%s", title);

    /* 3 — three-item menu, centred */
    int menu_start_y = 260;
    int item_h       = 60;
    int item_size    = 32;
    for (int i = 0; i < NUM_ITEMS; i++) {
        int y    = menu_start_y + i * item_h;
        int sel  = (i == g_sel);
        uint32_t col = sel ? 0xFFFFFFFF : 0xCCCCCCCC;

        if (sel) {
            /* Highlight bar */
            int bw = nc_gfx_text_width(item_size, k_items[i]) + 60;
            nc_gfx_rect((1280 - bw) / 2, y - 4, bw, item_size + 8, 0xFF8C0060);
            /* Arrow */
            nc_gfx_text((1280 - bw) / 2 - 30, y, item_size, 0xFF8C00FF, ">");
        }

        int iw = nc_gfx_text_width(item_size, k_items[i]);
        nc_gfx_text((1280 - iw) / 2, y, item_size, col, "%s", k_items[i]);
    }

    /* 4 — Hint text */
    nc_gfx_text(640 - nc_gfx_text_width(18, "UP/DOWN: navigate   CONFIRM/Enter: select   ESC: quit") / 2,
                460, 18, 0xAAAAAA88,
                "UP/DOWN: navigate   CONFIRM/Enter: select   ESC: quit");

    /* 5 — Moving coloured box */
    nc_gfx_rect((int)g_box_x, (int)g_box_y, BOX_W, BOX_H, 0x00FF00FF);

    /* 6 — Colour-check strip (remove once PS3 colours are verified) */
    int sx, sy, sw, sh;
    nc_gfx_safe_rect(&sx, &sy, &sw, &sh);
    int strip_y = sy + sh - 20;
    int strip_w = sw / 4;
    nc_gfx_rect(sx,                 strip_y, strip_w, 20, 0xFF0000FF); /* red   */
    nc_gfx_rect(sx +     strip_w,   strip_y, strip_w, 20, 0x00FF00FF); /* green */
    nc_gfx_rect(sx + 2 * strip_w,   strip_y, strip_w, 20, 0x0000FFFF); /* blue  */
    nc_gfx_rect(sx + 3 * strip_w,   strip_y, strip_w, 20, 0xFFFFFF80); /* half-alpha white */

    /* 7 — FPS counter, bottom-right inside safe margin */
    nc_gfx_text(sx + sw - 100, sy + sh - 40, 22, 0xFFFFFF99,
                "%.0f fps", (double)g_fps_shown);
}

void app_shutdown(void)
{
    nc_log(NC_LOG_INFO, "hello shutdown");
}
