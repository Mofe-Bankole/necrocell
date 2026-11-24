/** Original UI sounds, synthesised with WebAudio (no samples). Off by default. */

let ctx: AudioContext | null = null;
let on = false;
try { on = localStorage.getItem("nc-sound") === "1"; } catch { /* storage blocked */ }

export const soundOn = () => on;
export function setSound(v: boolean) {
  on = v;
  try { localStorage.setItem("nc-sound", v ? "1" : "0"); } catch { /* ignore */ }
  if (v) blip("open");
}

function tone(freq: number, at: number, dur: number, gain: number, type: OscillatorType = "sine", to?: number) {
  const c = ctx!;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, at);
  if (to) o.frequency.exponentialRampToValueAtTime(to, at + dur);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(gain, at + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g).connect(c.destination);
  o.start(at); o.stop(at + dur + 0.02);
}

export function blip(kind: "move" | "cat" | "open" | "close" | "edge") {
  if (!on) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const t = ctx.currentTime;
    if (kind === "move") tone(1320, t, 0.05, 0.035, "sine", 1180);
    if (kind === "cat") tone(880, t, 0.08, 0.04, "triangle", 990);
    if (kind === "edge") tone(220, t, 0.06, 0.03, "sine");
    if (kind === "open") { tone(660, t, 0.12, 0.05, "sine"); tone(990, t + 0.06, 0.18, 0.045, "sine"); }
    if (kind === "close") { tone(880, t, 0.1, 0.045, "sine", 660); }
  } catch { /* audio unavailable */ }
}
