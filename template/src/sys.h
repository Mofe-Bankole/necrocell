/**
 * src/sys.h — Internal platform backend interface.
 *
 * main.c uses only these functions; all platform differences are hidden in
 * backends/{sdl,ps3}/.  App code must never include this header.
 *
 * The SDL backend implements these in:
 *   backends/sdl/sys_sdl.c     — init, time, running flag, shutdown
 *   backends/sdl/input_kbd.c   — sys_poll_input
 *   backends/sdl/gfx_sdl.c    — nc_gfx_* (not sys_*, but compiled together)
 *
 * The PS3 backend implements these in:
 *   backends/ps3/sys_ps3.c
 *   backends/ps3/input_pad.c
 *   backends/ps3/gfx_tiny3d.c
 */
#ifndef NC_SYS_H
#define NC_SYS_H

#include <stdint.h>
#include "../include/nc/input.h"

/**
 * Initialise all platform subsystems: graphics, input, audio (if any),
 * network logging. app_name is passed to nc_log_init.
 * @return 0 on success, non-zero on fatal error.
 */
int sys_init(const char *app_name);

/**
 * Begin a frame: clear the framebuffer, set blend state, project to 2D (PS3)
 * or just begin the SDL render pass.
 */
void sys_frame_begin(void);

/**
 * End a frame: flip / present the framebuffer, run sysutil callbacks (PS3).
 */
void sys_frame_end(void);

/**
 * Returns 1 if the main loop should continue.
 * Returns 0 after window close, EXIT_GAME sysutil event, or nc_quit().
 */
int sys_running(void);

/**
 * Monotonic timestamp in microseconds. Used for dt and nc_log timestamps.
 */
uint64_t sys_time_us(void);

/**
 * Poll platform events and fill *out with the current input state.
 * Computes pressed (edge), held, buttons, buttons_pressed each frame.
 */
void sys_poll_input(NcInput *out);

/**
 * Shut down all platform subsystems in reverse init order.
 * Called once by main.c after app_shutdown.
 */
void sys_shutdown(void);

#endif /* NC_SYS_H */
