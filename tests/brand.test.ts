import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { LOGO_PUBLIC_PATH, TOKENS, logoDataUri, logoSvg, pipSvg, widgetBrand } from "../src/brand/index.js";
import { createApp } from "../src/app.js";
import { WIDGET_IDS, widgetHtml } from "../src/widgets/index.js";

const ROOT = path.resolve(import.meta.dirname, "..");
const SKIP = new Set(["node_modules", "dist", "static-build", "site", ".git", ".vercel"]);

function files(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) files(p, out);
    else if (/\.(ts|mjs|js|json|md|html|svg|css)$/.test(name) && name !== "package-lock.json") out.push(p);
  }
  return out;
}

// Built from parts so this file does not match itself.
const OLD_MASCOT = new RegExp(["Lu", "mi"].join("") + "|" + ["fire", "fl(y|ies)"].join("") + "|" + ["luci", "érnaga"].join(""), "i");
const DISCLAIMERS = new RegExp([["concept", "prototype"].join(" "), ["not", "official"].join(" "), ["un", "official"].join("")].join("|"), "i");

describe("brand", () => {
  it("has no trace of the old mascot anywhere in the repo (content, widgets, tests, docs)", () => {
    const hits = files(ROOT).filter((f) => OLD_MASCOT.test(readFileSync(f, "utf8")));
    expect(hits.map((f) => path.relative(ROOT, f))).toEqual([]);
  });

  it("has no prototype / unofficial disclaimers in pages, docs or widgets", async () => {
    const hits = files(ROOT).filter((f) => !f.endsWith("brand.test.ts") && DISCLAIMERS.test(readFileSync(f, "utf8")));
    expect(hits.map((f) => path.relative(ROOT, f))).toEqual([]);
    const app = createApp();
    for (const p of ["/", "/privacy", "/terms", "/support", "/reviewer-demo", "/preview"]) {
      expect((await request(app).get(p)).text, p).not.toMatch(DISCLAIMERS);
    }
  });

  it("draws Pip with the brand palette", () => {
    const svg = pipSvg({ mood: "happy" });
    for (const c of [TOKENS.sunshine, TOKENS.teal, TOKENS.coral, TOKENS.ink]) expect(svg).toContain(c);
    for (const cls of ["pip-bob", "pip-eyes", "pip-antenna"]) expect(svg).toContain(cls);
    expect(svg).toContain('aria-label="Pip"');
  });

  it("uses the swappable logo file everywhere (pages by URL, widgets inlined from the same file)", async () => {
    const file = readFileSync(path.join(ROOT, "public/assets/pens-logo.svg"), "utf8");
    expect(logoSvg()).toBe(file);
    expect(Buffer.from(logoDataUri().split(",")[1], "base64").toString("utf8")).toBe(file);
    for (const id of WIDGET_IDS) expect(widgetHtml(id)).toContain(logoDataUri());
    const app = createApp();
    for (const p of ["/privacy", "/terms", "/support", "/reviewer-demo"]) expect((await request(app).get(p)).text).toContain(LOGO_PUBLIC_PATH);
    const png = await request(app).get("/assets/pens-logo-512.png");
    expect(png.status).toBe(200);
    expect(png.headers["content-type"]).toBe("image/png");
  });

  it("widgets carry the brand tokens, fonts with system fallback and no font fetches", () => {
    const html = widgetHtml("clinic-card");
    for (const c of Object.values(TOKENS)) expect(html.toUpperCase()).toContain(c.toUpperCase());
    expect(html).toContain('"Fredoka"');
    expect(html).toContain('"Nunito"');
    expect(html).toMatch(/system-ui/);
    expect(html).not.toMatch(/fonts\.(googleapis|gstatic)|@import/i);
    // The only @font-face is the embedded Fredoka data: URI (nothing is fetched under the empty CSP).
    const faces = html.match(/@font-face\s*\{[^}]*\}/g) ?? [];
    expect(faces).toHaveLength(1);
    expect(faces[0]).toContain('font-family: "Fredoka"');
    expect(faces[0]).toMatch(/src: url\(data:font\/woff2;base64,[A-Za-z0-9+/=]+\) format\("woff2"\)/);
    expect(widgetBrand().pip.proud).toContain("<svg");
  });

  it("puts all motion behind prefers-reduced-motion", () => {
    const html = widgetHtml("seizure-first-aid");
    expect(html).toContain("@media (prefers-reduced-motion: no-preference)");
    expect(html).toMatch(/prefers-reduced-motion: reduce\)\s*\{\s*\*, \*::before, \*::after \{ animation: none !important; transition: none !important/);
    for (const k of ["pens-rise", "pens-pulse", "pip-bob", "pip-blink", ".tile:active"]) expect(html).toContain(k);
  });
});
