import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { SUBMISSION_PATH } from "../src/config.js";

const ROOT = path.resolve(import.meta.dirname, "..");
const MCP_HEADERS = { Accept: "application/json, text/event-stream", "Content-Type": "application/json" };

/** Temp splash-site fixture (never written inside the real site/ folder). */
let fixture: string;
beforeAll(() => {
  fixture = mkdtempSync(path.join(tmpdir(), "pens-site-"));
  mkdirSync(path.join(fixture, "assets"));
  writeFileSync(path.join(fixture, "index.html"), "<!doctype html><title>splash</title><h1>PENS splash fixture</h1>");
  writeFileSync(path.join(fixture, "assets", "site.css"), "body{color:#0F6E74}");
  // A stale logo copy in the site must not override the one swappable brand logo.
  writeFileSync(path.join(fixture, "assets", "pens-logo.svg"), "<svg>STALE SITE COPY</svg>");
  // Files outside index.html + assets/ must never shadow app routes.
  writeFileSync(path.join(fixture, "privacy"), "SHADOW");
  writeFileSync(path.join(fixture, "privacy.html"), "SHADOW");
});
afterAll(() => rmSync(fixture, { recursive: true, force: true }));

describe("splash site serving (Express)", () => {
  it("serves site/index.html at / and site/assets/* at /assets/*", async () => {
    const app = createApp({ siteDir: fixture });
    const home = await request(app).get("/");
    expect(home.status).toBe(200);
    expect(home.text).toContain("PENS splash fixture");
    const css = await request(app).get("/assets/site.css");
    expect(css.status).toBe(200);
    expect(css.headers["content-type"]).toMatch(/css/);
  });

  it("keeps every app route working alongside the site", async () => {
    const app = createApp({ siteDir: fixture });
    for (const p of ["/privacy", "/terms", "/support", "/reviewer-demo", "/preview"]) {
      const r = await request(app).get(p);
      expect(r.status, p).toBe(200);
      expect(r.text, p).not.toContain("SHADOW");
    }
    expect((await request(app).get("/healthz")).body.ok).toBe(true);
    for (const p of ["/mcp", SUBMISSION_PATH]) {
      const r = await request(app).post(p).set(MCP_HEADERS).send({ jsonrpc: "2.0", id: 1, method: "tools/list", params: {} });
      expect(r.status, p).toBe(200);
      expect(r.body.result.tools).toHaveLength(10);
    }
    // The canonical brand logo wins over a same-named file in site/assets.
    const logo = await request(app).get("/assets/pens-logo.svg");
    expect(logo.status).toBe(200);
    expect(logo.body.toString()).toBe(readFileSync(path.join(ROOT, "public/assets/pens-logo.svg"), "utf8"));
  });

  it("tolerates a missing site/ folder (fallback home page, 404 for site assets)", async () => {
    const app = createApp({ siteDir: path.join(fixture, "does-not-exist") });
    const home = await request(app).get("/");
    expect(home.status).toBe(200);
    expect(home.text).toContain("PENS");
    expect(home.text).toContain("/assets/pens-logo.svg");
    expect((await request(app).get("/assets/site.css")).status).toBe(404);
    expect((await request(app).get("/assets/pens-logo.svg")).status).toBe(200);
  });
});

describe("static build for Vercel (scripts/prepare-static.mjs)", () => {
  const run = (out: string, siteDir: string) =>
    execFileSync(process.execPath, [path.join(ROOT, "scripts/prepare-static.mjs"), out], { env: { ...process.env, PENS_SITE_DIR: siteDir } });

  it("copies only site/index.html + site/assets plus the brand assets", () => {
    const out = mkdtempSync(path.join(tmpdir(), "pens-static-"));
    try {
      run(out, fixture);
      expect(readFileSync(path.join(out, "index.html"), "utf8")).toContain("PENS splash fixture");
      expect(existsSync(path.join(out, "assets", "site.css"))).toBe(true);
      expect(readFileSync(path.join(out, "assets", "pens-logo.svg"), "utf8")).toBe(readFileSync(path.join(ROOT, "public/assets/pens-logo.svg"), "utf8"));
      expect(existsSync(path.join(out, "privacy"))).toBe(false);
      expect(existsSync(path.join(out, "privacy.html"))).toBe(false);
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  });

  it("still builds when site/ is missing (no index.html, so / falls through to Express)", () => {
    const out = mkdtempSync(path.join(tmpdir(), "pens-static-"));
    try {
      run(out, path.join(fixture, "missing"));
      expect(existsSync(path.join(out, "index.html"))).toBe(false);
      expect(existsSync(path.join(out, "assets", "pens-logo.svg"))).toBe(true);
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  });
});

describe("vercel.json", () => {
  const vercel = JSON.parse(readFileSync(path.join(ROOT, "vercel.json"), "utf8"));
  const rewrites: { source: string; destination: string }[] = vercel.rewrites;

  it("uses a stable /mcp/submission-<8 hex> path next to /mcp", () => {
    expect(SUBMISSION_PATH).toMatch(/^\/mcp\/submission-[0-9a-f]{8}$/);
    const sources = rewrites.map((r) => r.source);
    expect(sources).toContain(SUBMISSION_PATH);
    expect(sources).toContain(`${SUBMISSION_PATH}/(.*)`);
    expect(sources).toContain("/mcp");
    expect(sources.indexOf(SUBMISSION_PATH)).toBeLessThan(sources.indexOf("/mcp"));
    for (const r of rewrites) expect(r.destination).toBe("/api/index.mjs");
  });

  it("ends with a catch-all to the Express app and serves the static build", () => {
    expect(rewrites[rewrites.length - 1].source).toBe("/(.*)");
    expect(vercel.outputDirectory).toBe("static-build");
    expect(vercel.buildCommand).toBe("npm run build:vercel");
    expect(vercel.functions["api/index.mjs"].includeFiles).toContain("site");
  });
});
