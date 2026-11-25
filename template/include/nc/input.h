/**
 * nc/input.h — Controller / keyboard input abstraction.
 *
 * NcAction is the logical button set. NC_BTN_* is the raw bitmask for apps
 * that need every physical button (e.g. a button-remapper or a full game).
 *
 * Sticks: -1.0 … +1.0, deadzone 0.12 already applied.
 * No #ifdef in this header — backend differences stay in backends/.
 */
#ifndef NC_INPUT_H
#define NC_INPUT_H

#include <stdint.h>

/** High-level logical actions shared by all backends. */
typedef enum {
    NC_UP    = 0,  /**< D-pad up / left-stick up / keyboard up-arrow  */
    NC_DOWN  = 1,  /**< D-pad down / left-stick down / keyboard down-arrow */
    NC_LEFT  = 2,  /**< D-pad left / keyboard left-arrow */
    NC_RIGHT = 3,  /**< D-pad right / keyboard right-arrow */
    NC_CONFIRM = 4,/**< Cross (PS3) / Enter (kbd) */
    NC_BACK  = 5,  /**< Circle (PS3) / Escape (kbd) */
    NC_MENU  = 6,  /**< Start (PS3) / Tab (kbd) */
    NC_ACTION_COUNT
} NcAction;

/** Raw button bitmask (NC_BTN_*). */
enum {
    NC_BTN_UP       = 1 << 0,
    NC_BTN_DOWN     = 1 << 1,
    NC_BTN_LEFT     = 1 << 2,
    NC_BTN_RIGHT    = 1 << 3,
    NC_BTN_CROSS    = 1 << 4,  /**< X button  */
    NC_BTN_CIRCLE   = 1 << 5,
    NC_BTN_SQUARE   = 1 << 6,
    NC_BTN_TRIANGLE = 1 << 7,
    NC_BTN_L1       = 1 << 8,
    NC_BTN_R1       = 1 << 9,
    NC_BTN_L2       = 1 << 10,
    NC_BTN_R2       = 1 << 11,
    NC_BTN_L3       = 1 << 12,
    NC_BTN_R3       = 1 << 13,
    NC_BTN_START    = 1 << 14,
    NC_BTN_SELECT   = 1 << 15
};

/** Per-frame input snapshot. Filled by sys_poll_input each frame. */
typedef struct {
    uint8_t  pressed[NC_ACTION_COUNT]; /**< Edge: true for exactly one frame on press. */
    uint8_t  held[NC_ACTION_COUNT];    /**< True while the action is held down. */
    uint32_t buttons;                  /**< Raw NC_BTN_* bits currently held. */
    uint32_t buttons_pressed;          /**< Raw NC_BTN_* bits that went down this frame. */
    float    lx;  /**< Left-stick X, -1 (left) … +1 (right). */
    float    ly;  /**< Left-stick Y, -1 (up) … +1 (down). */
    float    rx;  /**< Right-stick X. */
    float    ry;  /**< Right-stick Y. */
    int      connected; /**< 0 if no controller is detected (PS3 only). */
} NcInput;

/**
 * Returns 1 if the action was just pressed this frame (edge detect).
 * Equivalent to in->pressed[action] but more readable in app code.
 */
static inline int nc_pressed(const NcInput *in, NcAction action) {
    return in->pressed[(int)action];
}

/** Returns 1 while the action is being held down. */
static inline int nc_held(const NcInput *in, NcAction action) {
    return in->held[(int)action];
}

/** Returns 1 if the raw button went down this frame. */
static inline int nc_btn_pressed(const NcInput *in, int btn_mask) {
    return (in->buttons_pressed & (uint32_t)btn_mask) != 0;
}

/** Returns 1 if the raw button is currently held. */
static inline int nc_btn_held(const NcInput *in, int btn_mask) {
    return (in->buttons & (uint32_t)btn_mask) != 0;
}

#endif /* NC_INPUT_H */
