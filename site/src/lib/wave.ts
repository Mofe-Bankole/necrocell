/**
 * Ember ribbons: thin additive strands that drift like silk, plus rising embers.
 * The maths (ribbonOffset) is shared in spirit with the console nc_gfx wave:
 * a bounded sum of sines, |offset| <= 1.5 * amp.
 */

export interface Ribbon {
  rgb: [number, number, number];
  y: number;       // baseline, fraction of height
  amp: number;     // fraction of height
  freq: number;    // cycles across the width
  speed: number;
  phase: number;
  strands: number;
  spread: number;  // fraction of height between outer strands
  alpha: number;
}

export const RIBBONS: Ribbon[] = [
  { rgb: [255, 140, 0],   y: 0.62, amp: 0.07, freq: 0.9, speed: 0.22, phase: 0.0, strands: 22, spread: 0.07, alpha: 0.16 },
  { rgb: [255, 186, 92],  y: 0.66, amp: 0.05, freq: 1.3, speed: 0.17, phase: 2.1, strands: 16, spread: 0.05, alpha: 0.12 },
  { rgb: [160, 82, 210],  y: 0.58, amp: 0.09, freq: 0.7, speed: 0.13, phase: 4.2, strands: 18, spread: 0.10, alpha: 0.12 },
];

/** Vertical offset in [-1.5, 1.5] for a point on a ribbon. Pure and bounded. */
export function ribbonOffset(nx: number, t: number, r: Ribbon): number {
  return (
    Math.sin(nx * r.freq * Math.PI * 2 + t * r.speed + r.phase) +
    0.5 * Math.sin(nx * r.freq * Math.PI * 4.3 - t * r.speed * 1.6 + r.phase * 1.7)
  );
}

interface Ember { x: number; y: number; v: number; r: number; p: number }

export function startRibbons(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let w = 0, h = 0, raf = 0, running = true;
  const embers: Ember[] = [];

  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    embers.length = 0;
    const n = Math.round(Math.min(170, w / 8.5));
    for (let i = 0; i < n; i++) embers.push(spawn(true));
  };
  const spawn = (anywhere: boolean): Ember => ({
    x: Math.random() * w,
    y: anywhere ? Math.random() * h : h + 10,
    v: 8 + Math.random() * 22,
    r: 0.6 + Math.random() * 1.6,
    p: Math.random() * Math.PI * 2,
  });

  const draw = (t: number) => {
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    const step = Math.max(6, w / 180);
    for (const r of RIBBONS) {
      for (let k = 0; k < r.strands; k++) {
        const s = k / (r.strands - 1) - 0.5;            // -0.5..0.5
        const twist = Math.sin(t * 0.25 + k * 0.35 + r.phase);
        ctx.beginPath();
        for (let x = -step; x <= w + step; x += step) {
          const nx = x / w;
          const y = h * r.y
            + ribbonOffset(nx, t, r) * r.amp * h
            + s * r.spread * h * Math.sin(nx * Math.PI * 1.2 + t * 0.18 + twist * 0.6);
          x < 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        const edge = 1 - Math.abs(s) * 1.4;
        ctx.strokeStyle = `rgba(${r.rgb[0]},${r.rgb[1]},${r.rgb[2]},${(r.alpha * (0.4 + edge)).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    for (const e of embers) {
      const flick = 0.5 + 0.5 * Math.sin(t * 3 + e.p);
      ctx.fillStyle = `rgba(255,${150 + Math.round(60 * flick)},60,${(0.25 + 0.5 * flick) * Math.min(1, e.y / h + 0.2)})`;
      ctx.beginPath(); ctx.arc(e.x + Math.sin(t * 0.6 + e.p) * 12, e.y, e.r, 0, Math.PI * 2); ctx.fill();
    }
  };

  let last = performance.now(), t = 12;
  const loop = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
    for (let i = 0; i < embers.length; i++) {
      embers[i].y -= embers[i].v * dt;
      if (embers[i].y < -10) embers[i] = spawn(false);
    }
    draw(t);
    if (running) raf = requestAnimationFrame(loop);
  };

  resize();
  addEventListener("resize", resize);
  if (still) { draw(t); return () => removeEventListener("resize", resize); }
  const vis = () => {
    running = !document.hidden;
    if (running) { last = performance.now(); raf = requestAnimationFrame(loop); } else cancelAnimationFrame(raf);
  };
  document.addEventListener("visibilitychange", vis);
  raf = requestAnimationFrame(loop);
  return () => { running = false; cancelAnimationFrame(raf); removeEventListener("resize", resize); document.removeEventListener("visibilitychange", vis); };
}
