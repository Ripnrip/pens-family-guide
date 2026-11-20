import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { connectClient } from "./helpers.js";
import { TOOLS } from "../src/tools/index.js";
import { WIDGET_IDS, widgetUri } from "../src/widgets/index.js";

const EXPECTED = [
  "clinic_info",
  "find_care",
  "prepare_for_visit",
  "my_eeg_day",
  "seizure_first_aid",
  "school_seizure_plan",
  "caregiver_quiz",
  "request_appointment",
  "for_pediatricians",
  "visit_questions",
];

describe("MCP registration", () => {
  let ctx: Awaited<ReturnType<typeof connectClient>>;
  beforeAll(async () => { ctx = await connectClient(); });
  afterAll(async () => { await ctx.close(); });

  it("registers exactly the ten PENS tools", async () => {
    const { tools } = await ctx.client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([...EXPECTED].sort());
  });

  it("links every tool to its MCP Apps UI resource and keeps ChatGPT _meta", async () => {
    const { tools } = await ctx.client.listTools();
    const { resources } = await ctx.client.listResources();
    const uris = new Set(resources.map((r) => r.uri));
    for (const t of tools) {
      expect(t.description && t.description.length, t.name).toBeGreaterThan(80);
      const meta = t._meta as Record<string, unknown>;
      const ui = meta.ui as { resourceUri: string };
      expect(ui.resourceUri, t.name).toMatch(/^ui:\/\/pens\/[a-z-]+\.html$/);
      expect(uris.has(ui.resourceUri), t.name).toBe(true);
      expect(meta["ui/resourceUri"], t.name).toBe(ui.resourceUri);
      expect(meta["openai/outputTemplate"], t.name).toBe(ui.resourceUri);
      expect(uris.has(meta["openai/outputTemplate"] as string), t.name).toBe(true);
      expect(meta["openai/toolInvocation/invoking"]).toBeTruthy();
      expect(meta["openai/toolInvocation/invoked"]).toBeTruthy();
      expect(typeof meta["openai/widgetAccessible"]).toBe("boolean");
    }
  });

  it("uses strict input schemas with no PHI fields and an optional lang", async () => {
    const { tools } = await ctx.client.listTools();
    for (const t of tools) {
      const schema = t.inputSchema as { properties?: Record<string, unknown>; additionalProperties?: unknown };
      expect(schema.additionalProperties, t.name).toBe(false);
      const keys = Object.keys(schema.properties ?? {});
      expect(keys).toContain("lang");
      for (const k of keys) expect(k).not.toMatch(/name|dob|birth|mrn|record|ssn|email|phone|address/i);
    }
  });

  it("sets all four annotation hints as explicit booleans (read-only, idempotent, non-destructive, closed-world)", async () => {
    const { tools } = await ctx.client.listTools();
    for (const t of tools) {
      const a = t.annotations as Record<string, unknown>;
      expect(a.readOnlyHint, t.name).toBe(true);
      expect(a.idempotentHint, t.name).toBe(true);
      expect(a.destructiveHint, t.name).toBe(false);
      expect(a.openWorldHint, t.name).toBe(false);
      for (const k of ["readOnlyHint", "idempotentHint", "destructiveHint", "openWorldHint"]) expect(typeof a[k], `${t.name}.${k}`).toBe("boolean");
    }
  });

  it("registers every widget the MCP Apps way (ui://pens/<name>.html, text/html;profile=mcp-app) with inline, self-contained HTML", async () => {
    const { resources } = await ctx.client.listResources();
    expect(resources).toHaveLength(WIDGET_IDS.length);
    for (const r of resources) {
      expect(r.uri).toMatch(/^ui:\/\/pens\/[a-z-]+\.html$/);
      expect(r.mimeType).toBe("text/html;profile=mcp-app");
    }
    for (const id of WIDGET_IDS) {
      expect(widgetUri(id)).toBe(`ui://pens/${id}.html`);
      const res = await ctx.client.readResource({ uri: widgetUri(id) });
      const c = res.contents[0] as { mimeType: string; text: string; _meta?: Record<string, unknown> };
      expect(c.mimeType).toBe("text/html;profile=mcp-app");
      const ui = c._meta?.ui as { csp: { connectDomains: string[]; resourceDomains: string[] }; prefersBorder: boolean };
      expect(ui.csp).toEqual({ connectDomains: [], resourceDomains: [] });
      expect(ui.prefersBorder).toBe(true);
      expect(c._meta?.["openai/widgetDescription"]).toBeTruthy();
      expect(c._meta?.["openai/widgetCSP"]).toEqual({ connect_domains: [], resource_domains: [] });
      expect(c.text).toContain("ui/initialize");
      expect(c.text).toContain("<style>");
      expect(c.text).toContain("PENS.mount(");
      expect(c.text).not.toMatch(/<script[^>]+src=/i);
      expect(c.text).not.toMatch(/<link[^>]+href=/i);
      expect(c.text).not.toMatch(/@import|fonts\.googleapis/i);
    }
  });

  it("every tool definition points at a known widget", () => {
    for (const t of TOOLS) expect(WIDGET_IDS).toContain(t.widget);
  });
});
