import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app.js";

describe("Family Guide", () => {
  it("serves /guide in English and Spanish, light and midnight", async () => {
    const en = await request(app).get("/guide");
    expect(en.status).toBe(200);
    expect(en.text).toContain("PENS Family Guide");
    expect(en.text).toContain('href="/preview/question-card?lang=en');
    const es = await request(app).get("/guide?lang=es&theme=midnight");
    expect(es.text).toContain("Guía Familiar de PENS");
    expect(es.text).toContain('data-theme="midnight"');
    expect(es.text).toContain("theme=dark");
  });
  it("serves an installable manifest with the blocks icons", async () => {
    const r = await request(app).get("/guide/manifest.webmanifest");
    expect(r.status).toBe(200);
    const m = JSON.parse(r.text);
    expect(m.start_url).toBe("/guide");
    expect(m.icons.length).toBeGreaterThanOrEqual(2);
  });
  it("serves a QR code to the guide and a waiting-room poster", async () => {
    const qr = await request(app).get("/qr.svg").set("Host", "pens.example");
    expect(qr.status).toBe(200);
    expect(qr.headers["content-type"]).toContain("image/svg+xml");
    expect(String(qr.text ?? qr.body)).toContain("<svg");
    const poster = await request(app).get("/waiting-room").set("Host", "pens.example");
    expect(poster.text).toContain("pens.example/guide");
    expect(poster.text).toContain("Escanee");
  });
});

describe("try and widget pages", () => {
  it("serves /try with the live studio, MCP URL and Spanish", async () => {
    const r = await request(app).get("/try").set("Host", "pens.example");
    expect(r.status).toBe(200);
    expect(r.text).toContain("pens.example/mcp");
    expect(r.text).toContain('/preview/question-card?lang=en');
    const es = await request(app).get("/try?lang=es");
    expect(es.text).toContain("Nuestras preguntas");
  });
  it("serves the standalone studio at /widget and /widget/:id", async () => {
    expect((await request(app).get("/widget")).status).toBe(200);
    expect((await request(app).get("/widget/eeg-adventure")).status).toBe(200);
    expect((await request(app).get("/widget/nope")).status).toBe(404);
  });
});

describe("guide intro splash", () => {
  it("plays the intro once per visit with Skip, and its cards skip their own intro", async () => {
    const html = (await request(app).get("/guide")).text;
    expect(html).toContain('id="pens-intro"');
    expect(html).toContain("sessionStorage.getItem('pens-guide-intro')");
    expect(html).toMatch(/prefers-reduced-motion: reduce/);
    expect(html).toContain('<source src="/assets/intro.mp4" type="video/mp4">');
    expect(html).toContain('class="skip" type="button">Skip<');
    expect(html).toMatch(/href="\/preview\/[a-z-]+\?lang=en&intro=off/);
    expect((await request(app).get("/guide?lang=es")).text).toContain('class="skip" type="button">Saltar<');
    const mp4 = await request(app).get("/assets/intro.mp4");
    expect(mp4.status).toBe(200);
    expect(mp4.headers["content-type"]).toBe("video/mp4");
  });

  it("privacy policy says cards load only the app's own intro animation", async () => {
    const html = (await request(app).get("/privacy")).text;
    expect(html).toContain("load only the App's own short intro animation from the App's own website, and nothing from third parties");
    expect(html).toContain("solo cargan la breve animación de presentación de la App desde el propio sitio web de la App");
  });
});
