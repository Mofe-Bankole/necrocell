/**
 * TV mockups: what each Necrocell app looks like on the console, drawn in the
 * same visual language as nc_gfx (ember wave, flat shapes, one sans font).
 * Logical size 640×360 (scaled from the console's 1280×720).
 */
import { padState } from "./gamepad";

export const shared = { sentence: "A speedrun timer with splits" };

const W = 640, H = 360;
const INK = "#EDE6DA", DIM = "rgba(237,230,218,.55)", AMBER = "#FF8C00", SOFT = "#ffb35c", VIOLET = "#9a5bd0";
const font = (px: number, w = 300) => `${w} ${px}px Manrope, system-ui, sans-serif`;

function wave(c: CanvasRenderingContext2D, t: number, y = 0.7, a = 1) {
  c.save(); c.globalCompositeOperation = "lighter";
  const bands: [string, number, number, number][] = [[AMBER, 0.9, 0.22, 0], [SOFT, 1.4, 0.17, 2], [VIOLET, 0.7, 0.13, 4]];
  for (const [col, f, sp, ph] of bands) {
    for (let k = 0; k < 9; k++) {
      const s = k / 8 - 0.5;
      c.beginPath();
      for (let x = 0; x <= W; x += 10) {
        const nx = x / W;
        const yy = H * y + (Math.sin(nx * f * 6.283 + t * sp + ph) + 0.5 * Math.sin(nx * f * 13 - t * sp * 1.6 + ph)) * 18
          + s * 22 * Math.sin(nx * 3.7 + t * 0.2);
        x ? c.lineTo(x, yy) : c.moveTo(x, yy);
      }
      c.strokeStyle = col; c.globalAlpha = (0.08 + (0.5 - Math.abs(s)) * 0.18) * a; c.lineWidth = 1; c.stroke();
    }
  }
  c.restore();
}

function bg(c: CanvasRenderingContext2D, tint = "#2a0f36") {
  const g = c.createRadialGradient(W * 0.2, 0, 10, W * 0.3, H * 0.2, W);
  g.addColorStop(0, tint); g.addColorStop(1, "#0b0710");
  c.fillStyle = g; c.fillRect(0, 0, W, H);
}

function text(c: CanvasRenderingContext2D, s: string, x: number, y: number, px: number, col = INK, w = 300, align: CanvasTextAlign = "left") {
  c.font = font(px, w); c.fillStyle = col; c.textAlign = align; c.textBaseline = "alphabetic"; c.fillText(s, x, y);
}

function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath(); c.roundRect(x, y, w, h, r);
}

function ring(c: CanvasRenderingContext2D, x: number, y: number, r: number, v: number, col: string) {
  c.lineCap = "round";
  c.strokeStyle = "rgba(237,230,218,.1)"; c.lineWidth = 7;
  c.beginPath(); c.arc(x, y, r, Math.PI * 0.75, Math.PI * 2.25); c.stroke();
  c.strokeStyle = col; c.shadowColor = col; c.shadowBlur = 12;
  c.beginPath(); c.arc(x, y, r, Math.PI * 0.75, Math.PI * (0.75 + 1.5 * Math.max(0, Math.min(1, v)))); c.stroke();
  c.shadowBlur = 0;
}

const heat = (v: number) => (v >= 78 ? "#ff4d3d" : v >= 72 ? "#ff9a3c" : SOFT);

const SCREENS: Record<string, (c: CanvasRenderingContext2D, t: number) => void> = {
  boot(c, t) {
    bg(c); wave(c, t, 0.62);
    const a = Math.min(1, (t % 12) / 1.5);
    c.globalAlpha = a;
    text(c, "NECROCELL", W / 2, H / 2 - 6, 34, INK, 600, "center");
    text(c, "Raise the dead.", W / 2, H / 2 + 24, 15, DIM, 300, "center");
    c.globalAlpha = 1;
  },

  pipeline(c, t) {
    bg(c); wave(c, t, 0.85, 0.6);
    const cyc = t % 11, prompt = "a fan monitor that turns red when hot";
    rr(c, 40, 40, 560, 52, 12); c.fillStyle = "rgba(0,0,0,.35)"; c.fill();
    c.strokeStyle = "rgba(255,179,92,.35)"; c.stroke();
    const shown = prompt.slice(0, Math.floor(Math.min(1, cyc / 2.4) * prompt.length));
    text(c, "› " + shown + (cyc < 2.6 && Math.floor(t * 2) % 2 ? "▍" : ""), 60, 73, 17, INK, 400);
    const steps = ["Spec written", "Built in Docker", "Packaged", "Deployed over LAN", "Running on the TV"];
    steps.forEach((s, i) => {
      const at = 3 + i * 1.3, on = cyc > at, y = 136 + i * 40;
      c.globalAlpha = on ? 1 : 0.25;
      c.beginPath(); c.arc(64, y - 6, 11, 0, 6.283); c.fillStyle = on ? AMBER : "rgba(237,230,218,.15)"; c.fill();
      if (on) { c.strokeStyle = "#1a0d05"; c.lineWidth = 2.2; c.beginPath(); c.moveTo(58, y - 6); c.lineTo(62, y - 2); c.lineTo(70, y - 11); c.stroke(); }
      text(c, s, 90, y, 17, INK, on && i === 4 ? 600 : 300);
      c.globalAlpha = 1;
    });
  },

  vitals(c, t) {
    bg(c, "#2b1206"); wave(c, t, 0.9, 0.5);
    const cpu = 64 + 9 * Math.sin(t / 5.5) + 7 * Math.max(0, Math.sin(t / 15));
    const gpu = cpu - 3, fan = Math.max(28, Math.min(100, 28 + (cpu - 58) * 3.4));
    text(c, "VITALS", 40, 50, 14, SOFT, 600);
    text(c, new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), W - 40, 50, 14, DIM, 400, "right");
    ([["CPU", cpu, "°C", (cpu - 40) / 50], ["GPU", gpu, "°C", (gpu - 40) / 50], ["FAN", fan, "%", fan / 100]] as const)
      .forEach(([l, v, u, f], i) => {
        const x = 130 + i * 190, y = 185, col = l === "FAN" ? VIOLET : heat(v);
        ring(c, x, y, 62, f, col);
        text(c, v.toFixed(0), x, y + 12, 38, INK, 200, "center");
        text(c, l + " " + u, x, y + 86, 12, DIM, 600, "center");
      });
    const msg = cpu >= 78 ? "Hot: fan at maximum. Check the vents." : cpu >= 72 ? "Warm: keep the vents clear." : "Healthy";
    text(c, msg, W / 2, H - 28, 15, heat(cpu), 400, "center");
  },

  ark(c, t) {
    bg(c); wave(c, t, 0.95, 0.4);
    text(c, "ARK", 40, 50, 14, SOFT, 600);
    text(c, "Backing up to: my-laptop.local", W - 40, 50, 13, DIM, 400, "right");
    const rows = ["Campaign save · Chapter 7", "Profile & settings", "Creative levels (12)", "Second playthrough", "Arcade high scores"];
    const cyc = (t % 10) / 1.4;
    rows.forEach((r, i) => {
      const y = 82 + i * 50, p = Math.max(0, Math.min(1, cyc - i)), skip = i === 3;
      rr(c, 40, y, 560, 40, 10); c.fillStyle = i === Math.floor(cyc) ? "rgba(255,140,0,.1)" : "rgba(255,255,255,.035)"; c.fill();
      text(c, r, 58, y + 26, 15, INK, 400);
      const st = p >= 1 ? (skip ? "Protected · skipped" : "Saved") : p > 0 ? Math.round(p * 100) + "%" : "At risk";
      text(c, st, 582, y + 26, 13, p >= 1 ? (skip ? DIM : "#8fe3a8") : p > 0 ? SOFT : "#ff8a6a", 600, "right");
      if (p > 0 && p < 1) { c.fillStyle = AMBER; c.fillRect(40, y + 38, 560 * p, 2); }
    });
  },

  grip(c, t) {
    bg(c); wave(c, t, 0.92, 0.35);
    const pad = padState();
    const live = pad.connected;
    const ax = live ? pad.axes : [Math.sin(t * 1.3) * 0.8, Math.cos(t * 1.1) * 0.6, Math.cos(t * 0.9) * 0.7, Math.sin(t * 1.7) * 0.5];
    const btn = (i: number) => (live ? pad.buttons[i] > 0.5 : Math.floor(t * 1.5) % 8 === i);
    text(c, "GRIP", 40, 50, 14, SOFT, 600);
    text(c, live ? "Controller connected" : "Demo mode · plug in a controller", W - 40, 50, 13, live ? "#8fe3a8" : DIM, 400, "right");
    // body
    rr(c, 120, 92, 400, 190, 95); c.fillStyle = "rgba(255,255,255,.04)"; c.fill(); c.strokeStyle = "rgba(237,230,218,.18)"; c.lineWidth = 1.5; c.stroke();
    // shoulders
    [[150, 4], [430, 5]].forEach(([x, i]) => { rr(c, x, 74, 60, 12, 6); c.fillStyle = btn(i) ? AMBER : "rgba(237,230,218,.15)"; c.fill(); });
    // d-pad
    const dp = [[190, 160, 12], [190, 200, 13], [170, 180, 14], [210, 180, 15]];
    dp.forEach(([x, y, i]) => { rr(c, x - 10, y - 10, 20, 20, 4); c.fillStyle = btn(i) ? AMBER : "rgba(237,230,218,.18)"; c.fill(); });
    // face buttons (our own: plain dots, no symbols)
    [[450, 158, 3], [480, 182, 1], [450, 206, 0], [420, 182, 2]].forEach(([x, y, i]) => {
      c.beginPath(); c.arc(x, y, 12, 0, 6.283); c.fillStyle = btn(i) ? SOFT : "rgba(237,230,218,.18)"; c.fill();
      if (btn(i)) { c.shadowColor = AMBER; c.shadowBlur = 16; c.fill(); c.shadowBlur = 0; }
    });
    // sticks
    [[260, 236, 0], [380, 236, 2]].forEach(([x, y, a]) => {
      c.beginPath(); c.arc(x, y, 28, 0, 6.283); c.strokeStyle = "rgba(237,230,218,.25)"; c.stroke();
      c.beginPath(); c.arc(x + ax[a] * 18, y + ax[a + 1] * 18, 11, 0, 6.283); c.fillStyle = AMBER; c.fill();
    });
    text(c, `L ${ax[0].toFixed(2)}, ${ax[1].toFixed(2)}    R ${ax[2].toFixed(2)}, ${ax[3].toFixed(2)}`, W / 2, H - 30, 13, DIM, 400, "center");
  },

  hearth(c, t) {
    const d = new Date(), h = d.getHours() + d.getMinutes() / 60;
    const night = h < 6 || h > 19;
    bg(c, night ? "#1d0b2e" : h < 10 ? "#3a1a08" : "#2b1206");
    wave(c, t, 0.72, night ? 0.7 : 1.1);
    text(c, d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), W / 2, H / 2 + 8, 92, INK, 200, "center");
    text(c, d.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" }), W / 2, H / 2 + 46, 16, DIM, 400, "center");
  },

  hello(c, t) {
    bg(c); wave(c, t, 0.75);
    text(c, "Hello, Cell", 40, 90, 40, INK, 200);
    const x = ((t * 120) % (W + 100)) - 100;
    c.fillStyle = AMBER; c.fillRect(x, 160, 100, 60);
    text(c, "60 fps · nc_gfx · 1280×720", 40, H - 28, 13, DIM, 400);
  },

  yours(c, t) {
    bg(c); wave(c, t, 0.85, 0.7);
    text(c, "YOUR APP", 40, 50, 14, SOFT, 600);
    c.font = font(26, 300);
    const words = ("“" + (shared.sentence || "…") + "”").split(" ");
    let line = "", y = 110;
    for (const w of words) {
      if (c.measureText(line + w).width > 540 && line) { text(c, line, 40, y, 26); line = ""; y += 36; }
      line += w + " ";
    }
    text(c, line, 40, y, 26);
    const cyc = t % 8;
    ["spec", "build", "deploy", "run"].forEach((s, i) => {
      const on = cyc > 1 + i, x = 40 + i * 140;
      rr(c, x, H - 70, 124, 34, 17); c.fillStyle = on ? "rgba(255,140,0,.85)" : "rgba(237,230,218,.08)"; c.fill();
      text(c, s, x + 62, H - 48, 14, on ? "#1a0d05" : DIM, 600, "center");
    });
  },
};

/** Animate every visible canvas[data-screen]. */
export function startScreens() {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const prep = new WeakSet<HTMLCanvasElement>();
  let t0 = performance.now();
  const frame = (now: number) => {
    const t = (now - t0) / 1000 + 6;
    document.querySelectorAll<HTMLCanvasElement>("canvas[data-screen]").forEach((cv) => {
      if (!cv.offsetParent || cv.closest("[hidden]")) return;
      const r = cv.getBoundingClientRect();
      if (r.width === 0) return;
      const ctx = cv.getContext("2d")!;
      if (!prep.has(cv)) {
        const dpr = Math.min(devicePixelRatio || 1, 2);
        cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); prep.add(cv);
      }
      ctx.clearRect(0, 0, W, H);
      SCREENS[cv.dataset.screen!]?.(ctx, t);
    });
    if (!still) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  if (still) setInterval(() => requestAnimationFrame(frame), 1000);
}
