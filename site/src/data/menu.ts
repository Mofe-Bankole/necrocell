import games from "./games.json";
import { slug } from "../lib/art";
import { coverFor, backdropFor } from "./covers";

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
  apps: "M4 4h6.5v6.5H4z M13.5 4H20v6.5h-6.5z M4 13.5h6.5V20H4z M16.75 13.5v6.5 M13.5 16.75H20",
  pad: "M7 8h10a4.5 4.5 0 014.3 5.8l-1.2 3.9a2 2 0 01-3.5.6L14.8 16H9.2l-1.8 2.3a2 2 0 01-3.5-.6l-1.2-3.9A4.5 4.5 0 017 8z M7.5 11v3 M6 12.5h3 M15.5 11.5v.01 M17.5 13.5v.01",
  flame: "M12 21a6 6 0 006-6c0-3.5-2.5-5.5-3.5-8.5-1 2-2 3-3.5 3.5C11 7 10 5 8.5 3.5 8 7 6 9.5 6 15a6 6 0 006 6z M12 21a2.5 2.5 0 002.5-2.5c0-1.6-1.2-2.4-2.5-4-1.3 1.6-2.5 2.4-2.5 4A2.5 2.5 0 0012 21z",
  sound: "M4 9.5h3.5L12 6v12l-4.5-3.5H4z M15.5 9a4 4 0 010 6 M18 6.5a7.5 7.5 0 010 11",
  mute: "M4 9.5h3.5L12 6v12l-4.5-3.5H4z M16 9.5l5 5 M21 9.5l-5 5",
};

export type Preview =
  | { kind: "screen"; app: string; caption: string }
  | { kind: "cover" }
  | { kind: "stat"; big: string; small: string }
  | { kind: "code"; lang: string; text: string };

export interface Item {
  id: string; title: string; sub: string; icon: string;
  cover?: string; backdrop?: string; status?: "building" | "next" | "sample" | "you"; preview?: Preview;
}
export interface Category { id: string; label: string; icon: string; items: Item[] }

export const STATUS_LABEL = { building: "Building", next: "Next up", sample: "Template sample", you: "Your turn" } as const;

export const MENU: Category[] = [
  { id: "kit", label: "Necrocell", icon: "cell", items: [
    { id: "raise", title: "Raise the dead.", sub: "Console homebrew, made reliable by Kiro", icon: "spark",
      preview: { kind: "screen", app: "boot", caption: "Every Necrocell app opens on the ember wave" } },
    { id: "pipeline", title: "Sentence to screen", sub: "From one prompt to an app on the TV", icon: "flow",
      preview: { kind: "screen", app: "pipeline", caption: "One sentence in, a running app out" } },
    { id: "hood", title: "Under the hood", sub: "The real .kiro steering behind it", icon: "code",
      preview: { kind: "code", lang: ".kiro/steering/ps3-platform.md", text: "- Grep the headers. Never invent an API.\n- Data on the wire is big-endian.\n- Draw only through nc_gfx.\n- Never block the main loop.\n- Exit cleanly, every time.\n- Test order: SDL → RPCS3 → console." } },
    { id: "start", title: "Get started", sub: "Build the template in four commands", icon: "term",
      preview: { kind: "code", lang: "terminal", text: "$ git clone …/necrocell\n$ docker run … hldtux/ps3dev make\n$ make -f Makefile.sdl run\n$ rpcs3 --no-gui hello.self" } },
  ]},
  { id: "apps", label: "Apps", icon: "apps", items: [
    { id: "app-vitals", title: "Vitals", sub: "Temperatures and fan health, before it's too late", icon: "thermo", status: "building",
      preview: { kind: "screen", app: "vitals", caption: "Vitals on the TV · mockup" } },
    { id: "app-ark", title: "Ark", sub: "Back up your own saves to your PC over Wi-Fi", icon: "ark", status: "building",
      preview: { kind: "screen", app: "ark", caption: "Ark on the TV · mockup" } },
    { id: "app-grip", title: "Grip", sub: "Test every button and stick, live", icon: "pad", status: "next",
      preview: { kind: "screen", app: "grip", caption: "Grip on the TV · mockup" } },
    { id: "app-hearth", title: "Hearth", sub: "A clock for the TV that glows with the time of day", icon: "flame", status: "next",
      preview: { kind: "screen", app: "hearth", caption: "Hearth on the TV · mockup" } },
    { id: "app-hello", title: "Hello, Cell", sub: "The smallest Necrocell app: 30 lines of C", icon: "code", status: "sample",
      preview: { kind: "screen", app: "hello", caption: "The hello sample · mockup" } },
    { id: "app-yours", title: "Raise your own", sub: "Describe an app in one sentence", icon: "spark", status: "you",
      preview: { kind: "screen", app: "yours", caption: "Your idea, on the TV" } },
  ]},
  { id: "saves", label: "Worth saving", icon: "disc", items: games.map((g) => ({
    id: "game-" + slug(g.title), title: g.title, sub: `${g.year} · ${g.developer}`, icon: "disc",
    cover: coverFor(g.title), backdrop: backdropFor(g.title), preview: { kind: "cover" as const },
  }))},
  { id: "why", label: "Why now", icon: "hourglass", items: [
    { id: "why-87m", title: "About 87 million consoles", sub: "Many still running, all getting older", icon: "chip",
      preview: { kind: "stat", big: "~87M", small: "consoles sold, 2006–2017" } },
    { id: "why-store", title: "The store closes", sub: "New purchases end by July 2027", icon: "hourglass",
      preview: { kind: "stat", big: "countdown", small: "until new purchases end (by July 2027)" } },
    { id: "why-cell", title: "The Cell", sub: "Brilliant, and famously hard to program", icon: "cell",
      preview: { kind: "stat", big: "1 + 8", small: "one PowerPC core, eight vector units" } },
    { id: "why-us", title: "Why we care", sub: "A console bought in its final year", icon: "heart",
      preview: { kind: "stat", big: "2017", small: "the year production ended, and the year it came home" } },
  ]},
  { id: "about", label: "About", icon: "info", items: [
    { id: "team", title: "The crew", sub: "Mofe Bankole & Steven", icon: "people",
      preview: { kind: "stat", big: "2", small: "people, one Kiro, one aging console" } },
    { id: "legal", title: "Licence & notice", sub: "MIT. Not affiliated with Sony.", icon: "doc",
      preview: { kind: "stat", big: "MIT", small: "open source, fork it freely" } },
  ]},
];
