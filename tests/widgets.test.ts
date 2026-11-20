import { JSDOM, VirtualConsole } from "jsdom";
import { describe, expect, it } from "vitest";
import { renderPreview } from "../src/app.js";
import { WIDGET_IDS, type WidgetId } from "../src/widgets/index.js";

function render(id: WidgetId, query: Record<string, string> = {}) {
  const errors: string[] = [];
  const vc = new VirtualConsole();
  vc.on("error", (e) => errors.push(String(e)));
  vc.on("jsdomError", (e) => errors.push(String(e)));
  const dom = new JSDOM(renderPreview(id, query), { runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: vc });
  return { dom, doc: dom.window.document, errors };
}

describe("widgets render in a plain browser with mock data (no window.openai)", () => {
  for (const id of WIDGET_IDS) {
    for (const lang of ["en", "es"]) {
      it(`${id} (${lang})`, () => {
        const { doc, errors, dom } = render(id, { lang, theme: lang === "es" ? "dark" : "light" });
        expect(errors).toEqual([]);
        const root = doc.getElementById("root")!;
        expect(root.textContent!.length).toBeGreaterThan(50);
        expect(root.querySelector(".footer")).toBeTruthy();
        expect(doc.documentElement.getAttribute("lang")).toBe(lang);
        expect(doc.documentElement.getAttribute("data-theme")).toBe(lang === "es" ? "midnight" : "light");
        dom.window.close();
      });
    }
  }

  it("renders the urgent card when the tool output has an emergency", () => {
    const { doc, errors } = render("find-care", { concern: "he is not breathing" });
    expect(errors).toEqual([]);
    const alert = doc.querySelector(".urgent-card")!;
    expect(alert.getAttribute("role")).toBe("alert");
    expect(alert.querySelector('a[href="tel:911"]')).toBeTruthy();
  });

  it("visit checklist toggles and switches visit types locally", () => {
    const { doc, dom } = render("visit-prep");
    const box = doc.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    box.click();
    expect(box.closest("label")!.className).toContain("done");
    const tabs = doc.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    expect(tabs.length).toBe(6);
    tabs[3].click();
    expect(doc.querySelector('[role="tab"][aria-selected="true"]')).toBe(doc.querySelectorAll('[role="tab"]')[3]);
    dom.window.close();
  });

  it("quiz runs through 5 questions to a score", () => {
    const { doc, dom } = render("caregiver-quiz");
    (doc.querySelector(".btn.accent") as HTMLButtonElement).click();
    for (let i = 0; i < 5; i++) {
      (doc.querySelector(".tile") as HTMLButtonElement).click();
      const next = Array.from(doc.querySelectorAll<HTMLButtonElement>(".quiz > .btn")).find((b) => !b.hidden)!;
      next.click();
    }
    expect(doc.querySelector(".score")!.textContent).toMatch(/\/ 5/);
    dom.window.close();
  });

  it("EEG game advances scenes and shows the hold-still game", () => {
    const { doc, dom } = render("eeg-adventure");
    const nextBtn = () => Array.from(doc.querySelectorAll<HTMLButtonElement>(".nav .btn")).pop()!;
    for (let i = 0; i < 5; i++) nextBtn().click();
    expect(doc.querySelector(".star")).toBeTruthy();
    nextBtn().click();
    expect(doc.querySelector(".breath")).toBeTruthy();
    dom.window.close();
  });

  it("first-aid timer starts and resets", () => {
    const { doc, dom } = render("seizure-first-aid");
    const [start, reset] = Array.from(doc.querySelectorAll<HTMLButtonElement>(".timer .btn"));
    start.click();
    expect(start.textContent).toMatch(/Stop/);
    reset.click();
    expect(doc.querySelector(".clock")!.textContent).toBe("0:00");
    dom.window.close();
  });
});
