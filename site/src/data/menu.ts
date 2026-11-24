import games from "./games.json";
import { slug } from "../lib/art";

/** Original line icons, 24×24 grid, stroked with currentColor. */
export const ICONS: Record<string, string> = {
  cell: "M12 2.5l8.2 4.75v9.5L12 21.5l-8.2-4.75v-9.5z M12 8.2l3.3 1.9v3.8L12 15.8l-3.3-1.9v-3.8z",
  thermo: "M10 4.5a2 2 0 014 0v8.8a4 4 0 11-4 0z M12 9v7.5",
  ark: "M3.5 4h17v4h-17z M5 8v11a1 1 0 001 1h12a1 1 0 001-1V8 M12 11v6 M9.5 14.5L12 17l2.5-2.5",
  disc: "M12 3a9 9 0 110 18 9 9 0 010-18z M12 9.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5z M17 7l-2.2 2.2",
  hourglass: "M7 3h10 M7 21h10 M8 3v3.5l4 5.5-4 5.5V21 M16 3v3.5L12 12l4 5.5V21",
  info: "M12 3a9 9 0 110 18 9 9 0 010-18z M12 11v6 M12 7.6v.4",
  spark: "M12 3v5 M12 16v5 M3 12h5 M16 12h5 M6 6l3 3 M15 15l3 3 M18 6l-3 3 M9 15l-3 3",
  flow: "M4 6h6v4H4z M14 14h6v4h-6z M7 10v4a2 2 0 002 2h5",
  code: "M8 7l-5 5 5 5 M16 7l5 5-5 5 M13.5 5l-3 14",
  term: "M3.5 5h17v14h-17z M7 10l3 2-3 2 M12 15h5",
  gauge: "M4 16a8 8 0 1116 0 M12 16l4-5 M12 16.5v.01",
  chip: "M7 7h10v10H7z M10 10h4v4h-4z M9 3v4 M15 3v4 M9 17v4 M15 17v4 M3 9h4 M3 15h4 M17 9h4 M17 15h4",
  shield: "M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6z M9 12l2 2 4-4",
  warn: "M12 4L2.8 19.5h18.4z M12 10v4.5 M12 17v.01",
  heart: "M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0112 7.3 4.3 4.3 0 0119.5 10c0 5.4-7.5 10-7.5 10z",
  people: "M9 11a3 3 0 100-6 3 3 0 000 6z M3.5 19a5.5 5.5 0 0111 0 M16 11a2.5 2.5 0 100-5 M17 14.2a4.8 4.8 0 013.5 4.8",
  doc: "M6 3h8l4 4v14H6z M14 3v4h4 M9 12h6 M9 16h6",
};

export interface Item { id: string; title: string; sub: string; icon: string }
export interface Category { id: string; label: string; icon: string; items: Item[] }

export const MENU: Category[] = [
  { id: "kit", label: "Necrocell", icon: "cell", items: [
    { id: "raise", title: "Raise the dead.", sub: "Console homebrew, made reliable by Kiro", icon: "spark" },
    { id: "pipeline", title: "Sentence to screen", sub: "From one prompt to an app on the TV", icon: "flow" },
    { id: "hood", title: "Under the hood", sub: "The real .kiro steering behind it", icon: "code" },
    { id: "start", title: "Get started", sub: "Build the template in four commands", icon: "term" },
  ]},
  { id: "vitals", label: "Vitals", icon: "thermo", items: [
    { id: "vitals-live", title: "Temperature & fan", sub: "Live readouts for an aging console", icon: "gauge" },
    { id: "vitals-how", title: "How it reads sensors", sub: "Syscall first, webMAN fallback", icon: "chip" },
  ]},
  { id: "ark", label: "Ark", icon: "ark", items: [
    { id: "ark-backup", title: "Back up your saves", sub: "Copy your own saves to your PC over Wi-Fi", icon: "shield" },
    { id: "ark-limit", title: "What Ark won't do", sub: "Its limits, stated plainly", icon: "warn" },
  ]},
  { id: "saves", label: "Worth saving", icon: "disc", items: games.map((g) => ({
    id: "game-" + slug(g.title), title: g.title, sub: `${g.year} · ${g.developer}`, icon: "disc",
  }))},
  { id: "why", label: "Why now", icon: "hourglass", items: [
    { id: "why-87m", title: "About 87 million consoles", sub: "Many still running, all getting older", icon: "chip" },
    { id: "why-store", title: "The store closes", sub: "New purchases end by July 2027", icon: "hourglass" },
    { id: "why-cell", title: "The Cell", sub: "Brilliant, and famously hard to program", icon: "cell" },
    { id: "why-us", title: "Why we care", sub: "A console bought in its final year", icon: "heart" },
  ]},
  { id: "about", label: "About", icon: "info", items: [
    { id: "team", title: "The crew", sub: "Mofe Bankole & Steven", icon: "people" },
    { id: "legal", title: "Licence & notice", sub: "MIT. Not affiliated with Sony.", icon: "doc" },
  ]},
];
