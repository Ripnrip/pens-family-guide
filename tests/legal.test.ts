import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app.js";
import { SUPPORT_EMAIL } from "../src/config.js";

const PAGES = ["/privacy", "/terms", "/support"] as const;

describe("legal and support pages", () => {
  for (const path of PAGES) {
    it(`${path} is complete in English and Spanish`, async () => {
      const res = await request(app).get(path);
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/text\/html/);
      const html = res.text;
      expect(html).toContain("November 20, 2026");
      expect(html).toContain("20 de noviembre de 2026");
      expect(html).toContain(SUPPORT_EMAIL);
      expect(html).toContain("911");
      expect(html).toContain('id="es" lang="es"');
      expect(html).toContain('href="#es"');
      expect(html).toMatch(/not medical advice/i);
      expect(html).toMatch(/no es consejo médico/i);
      expect(html).toMatch(/class="badge"[^>]*>Preview</);
      expect(html).not.toContain("TODO");
    });
  }

  it("privacy covers PHI, children, providers, retention and requests", async () => {
    const html = (await request(app).get("/privacy")).text;
    for (const s of [
      "No protected health information is collected",
      "under 13",
      "COPPA",
      "Vercel",
      "Google Fonts",
      "OpenAI (ChatGPT) and Anthropic (Claude)",
      "Retention",
      "Florida residents",
      "Privacidad de los niños",
    ]) expect(html, s).toContain(s);
  });

  it("terms cover no doctor-patient relationship, as-is, trademarks and Florida law", async () => {
    const html = (await request(app).get("/terms")).text;
    for (const s of ["No doctor–patient relationship", "as is", "used on behalf of PENS", "State of Florida", "Limitation of liability", "Ley aplicable"]) {
      expect(html, s).toContain(s);
    }
  });

  it("support explains connectors, care questions and privacy requests", async () => {
    const html = (await request(app).get("/support")).text;
    for (const s of ["developer mode", "Add custom connector", 'data-path="/mcp"', "(813) 873-7367", 'href="/privacy"', 'href="/terms"', "988"]) {
      expect(html, s).toContain(s);
    }
  });
});
