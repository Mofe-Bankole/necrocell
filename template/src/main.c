/*
 * src/main.c — Template main loop.
 *
 * Uses only sys.h — no platform #ifdef here.  All platform differences are
 * hidden in backends/{sdl,ps3}/.
 *
 * Loop: sys_poll_input → app_update(dt, &in) → sys_frame_begin
 *       → app_draw → sys_frame_end
 *
 * nc_quit() sets a flag read by sys_running(); app_shutdown is called once
 * after the loop exits.
 */

#include "sys.h"
#include "../include/nc/app.h"
#include "../include/nc/input.h"
#include "../include/nc/log.h"

#include <stdint.h>

#define DT_MAX 0.1f   /* cap dt to avoid spiral-of-death on stalls */

int main(void)
{
    if (sys_init("hello") != 0) {
        return 1;
    }

    if (app_init() != 0) {
        nc_log(NC_LOG_ERROR, "app_init failed");
        sys_shutdown();
        return 1;
    }

    uint64_t prev_us = sys_time_us();

    while (sys_running()) {
        uint64_t now_us = sys_time_us();
        float dt = (float)(now_us - prev_us) / 1000000.0f;
        if (dt > DT_MAX) dt = DT_MAX;
        prev_us = now_us;

        NcInput in;
        sys_poll_input(&in);

        app_update(dt, &in);

        sys_frame_begin();
        app_draw();
        sys_frame_end();
    }

    app_shutdown();
    sys_shutdown();
    return 0;
}
