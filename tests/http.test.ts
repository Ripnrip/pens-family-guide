import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { WIDGET_IDS } from "../src/widgets/index.js";
import { SUBMISSION_PATH } from "../src/config.js";
import { REVIEWER_CASES } from "../src/reviewer.js";

const app = createApp();
const MCP_HEADERS = { Accept: "application/json, text/event-stream", "Content-Type": "application/json" };

describe("HTTP server", () => {
  it("answers initialize and tools/list over Streamable HTTP (stateless)", async () => {
    const init = await request(app).post("/mcp").set(MCP_HEADERS).send({
      jsonrpc: "2.0", id: 1, method: "initialize",
      params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "0" } },
    });
    expect(init.status).toBe(200);
    expect(init.body.result.serverInfo.name).toBe("pens-tampa");

    const list = await request(app).post("/mcp").set(MCP_HEADERS).send({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
    expect(list.status).toBe(200);
    expect(list.body.result.tools).toHaveLength(11);
  });

  it("calls a tool over HTTP", async () => {
    const res = await request(app).post("/mcp").set(MCP_HEADERS).send({
      jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "clinic_info", arguments: { lang: "es" } },
    });
    expect(res.status).toBe(200);
    expect(res.body.result.structuredContent.lang).toBe("es");
  });

  it("GET /mcp describes the endpoint; SSE GET is 405 (stateless)", async () => {
    const info = await request(app).get("/mcp");
    expect(info.body.endpoint).toBe("/mcp");
    const sse = await request(app).get("/mcp").set("Accept", "text/event-stream");
    expect(sse.status).toBe(405);
  });

  it("serves a preview for every widget with injected mock data", async () => {
    for (const id of WIDGET_IDS) {
      const res = await request(app).get(`/preview/${id}?lang=es&theme=dark`);
      expect(res.status, id).toBe(200);
      expect(res.text).toContain("window.__PENS_PREVIEW__");
      expect(res.text).toContain('"lang":"es"');
    }
    expect((await request(app).get("/preview/nope")).status).toBe(404);
  });

  it("serves privacy and terms pages", async () => {
    const p = await request(app).get("/privacy");
    expect(p.text).toContain("BinaryBros LLC");
    expect(p.text).toContain("noeticactivity@gmail.com");
    expect(p.text).toMatch(/No protected health information/i);
    const t = await request(app).get("/terms");
    expect(t.status).toBe(200);
  });

  it("serves the MCP endpoint at the stable submission path too", async () => {
    const init = await request(app).post(SUBMISSION_PATH).set(MCP_HEADERS).send({
      jsonrpc: "2.0", id: 1, method: "initialize",
      params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "0" } },
    });
    expect(init.status).toBe(200);
    expect(init.body.result.serverInfo.name).toBe("pens-tampa");
    const read = await request(app).post(SUBMISSION_PATH).set(MCP_HEADERS).send({ jsonrpc: "2.0", id: 2, method: "resources/read", params: { uri: "ui://pens/clinic-card.html" } });
    expect(read.body.result.contents[0].mimeType).toBe("text/html;profile=mcp-app");
    expect((await request(app).get(SUBMISSION_PATH)).body.endpoint).toBe(SUBMISSION_PATH);
  });

  it("serves support and reviewer-demo pages consistent with privacy and terms", async () => {
    for (const p of ["/privacy", "/terms", "/support", "/reviewer-demo"]) {
      const r = await request(app).get(p);
      expect(r.status, p).toBe(200);
      expect(r.text, p).toContain("PENS is operated by BinaryBros LLC on behalf of Pediatric Epilepsy &amp; Neurology Specialists.");
      expect(r.text, p).toContain("noeticactivity@gmail.com");
      expect(r.text, p).toMatch(/class="badge"[^>]*>Preview</);
    }
    const support = (await request(app).get("/support")).text;
    expect(support).toContain("(813) 873-7367");
    expect(support).toContain("508 S. Habana Ave., Suite 340, Tampa, FL 33609");
    expect(support).toContain("https://www.pensoftampabay.com/");
    expect(support).toContain("7:30 AM – 5:00 PM");
    expect(support).toContain("7:30 AM – 4:30 PM");
  });

  it("lists every reviewer prompt in English and Spanish on /reviewer-demo", async () => {
    const r = await request(app).get("/reviewer-demo");
    const decode = (s: string) => s.replace(/&quot;/g, '"').replace(/&amp;/g, "&");
    const text = decode(r.text);
    for (const c of REVIEWER_CASES) {
      expect(text).toContain(c.prompt.en);
      expect(text).toContain(c.prompt.es);
      expect(text).toContain(c.tool!);
    }
  });
});
