/*
 * backends/sdl/sys_sdl.c — SDL2 platform backend.
 *
 * Implements the sys_* interface from src/sys.h.
 * Window: 1280×720, no scaling (the logical space matches the window size).
 */

#include "../../src/sys.h"
#include "../../include/nc/log.h"

#include <SDL2/SDL.h>
#include <SDL2/SDL_ttf.h>
#include <stdio.h>
#include <time.h>
#include <stdint.h>

/* ---- globals shared with other SDL backend files ----------------------- */

SDL_Renderer *g_renderer = NULL;
SDL_Window   *g_window   = NULL;

static int      g_running   = 0;
static int      g_quit_req  = 0;   /* nc_quit() sets this */
static uint64_t g_perf_freq = 1;
static uint64_t g_perf_base = 0;

/* nc_quit() sets the flag; sys_running() reads it. */
void nc_quit(void)
{
    g_quit_req = 1;
}

/* nc_time_unix: wall clock, seconds since 1970. */
uint64_t nc_time_unix(void)
{
    return (uint64_t)time(NULL);
}

/* ---- sys_* interface ---------------------------------------------------- */

int sys_init(const char *app_name)
{
    if (SDL_Init(SDL_INIT_VIDEO | SDL_INIT_EVENTS | SDL_INIT_GAMECONTROLLER) != 0) {
        fprintf(stderr, "SDL_Init: %s\n", SDL_GetError());
        return -1;
    }

    if (TTF_Init() != 0) {
        fprintf(stderr, "TTF_Init: %s\n", TTF_GetError());
        SDL_Quit();
        return -1;
    }

    g_window = SDL_CreateWindow(
        "Necrocell",
        SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED,
        1280, 720,
        SDL_WINDOW_SHOWN
    );
    if (!g_window) {
        fprintf(stderr, "SDL_CreateWindow: %s\n", SDL_GetError());
        TTF_Quit();
        SDL_Quit();
        return -1;
    }

    g_renderer = SDL_CreateRenderer(g_window, -1,
        SDL_RENDERER_ACCELERATED | SDL_RENDERER_PRESENTVSYNC);
    if (!g_renderer) {
        /* fall back to software */
        g_renderer = SDL_CreateRenderer(g_window, -1, SDL_RENDERER_SOFTWARE);
    }
    if (!g_renderer) {
        fprintf(stderr, "SDL_CreateRenderer: %s\n", SDL_GetError());
        SDL_DestroyWindow(g_window);
        TTF_Quit();
        SDL_Quit();
        return -1;
    }

    SDL_SetRenderDrawBlendMode(g_renderer, SDL_BLENDMODE_BLEND);

    g_perf_freq = SDL_GetPerformanceFrequency();
    g_perf_base = SDL_GetPerformanceCounter();
    g_running   = 1;
    g_quit_req  = 0;

    /* Initialise logging — no UDP host by default on the SDL build. */
    nc_log_init(NULL, 0, app_name ? app_name : "sdl");

    return 0;
}

void sys_frame_begin(void)
{
    /* gfx_sdl.c's nc_gfx_clear does the actual SDL clear; nothing extra here. */
}

void sys_frame_end(void)
{
    SDL_RenderPresent(g_renderer);
}

int sys_running(void)
{
    return g_running && !g_quit_req;
}

uint64_t sys_time_us(void)
{
    uint64_t now = SDL_GetPerformanceCounter();
    return (uint64_t)(((now - g_perf_base) * 1000000ULL) / g_perf_freq);
}

void sys_shutdown(void)
{
    nc_log_shutdown();
    if (g_renderer) { SDL_DestroyRenderer(g_renderer); g_renderer = NULL; }
    if (g_window)   { SDL_DestroyWindow(g_window);     g_window   = NULL; }
    TTF_Quit();
    SDL_Quit();
}

/* ---- window-close event (polled by input_kbd.c) ------------------------- */

/* Called from input_kbd.c when SDL_QUIT is received. */
void sys_set_quit(void)
{
    g_running = 0;
}
