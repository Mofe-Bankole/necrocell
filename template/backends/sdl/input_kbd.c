/*
 * backends/sdl/input_kbd.c — Keyboard + game-controller input for SDL2.
 *
 * Maps keyboard keys and SDL game-controller buttons to NcAction and NC_BTN_*.
 *
 * SDL key → NcAction:
 *   Up/Down/Left/Right → NC_UP/DOWN/LEFT/RIGHT
 *   Return/KP_Enter   → NC_CONFIRM
 *   Escape            → NC_BACK
 *   Tab               → NC_MENU
 *
 * SDL key → NC_BTN_* raw bits:
 *   Arrows → UP/DOWN/LEFT/RIGHT
 *   Return → CROSS, Escape → CIRCLE, Backspace → SQUARE, Space → TRIANGLE
 *   Q → L1, E → R1, Tab → START, LShift/RShift → SELECT
 *   WASD → left-stick (held keys set lx/ly), IJKL → right-stick
 *
 * SDL_QUIT event sets the global running flag to 0 (window close).
 */

#include "../../src/sys.h"
#include "../../include/nc/input.h"

#include <SDL2/SDL.h>
#include <string.h>
#include <stdint.h>

/* declared in sys_sdl.c */
void sys_set_quit(void);

/* Map an SDL_Keycode to its NC_BTN_* bitmask. 0 if not mapped. */
static uint32_t key_to_btn(SDL_Keycode k)
{
    switch (k) {
    case SDLK_UP:        return NC_BTN_UP;
    case SDLK_DOWN:      return NC_BTN_DOWN;
    case SDLK_LEFT:      return NC_BTN_LEFT;
    case SDLK_RIGHT:     return NC_BTN_RIGHT;
    case SDLK_RETURN:    return NC_BTN_CROSS;
    case SDLK_KP_ENTER:  return NC_BTN_CROSS;
    case SDLK_ESCAPE:    return NC_BTN_CIRCLE;
    case SDLK_BACKSPACE: return NC_BTN_SQUARE;
    case SDLK_SPACE:     return NC_BTN_TRIANGLE;
    case SDLK_q:         return NC_BTN_L1;
    case SDLK_e:         return NC_BTN_R1;
    case SDLK_TAB:       return NC_BTN_START;
    case SDLK_LSHIFT:    return NC_BTN_SELECT;
    case SDLK_RSHIFT:    return NC_BTN_SELECT;
    default:             return 0;
    }
}

/* Map SDL_GameControllerButton to NC_BTN_* bitmask. */
static uint32_t gbtn_to_nc(SDL_GameControllerButton b)
{
    switch (b) {
    case SDL_CONTROLLER_BUTTON_DPAD_UP:    return NC_BTN_UP;
    case SDL_CONTROLLER_BUTTON_DPAD_DOWN:  return NC_BTN_DOWN;
    case SDL_CONTROLLER_BUTTON_DPAD_LEFT:  return NC_BTN_LEFT;
    case SDL_CONTROLLER_BUTTON_DPAD_RIGHT: return NC_BTN_RIGHT;
    case SDL_CONTROLLER_BUTTON_A:          return NC_BTN_CROSS;
    case SDL_CONTROLLER_BUTTON_B:          return NC_BTN_CIRCLE;
    case SDL_CONTROLLER_BUTTON_X:          return NC_BTN_SQUARE;
    case SDL_CONTROLLER_BUTTON_Y:          return NC_BTN_TRIANGLE;
    case SDL_CONTROLLER_BUTTON_LEFTSHOULDER:  return NC_BTN_L1;
    case SDL_CONTROLLER_BUTTON_RIGHTSHOULDER: return NC_BTN_R1;
    case SDL_CONTROLLER_BUTTON_LEFTSTICK:  return NC_BTN_L3;
    case SDL_CONTROLLER_BUTTON_RIGHTSTICK: return NC_BTN_R3;
    case SDL_CONTROLLER_BUTTON_START:      return NC_BTN_START;
    case SDL_CONTROLLER_BUTTON_BACK:       return NC_BTN_SELECT;
    default:                               return 0;
    }
}

#define DEADZONE 0.12f

static float clamp_stick(int raw)
{
    float v = (raw - 32768) / 32767.0f;
    if (v > -DEADZONE && v < DEADZONE) v = 0.0f;
    if (v < -1.0f) v = -1.0f;
    if (v >  1.0f) v =  1.0f;
    return v;
}

/* Previous frame's held buttons for edge detection. */
static uint32_t g_prev_buttons = 0;
/* Raw key-held state for WASD/IJKL sticks. */
static Uint8 g_keys_snapshot[SDL_NUM_SCANCODES];

static SDL_GameController *g_controller = NULL;

static void open_controller(void)
{
    if (g_controller) return;
    int n = SDL_NumJoysticks();
    for (int i = 0; i < n; i++) {
        if (SDL_IsGameController(i)) {
            g_controller = SDL_GameControllerOpen(i);
            break;
        }
    }
}

void sys_poll_input(NcInput *out)
{
    memset(out, 0, sizeof(*out));

    uint32_t buttons_now = 0;

    /* Poll SDL events */
    SDL_Event ev;
    while (SDL_PollEvent(&ev)) {
        switch (ev.type) {
        case SDL_QUIT:
            sys_set_quit();
            break;
        case SDL_CONTROLLERDEVICEADDED:
            open_controller();
            break;
        case SDL_CONTROLLERDEVICEREMOVED:
            if (g_controller &&
                SDL_GameControllerFromInstanceID(ev.cdevice.which) == g_controller) {
                SDL_GameControllerClose(g_controller);
                g_controller = NULL;
            }
            break;
        default:
            break;
        }
    }

    /* Keyboard state snapshot */
    int nkeys = 0;
    const Uint8 *ks = SDL_GetKeyboardState(&nkeys);
    if (nkeys > SDL_NUM_SCANCODES) nkeys = SDL_NUM_SCANCODES;
    for (int i = 0; i < nkeys; i++) g_keys_snapshot[i] = ks[i];

    /* Raw buttons from keyboard */
    struct { SDL_Scancode sc; uint32_t btn; } kmap[] = {
        { SDL_SCANCODE_UP,        NC_BTN_UP       },
        { SDL_SCANCODE_DOWN,      NC_BTN_DOWN      },
        { SDL_SCANCODE_LEFT,      NC_BTN_LEFT      },
        { SDL_SCANCODE_RIGHT,     NC_BTN_RIGHT     },
        { SDL_SCANCODE_RETURN,    NC_BTN_CROSS     },
        { SDL_SCANCODE_KP_ENTER,  NC_BTN_CROSS     },
        { SDL_SCANCODE_ESCAPE,    NC_BTN_CIRCLE    },
        { SDL_SCANCODE_BACKSPACE, NC_BTN_SQUARE    },
        { SDL_SCANCODE_SPACE,     NC_BTN_TRIANGLE  },
        { SDL_SCANCODE_Q,         NC_BTN_L1        },
        { SDL_SCANCODE_E,         NC_BTN_R1        },
        { SDL_SCANCODE_TAB,       NC_BTN_START     },
        { SDL_SCANCODE_LSHIFT,    NC_BTN_SELECT    },
        { SDL_SCANCODE_RSHIFT,    NC_BTN_SELECT    },
    };
    for (int i = 0; i < (int)(sizeof kmap / sizeof kmap[0]); i++) {
        if (g_keys_snapshot[kmap[i].sc]) buttons_now |= kmap[i].btn;
    }

    /* WASD → left stick */
    if (g_keys_snapshot[SDL_SCANCODE_A]) out->lx = -1.0f;
    if (g_keys_snapshot[SDL_SCANCODE_D]) out->lx =  1.0f;
    if (g_keys_snapshot[SDL_SCANCODE_W]) out->ly = -1.0f;
    if (g_keys_snapshot[SDL_SCANCODE_S]) out->ly =  1.0f;
    /* IJKL → right stick */
    if (g_keys_snapshot[SDL_SCANCODE_J]) out->rx = -1.0f;
    if (g_keys_snapshot[SDL_SCANCODE_L]) out->rx =  1.0f;
    if (g_keys_snapshot[SDL_SCANCODE_I]) out->ry = -1.0f;
    if (g_keys_snapshot[SDL_SCANCODE_K]) out->ry =  1.0f;

    /* Game controller */
    if (!g_controller) open_controller();
    if (g_controller) {
        out->connected = 1;
        for (int b = 0; b < SDL_CONTROLLER_BUTTON_MAX; b++) {
            if (SDL_GameControllerGetButton(g_controller, (SDL_GameControllerButton)b)) {
                buttons_now |= gbtn_to_nc((SDL_GameControllerButton)b);
            }
        }
        /* Sticks — controller overrides keyboard if non-zero. */
        float lx = clamp_stick(SDL_GameControllerGetAxis(g_controller, SDL_CONTROLLER_AXIS_LEFTX));
        float ly = clamp_stick(SDL_GameControllerGetAxis(g_controller, SDL_CONTROLLER_AXIS_LEFTY));
        float rx = clamp_stick(SDL_GameControllerGetAxis(g_controller, SDL_CONTROLLER_AXIS_RIGHTX));
        float ry = clamp_stick(SDL_GameControllerGetAxis(g_controller, SDL_CONTROLLER_AXIS_RIGHTY));
        if (lx != 0.0f) out->lx = lx;
        if (ly != 0.0f) out->ly = ly;
        if (rx != 0.0f) out->rx = rx;
        if (ry != 0.0f) out->ry = ry;
    }

    /* Fill raw buttons and edge-detect. */
    out->buttons          = buttons_now;
    out->buttons_pressed  = buttons_now & ~g_prev_buttons;
    g_prev_buttons        = buttons_now;

    /* Derive NcAction held / pressed from buttons_now. */
    static const struct { NcAction action; uint32_t btn; } amap[] = {
        { NC_UP,      NC_BTN_UP    },
        { NC_DOWN,    NC_BTN_DOWN  },
        { NC_LEFT,    NC_BTN_LEFT  },
        { NC_RIGHT,   NC_BTN_RIGHT },
        { NC_CONFIRM, NC_BTN_CROSS },
        { NC_BACK,    NC_BTN_CIRCLE},
        { NC_MENU,    NC_BTN_START },
    };
    for (int i = 0; i < (int)(sizeof amap / sizeof amap[0]); i++) {
        int held = (buttons_now & amap[i].btn) != 0;
        int prev = (g_prev_buttons & amap[i].btn) != 0;
        /* Note: g_prev_buttons was already updated above. Recalculate using
           the saved value from before the update. */
        (void)prev; /* suppress: edge is in buttons_pressed */
        out->held[amap[i].action]    = held;
        out->pressed[amap[i].action] = (out->buttons_pressed & amap[i].btn) != 0;
    }
    /* Also handle the keyboard-mapped NC_BACK (Escape) for the action edge. */
    (void)key_to_btn; /* suppress unused warning */
}
