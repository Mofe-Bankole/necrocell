import fs from "node:fs";
import path from "node:path";
import { slug } from "../lib/art";

/**
 * Third-party cover art switch. Kiroween rules disqualify submissions that use
 * third-party trademarks; set to false before submitting to fall back to our
 * own generated ember art everywhere.
 */
export const SHOW_COVERS = true;

const base = import.meta.env.BASE_URL.replace(/\/$/, "");
export function coverFor(title: string): string | undefined {
  if (!SHOW_COVERS) return undefined;
  const file = slug(title) + ".webp";
  return fs.existsSync(path.join(process.cwd(), "public/covers", file)) ? `${base}/covers/${file}` : undefined;
}

/** Full-screen 16:9 game backdrop (ideally 1920×1080), from public/backdrops/<slug>.webp|jpg|png. */
export function backdropFor(title: string): string | undefined {
  if (!SHOW_COVERS) return undefined;
  for (const ext of ["webp", "jpg", "jpeg", "png"]) {
    const file = slug(title) + "." + ext;
    if (fs.existsSync(path.join(process.cwd(), "public/backdrops", file))) return `${base}/backdrops/${file}`;
  }
  return undefined;
}
