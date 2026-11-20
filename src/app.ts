import { existsSync } from "node:fs";
import { guideManifest, guidePage, originOf, qrSvg, tryPage, waitingRoomPage } from "./guide.js";
import path from "node:path";
import express, { type Request, type Response, type NextFunction } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { SERVER_INFO, createPensServer } from "./server.js";
import { TOOLS, executeTool } from "./tools/index.js";
import { WIDGET_IDS, WIDGETS, widgetHtml, type WidgetId } from "./widgets/index.js";
import { homePage, page, privacyPage, reviewerDemoPage, supportPage, termsPage } from "./pages.js";
import { MCP_PATH, SUBMISSION_PATH } from "./config.js";
import { projectRootCandidates } from "./brand/index.js";

export interface AppOptions {
  /** Splash site folder (index.html + assets/). Defaults to PENS_SITE_DIR or <project>/site. May be missing. */
  siteDir?: string;
  /** Folder holding the swappable brand assets (pens-logo.svg/png). Defaults to <project>/public/assets. */
  publicAssetsDir?: string;
}

function firstExisting(candidates: string[], fallback: string): string {
  return candidates.find((p) => existsSync(p)) ?? fallback;
}

export function defaultSiteDir(): string {
  if (process.env.PENS_SITE_DIR) return path.resolve(process.env.PENS_SITE_DIR);
  const roots = projectRootCandidates();
  return firstExisting(roots.map((r) => path.join(r, "site")), path.join(roots[0], "site"));
}

export function defaultPublicAssetsDir(): string {
  const roots = projectRootCandidates();
  return firstExisting(roots.map((r) => path.join(r, "public", "assets")), path.join(roots[0], "public", "assets"));
}

/** Default arguments used by /preview so each widget renders realistic data. */
const PREVIEW_ARGS: Partial<Record<string, Record<string, Record<string, unknown>>>> = {
  find_care: { en: { concern: "Does PENS see kids with ADHD? My son also gets headaches." }, es: { concern: "¿Atienden niños con TDAH? Mi hijo también tiene dolores de cabeza." } },
  prepare_for_visit: { en: { visit_type: "routine_eeg" }, es: { visit_type: "routine_eeg" } },
};

const PREVIEW_RESERVED = new Set(["theme", "lang", "display"]);

function jsonForScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}

export function renderPreview(id: WidgetId, query: Record<string, unknown>): string {
  const def = TOOLS.find((t) => t.widget === id)!;
  const lang = query.lang === "es" ? "es" : "en";
  const theme = query.theme === "dark" ? "dark" : "light";
  const extra: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(query)) if (!PREVIEW_RESERVED.has(k) && typeof v === "string") extra[k] = v;
  const args = { ...(PREVIEW_ARGS[def.name]?.[lang] ?? {}), ...extra, lang };
  const result = executeTool(def, args);
  const injected = {
    toolOutput: result.structuredContent,
    toolResponseMetadata: result._meta ?? {},
    theme,
    locale: lang === "es" ? "es-US" : "en-US",
    displayMode: query.display === "fullscreen" ? "fullscreen" : "inline",
  };
  const q = (o: Record<string, string>) => {
    const p = new URLSearchParams({ ...(Object.fromEntries(Object.entries(extra).map(([k, v]) => [k, String(v)]))), lang, theme, ...o });
    return `?${p.toString()}`;
  };
  const bar = `<nav aria-label="Preview controls" style="font:13px system-ui;padding:6px 14px;display:flex;gap:12px;flex-wrap:wrap;background:#1D2B36;color:#fff">
<strong>Preview: ${id}</strong>
<a style="color:#F6B93B" href="${q({ lang: "en" })}">EN</a><a style="color:#F6B93B" href="${q({ lang: "es" })}">ES</a>
<a style="color:#F6B93B" href="${q({ theme: "light" })}">Light</a><a style="color:#F6B93B" href="${q({ theme: "dark" })}">Dark</a>
<a style="color:#F6B93B" href="/preview">All widgets</a></nav>`;
  return widgetHtml(id)
    .replace("<body>", () => `<body>\n${bar}`)
    .replace("<script>", () => `<script>window.__PENS_PREVIEW__ = ${jsonForScript(injected)};</script>\n<script>`);
}

export function createApp(opts: AppOptions = {}) {
  const siteDir = path.resolve(opts.siteDir ?? defaultSiteDir());
  const publicAssetsDir = path.resolve(opts.publicAssetsDir ?? defaultPublicAssetsDir());
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));

  // CORS for browser-based MCP clients (e.g. MCP Inspector direct mode).
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID");
    res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id, Mcp-Protocol-Version");
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    next();
  });

  // --- MCP (Streamable HTTP, stateless: a fresh server + transport per request) ---
  // Served at /mcp and at the stable submission alias (see SUBMISSION_PATH and vercel.json).
  const mcpPost = async (req: Request, res: Response) => {
    const server = createPensServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    res.on("close", () => {
      void transport.close();
      void server.close();
    });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      console.error("MCP request failed", err);
      if (!res.headersSent) {
        res.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: "Internal server error" }, id: null });
      }
    }
  };
  // Stateless server: no standalone SSE stream / sessions to resume or delete.
  const mcpGet = (endpoint: string) => (req: Request, res: Response) => {
    if (String(req.headers.accept ?? "").includes("text/event-stream")) {
      res.status(405).set("Allow", "POST").json({ jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed: stateless server, use POST." }, id: null });
      return;
    }
    res.json({ ...SERVER_INFO, transport: "streamable-http", endpoint, method: "POST", tools: TOOLS.map((t) => t.name) });
  };
  const mcpDelete = (_req: Request, res: Response) => {
    res.status(405).set("Allow", "POST").json({ jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed: stateless server." }, id: null });
  };
  for (const endpoint of [MCP_PATH, SUBMISSION_PATH]) {
    app.post(endpoint, mcpPost);
    app.get(endpoint, mcpGet(endpoint));
    app.delete(endpoint, mcpDelete);
  }

  // --- Widget previews (plain browser, mock window.openai data) ---
  app.get("/preview", (_req: Request, res: Response) => {
    const links = WIDGET_IDS.map(
      (id) => `<li><a href="/preview/${id}">${WIDGETS[id].title}</a> · <a href="/preview/${id}?lang=es">ES</a> · <a href="/preview/${id}?theme=dark">dark</a></li>`,
    ).join("");
    res.type("html").send(page("PENS widget preview", `<h1>Widget preview</h1><p>Each widget rendered in a plain browser with mock data (no ChatGPT or Claude host).</p><ul>${links}</ul><p>Query params: <code>lang=es</code>, <code>theme=dark</code>, <code>display=fullscreen</code>, plus tool args (e.g. <code>/preview/find-care?concern=migraines</code>, <code>/preview/visit-prep?visit_type=video_eeg</code>).</p>`, { active: "/preview" }));
  });
  app.get("/preview/:widget", (req: Request, res: Response) => {
    const id = String(req.params.widget) as WidgetId;
    if (!WIDGET_IDS.includes(id)) {
      res.status(404).type("text").send(`Unknown widget. Try: ${WIDGET_IDS.join(", ")}`);
      return;
    }
    res.type("html").send(renderPreview(id, req.query as Record<string, unknown>));
  });

  // --- Family Guide (phone-first), manifest, QR, waiting-room poster ---
  app.get(["/guide", "/guide/"], (req: Request, res: Response) => void res.type("html").send(guidePage(req.query.lang, req.query.theme)));
  app.get("/guide/manifest.webmanifest", (_req: Request, res: Response) => void res.type("application/manifest+json").send(JSON.stringify(guideManifest())));
  app.get("/qr.svg", async (req: Request, res: Response) => void res.type("image/svg+xml").send(await qrSvg(`${originOf(req)}/guide`)));
  app.get("/try", (req: Request, res: Response) => void res.type("html").send(tryPage(originOf(req), req.query.lang)));
  app.get("/widget", (req: Request, res: Response) => void res.type("html").send(renderPreview("question-card", { visit_type: "routine_eeg", ...(req.query as Record<string, unknown>) })));
  app.get("/widget/:widget", (req: Request, res: Response) => {
    const id = String(req.params.widget) as WidgetId;
    if (!WIDGET_IDS.includes(id)) { res.status(404).type("text").send(`Unknown widget. Try: ${WIDGET_IDS.join(", ")}`); return; }
    res.type("html").send(renderPreview(id, req.query as Record<string, unknown>));
  });
  app.get("/waiting-room", async (req: Request, res: Response) => void res.type("html").send(await waitingRoomPage(originOf(req))));

  // --- Pages ---
  app.get("/privacy", (_req: Request, res: Response) => void res.type("html").send(privacyPage()));
  app.get("/terms", (_req: Request, res: Response) => void res.type("html").send(termsPage()));
  app.get("/support", (_req: Request, res: Response) => void res.type("html").send(supportPage()));
  app.get("/reviewer-demo", (_req: Request, res: Response) => void res.type("html").send(reviewerDemoPage()));
  app.get("/healthz", (_req: Request, res: Response) => void res.json({ ok: true, ...SERVER_INFO }));

  // --- Splash site (site/, built separately) at / and /assets/*, plus brand assets ---
  // public/assets (the one swappable pens-logo.svg + PNGs) is canonical for brand file names, so
  // swapping the logo updates the site too; every other /assets/* file comes from site/assets.
  // Missing folders are fine.
  app.use("/assets", express.static(publicAssetsDir, { index: false, dotfiles: "ignore" }));
  app.use("/assets", express.static(path.join(siteDir, "assets"), { index: false, dotfiles: "ignore" }));
  app.get(["/", "/index.html"], (_req: Request, res: Response) => {
    const index = path.join(siteDir, "index.html");
    if (existsSync(index)) res.sendFile(index);
    else res.type("html").send(homePage());
  });

  return app;
}

const app = createApp();
export default app;
