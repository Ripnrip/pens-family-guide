import { JSDOM, VirtualConsole } from "jsdom";
import { describe, expect, it } from "vitest";
import { TOOLS, executeTool } from "../src/tools/index.js";
import { widgetHtml, type WidgetId } from "../src/widgets/index.js";

type Msg = { jsonrpc: string; id?: string | number; method?: string; params?: Record<string, unknown>; result?: unknown };

/** Load a widget (no /preview data) inside a fake MCP Apps host frame. */
function hosted(id: WidgetId, opts: { openai?: Record<string, unknown> } = {}) {
  const sent: Msg[] = [];
  const errors: string[] = [];
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => errors.push(String(e)));
  const parent = { postMessage: (m: Msg) => sent.push(JSON.parse(JSON.stringify(m))) };
  const dom = new JSDOM(widgetHtml(id), {
    runScripts: "dangerously",
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(win) {
      Object.defineProperty(win, "parent", { value: parent, configurable: true });
      if (opts.openai) Object.defineProperty(win, "openai", { value: opts.openai, configurable: true });
    },
  });
  const deliver = (data: Msg) => {
    const ev = new dom.window.MessageEvent("message", { data });
    Object.defineProperty(ev, "source", { value: parent });
    dom.window.dispatchEvent(ev);
  };
  const flush = () => new Promise((r) => setTimeout(r, 0));
  return { dom, doc: dom.window.document, sent, deliver, flush, errors };
}

function toolResult(name: string, args: Record<string, unknown>) {
  const r = executeTool(TOOLS.find((t) => t.name === name)!, args);
  return { content: r.content, structuredContent: r.structuredContent, _meta: r._meta };
}

describe("widget runtime: MCP Apps bridge", () => {
  it("initializes with ui/initialize, then renders the ui/notifications/tool-result", async () => {
    const h = hosted("clinic-card");
    const init = h.sent.find((m) => m.method === "ui/initialize")!;
    expect(init).toBeTruthy();
    expect(init.params!.protocolVersion).toBe("2026-01-26");
    expect(h.doc.getElementById("root")!.textContent).toMatch(/Loading/);

    h.deliver({ jsonrpc: "2.0", id: init.id, result: { protocolVersion: "2026-01-26", hostInfo: { name: "host", version: "1" }, hostCapabilities: { openLinks: {} }, hostContext: { theme: "dark", locale: "es-US", availableDisplayModes: ["inline", "fullscreen"] } } });
    await h.flush();
    expect(h.sent.some((m) => m.method === "ui/notifications/initialized")).toBe(true);
    expect(h.doc.documentElement.getAttribute("data-theme")).toBe("midnight");

    h.deliver({ jsonrpc: "2.0", method: "ui/notifications/tool-result", params: toolResult("clinic_info", { lang: "es" }) });
    await h.flush();
    const root = h.doc.getElementById("root")!;
    expect(root.textContent).toContain("508 S. Habana Ave.");
    expect(h.doc.documentElement.getAttribute("lang")).toBe("es");
    expect(root.querySelector(".brandline img")).toBeTruthy();
    expect(h.errors).toEqual([]);
    h.dom.window.close();
  });

  it("routes links, follow-ups and display mode through ui/* requests", async () => {
    const h = hosted("eeg-adventure");
    const init = h.sent.find((m) => m.method === "ui/initialize")!;
    h.deliver({ jsonrpc: "2.0", id: init.id, result: { hostContext: { availableDisplayModes: ["inline", "fullscreen"] } } });
    await h.flush();
    h.deliver({ jsonrpc: "2.0", method: "ui/notifications/tool-result", params: toolResult("my_eeg_day", {}) });
    await h.flush();
    // Pip is drawn from the brand module.
    expect(h.doc.querySelector(".pip-stage svg .pip-antenna")).toBeTruthy();
    (h.doc.querySelector(".btn.fs") as HTMLButtonElement).click();
    expect(h.sent.some((m) => m.method === "ui/request-display-mode" && m.params!.mode === "fullscreen")).toBe(true);
    h.dom.window.close();

    const v = hosted("visit-prep");
    const vi = v.sent.find((m) => m.method === "ui/initialize")!;
    v.deliver({ jsonrpc: "2.0", id: vi.id, result: { hostContext: {} } });
    await v.flush();
    v.deliver({ jsonrpc: "2.0", method: "ui/notifications/tool-result", params: toolResult("prepare_for_visit", { visit_type: "routine_eeg" }) });
    await v.flush();
    const link = v.doc.querySelector('a.btn[target="_blank"]') as HTMLAnchorElement | null;
    if (link) {
      link.click();
      expect(v.sent.some((m) => m.method === "ui/open-link")).toBe(true);
    }
    v.dom.window.close();
  });

  it("answers host ping / teardown requests", async () => {
    const h = hosted("caregiver-quiz");
    h.deliver({ jsonrpc: "2.0", id: 99, method: "ui/resource-teardown", params: {} });
    expect(h.sent.find((m) => m.id === 99)?.result).toEqual({});
    h.dom.window.close();
  });
});

describe("widget runtime: window.openai fallback", () => {
  it("renders from window.openai.toolOutput when no MCP Apps host answers", () => {
    const out = toolResult("seizure_first_aid", { lang: "en" });
    const h = hosted("seizure-first-aid", { openai: { toolOutput: out.structuredContent, theme: "light", locale: "en-US", displayMode: "inline" } });
    const root = h.doc.getElementById("root")!;
    expect(root.querySelector(".timer")).toBeTruthy();
    expect(root.textContent).toMatch(/911/);
    h.dom.window.close();
  });
});
