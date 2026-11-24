import { startRibbons } from "../lib/wave";

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s)!;
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];

export function initDashboard() {
  const canvas = $<HTMLCanvasElement>("#ribbons");
  startRibbons(canvas);
  document.body.classList.add("js");

  const cats = $$(".cat");
  const row = $(".row");
  const sheet = $(".sheet");
  const body = $(".sheet-body");
  const panels = new Map($$("[data-panel]", sheet).map((p) => [p.dataset.panel!, p]));
  const items = (ci: number) => $$<HTMLButtonElement>(".item", cats[ci]);
  const sel = cats.map(() => 0);
  let c = 0;
  let open: string | null = null;
  let stopDemo: (() => void) | null = null;

  // Clock
  const clock = $("[data-clock]");
  const tick = () => {
    const d = new Date();
    clock.textContent = d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }) +
      "  " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  };
  tick(); setInterval(tick, 15000);

  const small = matchMedia("(max-width: 640px)");
  function layout(focus = false) {
    const H = small.matches ? 58 : 66;
    const first = small.matches ? 92 : 118;
    const gap = small.matches ? 16 : 22;
    row.style.setProperty("--c", String(c));
    cats.forEach((cat, ci) => {
      const active = ci === c;
      cat.classList.toggle("active", active);
      $(".cat-btn", cat).setAttribute("aria-current", active ? "true" : "false");
      ($(".items", cat) as HTMLElement & { inert: boolean }).inert = !active;
      const s = sel[ci];
      items(ci).forEach((it, j) => {
        const y = j < s ? -(s - j) * H - 14 : j === s ? first : first + H + gap + (j - s - 1) * H;
        it.parentElement!.style.transform = `translateY(${y}px)`;
        it.classList.toggle("sel", j === s);
        it.classList.toggle("past", j < s);
        it.tabIndex = active && j === s ? 0 : -1;
      });
    });
    if (focus) items(c)[sel[c]]?.focus({ preventScroll: true });
  }

  function move(dc: number, di: number) {
    if (dc) c = Math.max(0, Math.min(cats.length - 1, c + dc));
    if (di) sel[c] = Math.max(0, Math.min(items(c).length - 1, sel[c] + di));
    layout(true);
  }

  function openPanel(id: string) {
    const p = panels.get(id);
    if (!p) return;
    panels.forEach((el) => (el.hidden = el !== p));
    open = id;
    document.body.classList.add("open");
    body.scrollTop = 0;
    history.replaceState(null, "", "#" + id);
    stopDemo?.(); stopDemo = null;
    if (p.querySelector("[data-vitals]")) stopDemo = vitalsDemo(p);
    if (p.querySelector("[data-ark]")) arkDemo(p);
    requestAnimationFrame(() => body.focus({ preventScroll: true }));
  }

  function closePanel() {
    if (!open) return;
    open = null;
    stopDemo?.(); stopDemo = null;
    document.body.classList.remove("open");
    history.replaceState(null, "", location.pathname);
    layout(true);
  }

  // Pointer
  cats.forEach((cat, ci) => {
    $(".cat-btn", cat).addEventListener("click", () => { c = ci; layout(true); });
    items(ci).forEach((it, j) => it.addEventListener("click", () => {
      if (c === ci && sel[ci] === j) openPanel(it.dataset.item!);
      else { c = ci; sel[ci] = j; layout(true); }
    }));
  });
  $("[data-close]").addEventListener("click", closePanel);

  // Keyboard
  document.addEventListener("keydown", (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (open) {
      if (e.key === "Escape" || (e.key === "Backspace" && !(e.target as HTMLElement).matches("input,textarea"))) { e.preventDefault(); closePanel(); }
      return;
    }
    const k: Record<string, () => void> = {
      ArrowLeft: () => move(-1, 0), ArrowRight: () => move(1, 0),
      ArrowUp: () => move(0, -1), ArrowDown: () => move(0, 1),
      Enter: () => openPanel(items(c)[sel[c]].dataset.item!),
    };
    if (k[e.key]) { e.preventDefault(); k[e.key](); }
  });

  // Wheel and touch
  let wheelAt = 0;
  addEventListener("wheel", (e) => {
    if (open) return;
    const now = performance.now();
    if (now - wheelAt < 220) return;
    const horiz = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    const d = horiz ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 8) return;
    wheelAt = now;
    horiz || e.shiftKey ? move(Math.sign(d), 0) : move(0, Math.sign(d));
  }, { passive: true });

  let tx = 0, ty = 0;
  addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  addEventListener("touchend", (e) => {
    if (open) return;
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 40) return;
    Math.abs(dx) > Math.abs(dy) ? move(dx < 0 ? 1 : -1, 0) : move(0, dy < 0 ? 1 : -1);
  }, { passive: true });

  small.addEventListener("change", () => layout());

  // Deep link
  const hash = decodeURIComponent(location.hash.slice(1));
  if (hash && panels.has(hash)) {
    cats.forEach((_, ci) => items(ci).forEach((it, j) => { if (it.dataset.item === hash) { c = ci; sel[ci] = j; } }));
    layout();
    openPanel(hash);
  } else layout(true);
  requestAnimationFrame(() => document.body.classList.add("ready"));
}

/** Simulated Vitals readings: a slow heat cycle that crosses the warning line, so every state is visible. */
function vitalsDemo(p: HTMLElement): () => void {
  const cv = p.querySelector<HTMLCanvasElement>("canvas")!;
  const ctx = cv.getContext("2d")!;
  const box = p.querySelector<HTMLElement>("[data-vitals]")!;
  const v = (k: string) => p.querySelector<HTMLElement>(`[data-v="${k}"]`)!;
  const hist: [number, number][] = [];
  let t = 0;
  const step = () => {
    t += 1;
    const cpu = 64 + 9 * Math.sin(t / 22) + 7 * Math.max(0, Math.sin(t / 61)) + (Math.random() - 0.5) * 1.4;
    const gpu = cpu - 3 + (Math.random() - 0.5) * 1.2;
    const fan = Math.round(Math.max(28, Math.min(100, 28 + (cpu - 58) * 3.4)));
    hist.push([cpu, gpu]); if (hist.length > 120) hist.shift();
    v("cpu").textContent = cpu.toFixed(0); v("gpu").textContent = gpu.toFixed(0); v("fan").textContent = String(fan);
    const level = cpu >= 78 ? "hot" : cpu >= 72 ? "warm" : "ok";
    box.dataset.level = level;
    v("status").textContent = level === "hot" ? "Hot: fan at maximum. Check the vents and thermal paste."
      : level === "warm" ? "Warm: keep the vents clear." : "Healthy.";
    const W = cv.width, H = cv.height, y = (x: number) => H - ((x - 45) / 45) * H;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(255,80,60,.5)"; ctx.setLineDash([4, 6]);
    ctx.beginPath(); ctx.moveTo(0, y(78)); ctx.lineTo(W, y(78)); ctx.stroke(); ctx.setLineDash([]);
    ([[0, "#FF8C00"], [1, "#a066d6"]] as const).forEach(([i, col]) => {
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath();
      hist.forEach((h, n) => { const x = (n / 119) * W; n ? ctx.lineTo(x, y(h[i])) : ctx.moveTo(x, y(h[i])); });
      ctx.stroke();
    });
  };
  for (let i = 0; i < 60; i++) step();
  const id = setInterval(step, 250);
  return () => clearInterval(id);
}

/** Simulated Ark backup: rows go from "At risk" to "Saved"; one protected save is skipped honestly. */
function arkDemo(p: HTMLElement) {
  const btn = p.querySelector<HTMLButtonElement>("[data-ark-go]")!;
  if (btn.dataset.bound) return;
  btn.dataset.bound = "1";
  btn.addEventListener("click", async () => {
    btn.disabled = true; btn.textContent = "Backing up…";
    const rows = [...p.querySelectorAll<HTMLElement>("[data-ark-row]")];
    for (const [i, r] of rows.entries()) {
      r.classList.add("going");
      await new Promise((res) => setTimeout(res, 700));
      r.classList.remove("going");
      const protectedSave = i === 3;
      r.classList.add(protectedSave ? "skipped" : "saved");
      r.querySelector(".st")!.textContent = protectedSave ? "Copy-protected · skipped" : "Saved";
    }
    btn.textContent = "Done · 4 of 5 saved";
  });
}
