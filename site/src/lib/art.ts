/** Deterministic ember artwork for game cards, seeded by title. Our own art, no game assets. */

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function rng(seed: number) {
  return () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function emberArt(title: string, w = 480, h = 270): string {
  const r = rng(hash(title));
  const id = "g" + hash(title).toString(36);
  const hue = 20 + r() * 25;                 // amber range
  const lines: string[] = [];
  const bands = 3 + Math.floor(r() * 3);
  for (let b = 0; b < bands; b++) {
    const base = h * (0.35 + r() * 0.45), amp = h * (0.05 + r() * 0.14), f = 0.6 + r() * 1.6, ph = r() * 6.28;
    const strands = 10 + Math.floor(r() * 10), spread = h * (0.04 + r() * 0.1);
    const color = b % 2 ? "#9a5bd0" : `hsl(${hue} 100% ${52 + r() * 8}%)`;
    for (let k = 0; k < strands; k++) {
      const s = k / (strands - 1) - 0.5;
      let d = "";
      for (let x = 0; x <= w; x += 12) {
        const nx = x / w;
        const y = base + Math.sin(nx * f * 6.283 + ph) * amp + s * spread * Math.sin(nx * 3.2 + ph);
        d += (x ? "L" : "M") + x + " " + y.toFixed(1);
      }
      lines.push(`<path d="${d}" stroke="${color}" stroke-opacity="${(0.12 + (0.5 - Math.abs(s)) * 0.35).toFixed(2)}" fill="none" stroke-width="1"/>`);
    }
  }
  const sparks = Array.from({ length: 14 }, () =>
    `<circle cx="${(r() * w).toFixed(0)}" cy="${(r() * h).toFixed(0)}" r="${(0.6 + r() * 1.6).toFixed(1)}" fill="#ffb35c" opacity="${(0.3 + r() * 0.6).toFixed(2)}"/>`).join("");
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
<defs><radialGradient id="${id}" cx="${(20 + r() * 60).toFixed(0)}%" cy="20%" r="90%"><stop offset="0" stop-color="#2a0f36"/><stop offset="1" stop-color="#0b0710"/></radialGradient></defs>
<rect width="${w}" height="${h}" fill="url(#${id})"/><g>${lines.join("")}</g>${sparks}</svg>`;
}
