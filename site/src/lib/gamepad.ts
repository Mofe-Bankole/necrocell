/** Gamepad API wrapper (standard mapping). Lets visitors drive the site with a real controller. */

export interface Pad { connected: boolean; axes: number[]; buttons: number[] }
const empty: Pad = { connected: false, axes: [0, 0, 0, 0], buttons: Array(17).fill(0) };

export function padState(): Pad {
  const pads = typeof navigator !== "undefined" && navigator.getGamepads ? navigator.getGamepads() : [];
  for (const p of pads) {
    if (p && p.connected) {
      return {
        connected: true,
        axes: [0, 1, 2, 3].map((i) => (Math.abs(p.axes[i] ?? 0) < 0.12 ? 0 : p.axes[i])),
        buttons: p.buttons.map((b) => b.value),
      };
    }
  }
  return empty;
}

export type PadAction = "left" | "right" | "up" | "down" | "confirm" | "back";

/** Polls for edges (and stick repeats) and calls onAction. */
export function watchPad(onAction: (a: PadAction) => void, onConnect: (on: boolean) => void) {
  let prev: Record<PadAction, boolean> = { left: false, right: false, up: false, down: false, confirm: false, back: false };
  let held: PadAction | null = null, heldAt = 0, lastRepeat = 0, running = false;

  const poll = (now: number) => {
    const p = padState();
    if (!p.connected) { running = false; return; }
    const cur: Record<PadAction, boolean> = {
      left: p.buttons[14] > 0.5 || p.axes[0] < -0.6,
      right: p.buttons[15] > 0.5 || p.axes[0] > 0.6,
      up: p.buttons[12] > 0.5 || p.axes[1] < -0.6,
      down: p.buttons[13] > 0.5 || p.axes[1] > 0.6,
      confirm: p.buttons[0] > 0.5,
      back: p.buttons[1] > 0.5,
    };
    (Object.keys(cur) as PadAction[]).forEach((k) => {
      if (cur[k] && !prev[k]) { onAction(k); held = k; heldAt = now; lastRepeat = now; }
    });
    if (held && cur[held] && ["left", "right", "up", "down"].includes(held) && now - heldAt > 420 && now - lastRepeat > 130) {
      onAction(held); lastRepeat = now;
    }
    if (held && !cur[held]) held = null;
    prev = cur;
    requestAnimationFrame(poll);
  };

  addEventListener("gamepadconnected", () => { onConnect(true); if (!running) { running = true; requestAnimationFrame(poll); } });
  addEventListener("gamepaddisconnected", () => onConnect(padState().connected));
}
