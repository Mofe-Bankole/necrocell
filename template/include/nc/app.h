/**
 * nc/app.h — App lifecycle hooks.
 *
 * Implement these four functions in your app. main.c calls them in order.
 * Never call app_shutdown() yourself — main.c does it exactly once on exit.
 */
#ifndef NC_APP_H
#define NC_APP_H

#include <stdint.h>
#include "input.h"

/**
 * Called once at startup before the main loop begins.
 * @return 0 on success, non-zero to abort launch.
 */
int  app_init(void);

/**
 * Called every frame before drawing.
 * @param dt  Seconds elapsed since the previous frame (capped at 0.1 to avoid
 *            spiral-of-death on stalls).
 * @param in  Snapshot of this frame's input state.
 */
void app_update(float dt, const NcInput *in);

/**
 * Called every frame after app_update. Issue nc_gfx_* calls here.
 */
void app_draw(void);

/**
 * Called exactly once after the main loop exits.
 * Free any resources allocated in app_init.
 */
void app_shutdown(void);

/**
 * Request the main loop to stop after the current frame.
 * Causes main.c to call app_shutdown and exit cleanly.
 * Never call app_shutdown yourself.
 */
void nc_quit(void);

/**
 * Wall-clock seconds since 1970-01-01 00:00 UTC.
 * On PS3: sysGetCurrentTime (UTC, timezone offset unverified — treat as UTC).
 * On SDL: time() from <time.h>.
 */
uint64_t nc_time_unix(void);

#endif /* NC_APP_H */
