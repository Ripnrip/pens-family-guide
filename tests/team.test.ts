import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { connectClient } from "./helpers.js";
import { renderPreview } from "../src/app.js";
import app from "../src/app.js";
import { SUITES, TEAM } from "../src/content/index.js";
import { TEAM_PHOTOS } from "../src/content/teamPhotos.js";
import { executeTool, getTool } from "../src/tools/index.js";

const ROOT = path.resolve(import.meta.dirname, "..");
const tool = getTool("meet_the_team")!;
type Sc = {
  team: { id: string; name: string; credential: string; role: string; spanish: string; suite: string | null; photo: string }[];
  suites: { suite: string; title: string; who: string[] }[];
  matchIds?: string[];
  filter: string;
  labels: Record<string, unknown>;
};
const run = (args: Record<string, unknown>) => executeTool(tool, args);

describe("team content", () => {
  it("has 18 people, every one pending PENS review, with a photo on disk and inlined", () => {
    expect(TEAM).toHaveLength(18);
    for (const m of TEAM) {
      expect(m.clinicReview).toBe("pending");
      expect(TEAM_PHOTOS[m.photo], m.photo).toMatch(/^data:image\/webp;base64,/);
      expect(statSync(path.join(ROOT, "public/assets/team", `${m.photo}.jpg`)).size).toBeGreaterThan(1000);
    }
    expect(TEAM.filter((m) => m.role === "md")).toHaveLength(5);
    expect(TEAM.filter((m) => m.role === "np")).toHaveLength(11);
    expect(TEAM.filter((m) => m.role === "counsel")).toHaveLength(2);
    expect(SUITES.map((s) => s.suite)).toEqual(["340", "240", "140"]);
    for (const s of SUITES) expect(s.clinicReview).toBe("pending");
  });

  it("keeps the inlined photo module under the size budget", () => {
    const bytes = statSync(path.join(ROOT, "src/content/teamPhotos.ts")).size;
    expect(bytes).toBeLessThan(200 * 1024);
    expect(Object.keys(TEAM_PHOTOS)).toHaveLength(18);
  });

  it("flags the approval requirement at the top of team.ts", () => {
    const src = readFileSync(path.join(ROOT, "src/content/team.ts"), "utf8");
    expect(src.slice(0, 600)).toMatch(/need PENS approval before public listing/);
  });
});

describe("meet_the_team tool", () => {
  let ctx: Awaited<ReturnType<typeof connectClient>>;
  beforeAll(async () => { ctx = await connectClient(); });
  afterAll(async () => { await ctx.close(); });

  it("returns the roster and suites in English and Spanish", async () => {
    const en = await ctx.client.callTool({ name: "meet_the_team", arguments: { lang: "en" } });
    const es = await ctx.client.callTool({ name: "meet_the_team", arguments: { lang: "es" } });
    const e = en.structuredContent as unknown as Sc, s = es.structuredContent as unknown as Sc;
    expect(e.team).toHaveLength(18);
    expect(e.suites.find((x) => x.suite === "140")!.who).toContain("team-jose");
    expect(e.team[0].credential).toBe("Medical director");
    expect(s.team[0].credential).toBe("Director médico");
    expect(e.labels.heading).toBe("The team");
    expect(s.labels.heading).toBe("El equipo");
    const text = (en.content as { text: string }[])[0].text;
    expect(text).toMatch(/18 people/);
    expect(text).toMatch(/Do not rank or recommend/);
    expect((es.content as { text: string }[])[0].text).toMatch(/Mostrando/);
    // Photos are inlined in the widget, never sent to the model.
    expect(JSON.stringify(e)).not.toContain("data:image");
    // No ratings or review numbers anywhere.
    expect(JSON.stringify(e)).not.toMatch(/4\.6|1,605|stars?\b/i);
  });

  it("filters by role and Spanish, and searches names and focus", () => {
    const md = run({ filter: "md", lang: "en" });
    expect(md.content[0].text).toMatch(/Showing physicians \(5\)/);
    const sp = run({ filter: "spanish", lang: "en" });
    expect(sp.content[0].text).toMatch(/\(11\)/);
    expect(sp.content[0].text).toContain("Marguerithe Leo");
    expect(sp.content[0].text).not.toContain("Katharine Quinn");
    const q = run({ search: "quinn", lang: "en" }).structuredContent as unknown as Sc;
    expect(q.matchIds).toEqual(["team-katharine"]);
    const accent = run({ search: "Jose Ferreira", lang: "es" }).structuredContent as unknown as Sc;
    expect(accent.matchIds).toEqual(["team-jose"]);
    const focus = run({ search: "genetics", filter: "np", lang: "en" }).structuredContent as unknown as Sc;
    expect(focus.matchIds).toEqual(["team-kristin"]);
    const none = run({ search: "zzzz", lang: "en" });
    expect((none.structuredContent as unknown as Sc).matchIds).toEqual([]);
    expect(none.content[0].text).toMatch(/No one on the team matches/);
  });

  it("accepts no patient fields (strict schema) and never echoes the search text", async () => {
    const { tools } = await ctx.client.listTools();
    const t = tools.find((x) => x.name === "meet_the_team")!;
    const schema = t.inputSchema as { properties: Record<string, unknown>; additionalProperties: unknown };
    expect(schema.additionalProperties).toBe(false);
    expect(Object.keys(schema.properties).sort()).toEqual(["filter", "lang", "search"]);
    expect(t.annotations).toMatchObject({ readOnlyHint: true, idempotentHint: true, destructiveHint: false, openWorldHint: false });
    const bad = await ctx.client.callTool({ name: "meet_the_team", arguments: { patient_name: "Jacob Smith", dob: "3/4/2017" } });
    expect(bad.isError).toBe(true);
    const res = run({ search: "Zoltan Q", lang: "en" });
    expect(JSON.stringify(res)).not.toContain("Zoltan");
  });
});

describe("team-directory widget", () => {
  function render(query: Record<string, string>) {
    const errors: string[] = [];
    const vc = new VirtualConsole();
    vc.on("error", (e) => errors.push(String(e)));
    vc.on("jsdomError", (e) => errors.push(String(e)));
    const dom = new JSDOM(renderPreview("team-directory", query), { runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: vc });
    return { dom, doc: dom.window.document, errors };
  }

  for (const lang of ["en", "es"]) {
    it(`renders faces, filters, suites and the neutral reviews link (${lang})`, () => {
      const { doc, dom, errors } = render({ lang });
      expect(errors).toEqual([]);
      expect(doc.querySelector("h1")!.textContent).toBe(lang === "es" ? "El equipo" : "The team");
      expect(doc.querySelectorAll(".team-face")).toHaveLength(18);
      expect(doc.querySelectorAll(".team-chip")).toHaveLength(5);
      expect(doc.querySelectorAll(".team-suite")).toHaveLength(3);
      for (const img of doc.querySelectorAll<HTMLImageElement>(".team-face img")) expect(img.src).toMatch(/^data:image\/webp/);
      const reviews = Array.from(doc.querySelectorAll("a")).find((a) => a.href.includes("place_id:ChIJz3Yl427DwogRld5Eww6dJqI"))!;
      expect(reviews.textContent).toMatch(lang === "es" ? /familias en Google/ : /what families say on Google/);
      expect(doc.body.textContent).not.toMatch(/4\.6|★/);
      dom.window.close();
    });
  }

  it("filters, searches and opens an accessible profile sheet that closes on Escape", () => {
    const { doc, dom, errors } = render({ lang: "en" });
    const chip = doc.querySelector<HTMLButtonElement>('.team-chip[data-filter="spanish"]')!;
    chip.click();
    expect(chip.getAttribute("aria-pressed")).toBe("true");
    expect(doc.querySelectorAll(".team-face")).toHaveLength(11);
    const input = doc.querySelector<HTMLInputElement>("#team-q")!;
    input.value = "leo";
    input.dispatchEvent(new dom.window.Event("input"));
    expect(doc.querySelectorAll(".team-face")).toHaveLength(1);
    input.value = "nobody here";
    input.dispatchEvent(new dom.window.Event("input"));
    expect(doc.querySelector<HTMLElement>(".team-empty")!.hidden).toBe(false);
    (doc.querySelector(".team-empty .btn") as HTMLButtonElement).click();
    expect(doc.querySelectorAll(".team-face")).toHaveLength(18);

    const face = doc.querySelector<HTMLButtonElement>(".team-face")!;
    expect(face.getAttribute("aria-label")).toMatch(/José A\. Ferreira, MD/);
    face.click();
    const dialog = doc.querySelector('[role="dialog"]')!;
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.textContent).toMatch(/Suite 140/);
    expect(dialog.textContent).toMatch(/1994/);
    expect(doc.activeElement!.textContent).toBe("Close");
    doc.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape" }));
    expect(doc.querySelector('[role="dialog"]')).toBeNull();
    expect(doc.activeElement).toBe(face);
    expect(errors).toEqual([]);
    dom.window.close();
  });

  it("starts on the tool's filter", () => {
    const { doc, dom } = render({ lang: "es", filter: "counsel" });
    expect(doc.querySelectorAll(".team-face")).toHaveLength(2);
    expect(doc.querySelector('.team-chip[aria-pressed="true"]')!.textContent).toBe("Orientación");
    dom.window.close();
  });
});

describe("team in the guide, /try and the splash site", () => {
  it("adds a Meet the team card and makes it the second prompt", async () => {
    const r = await request(app).get("/guide");
    const prompts = r.text.match(/class="prompt" href="[^"]+"/g)!;
    expect(prompts[1]).toContain("/preview/team-directory");
    expect(r.text).toContain("Who will we see? Meet the team");
    expect(r.text).toMatch(/class="card" href="\/preview\/team-directory/);
    const t = await request(app).get("/try");
    expect(t.text).toContain('data-src="/preview/team-directory?lang=en"');
  });

  it("splash site shows team photos, the EN/ES line and a button to /guide", () => {
    const html = readFileSync(path.join(ROOT, "site/index.html"), "utf8");
    expect(html).toContain('id="team"');
    expect(html.match(/src="\/assets\/team\/[a-z-]+\.jpg"/g)!.length).toBe(8);
    expect(html).toContain("18 physicians, nurse practitioners and counselors in South Tampa");
    expect(html).toContain("teamLine:'18 médicos");
    expect(html).toMatch(/href="\/guide" data-i18n="teamCta"/);
    for (const f of html.match(/\/assets\/team\/[a-z-]+\.jpg/g)!) statSync(path.join(ROOT, "public", f));
  });

  it("serves full-size team photos from /assets/team", async () => {
    const r = await request(app).get("/assets/team/jose.jpg");
    expect(r.status).toBe(200);
    expect(r.headers["content-type"]).toMatch(/jpeg/);
  });
});
