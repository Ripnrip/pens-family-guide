import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderPreview } from "../src/app.js";
import { FREDOKA_600_WOFF2_BASE64 } from "../src/brand/fonts/fredoka.js";
import { FONT_FACE_CSS } from "../src/widgets/shared.js";
import { WIDGET_IDS, WIDGETS, widgetHtml, type WidgetId } from "../src/widgets/index.js";

type Mode = "reduced" | "motion";

/**
 * Render a widget preview in jsdom. "reduced" answers prefers-reduced-motion: reduce; "motion" does not
 * and routes the page's timers, requestAnimationFrame and Date through vitest's fake timers so tests
 * can fast-forward every animation.
 */
function render(id: WidgetId, mode: Mode, query: Record<string, string> = {}) {
  const errors: string[] = [];
  const vc = new VirtualConsole();
  vc.on("error", (e) => errors.push(String(e)));
  vc.on("jsdomError", (e) => errors.push(String(e)));
  if (mode === "motion") vi.useFakeTimers();
  const dom = new JSDOM(renderPreview(id, query), {
    runScripts: "dangerously",
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(win) {
      const w = win as unknown as Record<string, unknown>;
      w.matchMedia = (q: string) => ({
        matches: mode === "reduced" && q.includes("reduce"),
        media: q, onchange: null,
        addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false,
      });
      if (mode === "motion") {
        w.setTimeout = (fn: () => void, ms?: number) => setTimeout(fn, ms);
        w.clearTimeout = (t: ReturnType<typeof setTimeout>) => clearTimeout(t);
        w.setInterval = (fn: () => void, ms?: number) => setInterval(fn, ms);
        w.clearInterval = (t: ReturnType<typeof setInterval>) => clearInterval(t);
        w.requestAnimationFrame = (cb: (t: number) => void) => setTimeout(() => cb(Date.now()), 16);
        w.cancelAnimationFrame = (t: ReturnType<typeof setTimeout>) => clearTimeout(t);
        w.Date = Date;
      }
    },
  });
  const doc = dom.window.document;
  const settle = (ms = 3000) => { if (mode === "motion") vi.advanceTimersByTime(ms); };
  return { dom, doc, errors, settle, root: doc.getElementById("root")! };
}

afterEach(() => { vi.useRealTimers(); });

/** Every typewriter target shows (aria-hidden copy) exactly what screen readers get (sr-only copy). */
function expectTypedComplete(root: HTMLElement) {
  expect(root.querySelector(".pm-caret, .pm-tw-rest")).toBeNull();
  for (const sr of root.querySelectorAll(".sr-only")) {
    const vis = sr.nextElementSibling;
    if (vis && vis.getAttribute("aria-hidden") === "true" && vis.parentElement === sr.parentElement && sr.parentElement!.childElementCount === 2) {
      expect(vis.textContent).toBe(sr.textContent);
    }
  }
}

describe("motion kit: every widget renders its final content", () => {
  for (const id of WIDGET_IDS) {
    for (const lang of ["en", "es"] as const) {
      it(`${id} (${lang}) with reduced motion shows the final state at once`, () => {
        const { doc, errors, root, dom } = render(id, "reduced", { lang });
        expect(errors).toEqual([]);
        expect(root.querySelector(".footer")).toBeTruthy();
        expect(root.textContent!.length).toBeGreaterThan(50);
        expect(doc.documentElement.getAttribute("lang")).toBe(lang);
        // Nothing hidden, nothing mid-animation, nothing decorative left behind.
        expect(root.querySelector(".pm-fade, .pm-pop-in, .pm-boing, .pm-caret, .pm-tw-rest, .pm-sparks, .pm-confetti")).toBeNull();
        const h1 = root.querySelector("h1");
        if (h1) expect(h1.querySelector(".sr-only")).toBeNull();
        dom.window.close();
      });

      it(`${id} (${lang}) with motion on settles to the same final content`, () => {
        const { errors, root, settle, dom } = render(id, "motion", { lang });
        settle();
        expect(errors).toEqual([]);
        expect(root.querySelector(".footer")).toBeTruthy();
        expectTypedComplete(root);
        expect(root.querySelector(".pm-sparks, .pm-confetti")).toBeNull();
        // No IntersectionObserver in jsdom: fade-ups fall back to revealing on the next frame.
        for (const el of root.querySelectorAll(".pm-fade")) expect(el.classList.contains("is-in")).toBe(true);
        dom.window.close();
      });
    }
  }

  it("typewriter announces the final text once (sr-only copy, typed copy aria-hidden)", () => {
    const { root, settle, dom } = render("find-care", "motion");
    const h1 = root.querySelector("h1")!;
    const sr = h1.querySelector(".sr-only")!;
    const full = sr.textContent!;
    expect(full.length).toBeGreaterThan(3);
    const vis = h1.querySelector('[aria-hidden="true"]')!;
    expect(vis.textContent).toBe(full); // typed + reserved rest: no layout shift while typing
    expect(h1.querySelector(".pm-tw-rest")!.textContent!.length).toBeGreaterThan(0);
    vi.advanceTimersByTime(48);
    expect(h1.querySelector(".pm-tw-rest")!.textContent!.length).toBeLessThan(full.length);
    settle(700); // capped at ~600 ms
    expect(h1.querySelector(".pm-tw-rest")).toBeNull();
    expect(h1.querySelector(".sr-only")).toBe(sr); // same node: no re-announcement
    expect(sr.textContent).toBe(full);
    settle(1000);
    expect(h1.querySelector(".pm-caret")).toBeNull();
    dom.window.close();
  });

  it("motion never moves focus on load", () => {
    for (const id of ["find-care", "clinic-card", "visit-prep", "school-plan", "referral-card"] as WidgetId[]) {
      const { doc, settle, dom } = render(id, "motion");
      settle();
      expect(doc.activeElement === doc.body || doc.activeElement === null).toBe(true);
      dom.window.close();
    }
  });
});

describe("progress rings", () => {
  for (const mode of ["reduced", "motion"] as Mode[]) {
    it(`visit-prep ring fills as items are checked and says All set (${mode})`, () => {
      const { root, settle, dom } = render("visit-prep", mode);
      settle();
      const ring = root.querySelector<HTMLElement>('.pm-ring[role="progressbar"]')!;
      expect(ring).toBeTruthy();
      expect(ring.querySelector("svg circle.pm-ring-bar")).toBeTruthy();
      expect(ring.querySelector("svg circle.pm-ring-trk")).toBeTruthy();
      const boxes = Array.from(root.querySelectorAll<HTMLInputElement>('.vp-items input[type="checkbox"]'));
      const total = boxes.length;
      expect(ring.getAttribute("aria-valuemax")).toBe(String(total));
      expect(ring.getAttribute("aria-valuenow")).toBe("0");
      expect(root.querySelectorAll(".vp-items .pm-box path")).toHaveLength(total);
      boxes[0].click();
      settle();
      expect(ring.getAttribute("aria-valuenow")).toBe("1");
      expect(ring.querySelector(".pm-ring-lab")!.textContent).toBe(`1/${total}`);
      expect(root.querySelector(".vp-allset")).toBeNull();
      for (const b of boxes.slice(1)) b.click();
      settle();
      expect(ring.getAttribute("aria-valuenow")).toBe(String(total));
      expect(ring.querySelector(".pm-ring-lab")!.textContent).toBe(`${total}/${total}`);
      expect(ring.className).toContain("tone-success");
      expect((ring.querySelector(".pm-ring-bar") as SVGElement).style.strokeDashoffset).toBe("0");
      expect(root.querySelector(".vp-allset")!.textContent).toMatch(/All set!/);
      expect(root.querySelector(".pm-sparks")).toBeNull(); // sparkle layer cleans itself up
      dom.window.close();
    });

    it(`caregiver-quiz ends on an animated score ring with a count-up (${mode})`, () => {
      const { doc, root, settle, dom } = render("caregiver-quiz", mode);
      settle();
      (doc.querySelector(".btn.accent") as HTMLButtonElement).click();
      settle();
      for (let i = 0; i < 5; i++) {
        (doc.querySelector(".tile") as HTMLButtonElement).click();
        settle();
        expect(doc.querySelector(".feedback")!.textContent!.length).toBeGreaterThan(10);
        Array.from(doc.querySelectorAll<HTMLButtonElement>(".quiz > .btn")).find((b) => !b.hidden)!.click();
        settle();
      }
      const ring = root.querySelector<HTMLElement>('.pm-ring[role="progressbar"]')!;
      expect(ring).toBeTruthy();
      expect(ring.getAttribute("aria-valuemax")).toBe("5");
      const score = Number(ring.getAttribute("aria-valuenow"));
      expect(score).toBeGreaterThanOrEqual(0);
      expect(doc.querySelector(".score")!.textContent).toBe(`${score} / 5`);
      dom.window.close();
    });
  }

  it("quiz score counts up from 0 when motion is on", () => {
    const { doc, settle, dom } = render("caregiver-quiz", "motion");
    (doc.querySelector(".btn.accent") as HTMLButtonElement).click();
    for (let i = 0; i < 5; i++) {
      // Always pick the correct tile so the final score is 5.
      const tiles = Array.from(doc.querySelectorAll<HTMLButtonElement>(".tile"));
      const out = (dom.window as unknown as { __PENS_PREVIEW__: { toolOutput: { questions: { correctIndex: number }[] } } }).__PENS_PREVIEW__.toolOutput;
      tiles[out.questions[i].correctIndex].click();
      Array.from(doc.querySelectorAll<HTMLButtonElement>(".quiz > .btn")).find((b) => !b.hidden)!.click();
    }
    expect(doc.querySelector(".score")!.textContent).toBe("0 / 5");
    settle(450);
    const mid = Number(doc.querySelector(".score")!.textContent!.split(" ")[0]);
    expect(mid).toBeGreaterThan(0);
    settle(2000);
    expect(doc.querySelector(".score")!.textContent).toBe("5 / 5");
    expect(doc.querySelector(".pm-ring")!.className).toContain("tone-success");
    dom.window.close();
  });
});

describe("per-card motion", () => {
  it("seizure first aid stays calm: ring sweeps to 5:00, then Call 911 pops in", () => {
    const src = WIDGETS["seizure-first-aid"].script;
    expect(src).not.toMatch(/sparkle|confetti|typewriter/);
    const { doc, root, dom } = render("seizure-first-aid", "motion");
    const [start] = Array.from(doc.querySelectorAll<HTMLButtonElement>(".timer .btn"));
    const call = root.querySelector<HTMLAnchorElement>('.timer a[href="tel:911"]')!;
    const ring = root.querySelector(".timer .pm-ring")!;
    expect(ring.getAttribute("aria-hidden")).toBe("true"); // the sr-only timer speaks, not the ring
    expect(ring.querySelector(".clock")).toBeTruthy();
    start.click();
    vi.advanceTimersByTime(150 * 1000);
    const bar = ring.querySelector<SVGElement>(".pm-ring-bar")!;
    const C = Number(bar.style.strokeDasharray.split(" ")[0]);
    const half = Number(bar.style.strokeDashoffset);
    expect(half).toBeGreaterThan(C * 0.4);
    expect(half).toBeLessThan(C * 0.6);
    expect(call.hidden).toBe(true);
    vi.advanceTimersByTime(90 * 1000);
    expect(ring.className).toContain("tone-warn");
    vi.advanceTimersByTime(61 * 1000);
    expect(doc.querySelector(".clock")!.textContent).toBe("5:01");
    expect(call.hidden).toBe(false);
    expect(root.querySelector(".timer")!.className).toContain("call");
    expect(ring.className).toContain("tone-urgent");
    expect(Number(bar.style.strokeDashoffset)).toBe(0);
    expect(root.querySelector(".pm-sparks, .pm-confetti")).toBeNull();
    dom.window.close();
  });

  it("question card: ticks draw, count animates, the card springs in and flips languages", () => {
    const { doc, root, settle, dom } = render("question-card", "motion", { visit_type: "routine_eeg" });
    settle();
    const edit = Array.from(doc.querySelectorAll<HTMLButtonElement>(".qtools .btn")).pop();
    if (edit) { edit.click(); settle(); } // the preview may open on the card; go back to picking
    const opts = Array.from(root.querySelectorAll<HTMLButtonElement>(".qopt"));
    expect(opts.length).toBeGreaterThan(2);
    for (const o of opts) expect(o.querySelector(".pm-box path")).toBeTruthy();
    for (const o of opts) if (o.getAttribute("aria-pressed") === "true") o.click();
    opts[0].click();
    opts[1].click();
    expect(opts[0].getAttribute("aria-pressed")).toBe("true");
    settle();
    expect(root.querySelector(".qcount .sr-only")!.textContent).toMatch(/^2 /);
    expect(root.querySelector(".qcount .num")!.textContent).toBe("2");
    (root.querySelector(".qactions .btn") as HTMLButtonElement).click();
    const wrap = root.querySelector(".qflipwrap")!;
    expect(wrap.getAttribute("aria-live")).toBe("polite");
    expect(wrap.className).toContain("pm-pop-in");
    vi.advanceTimersByTime(300);
    expect(wrap.querySelector(".pm-sparks")).toBeTruthy();
    settle();
    expect(wrap.querySelector(".pm-sparks")).toBeNull();
    const firstLang = wrap.querySelector(".qcard h1")!.getAttribute("lang");
    (doc.querySelector(".qtools .btn") as HTMLButtonElement).click();
    // Mid-flip: the old face turns away (hidden from screen readers) over the new one.
    expect(wrap.querySelectorAll(".qcard")).toHaveLength(2);
    expect(wrap.querySelector(".qcard.q-leaving")!.getAttribute("aria-hidden")).toBe("true");
    settle(600);
    expect(wrap.querySelectorAll(".qcard")).toHaveLength(1);
    expect(wrap.querySelector(".qcard h1")!.getAttribute("lang")).not.toBe(firstLang);
    dom.window.close();
  });

  it("question card flips instantly under reduced motion", () => {
    const { doc, root, dom } = render("question-card", "reduced", { visit_type: "routine_eeg" });
    const edit = Array.from(doc.querySelectorAll<HTMLButtonElement>(".qtools .btn")).pop();
    if (edit) edit.click();
    const opt = root.querySelector<HTMLButtonElement>('.qopt[aria-pressed="false"]')!;
    opt.click();
    (root.querySelector(".qactions .btn") as HTMLButtonElement).click();
    const wrap = root.querySelector(".qflipwrap")!;
    const lang = wrap.querySelector(".qcard h1")!.getAttribute("lang");
    (doc.querySelector(".qtools .btn") as HTMLButtonElement).click();
    expect(wrap.querySelectorAll(".qcard")).toHaveLength(1);
    expect(wrap.querySelector(".qcard h1")!.getAttribute("lang")).not.toBe(lang);
    dom.window.close();
  });

  it("EEG adventure: Pip bounces in, stickers pop on, breathing loops, the finale throws confetti", () => {
    const { doc, root, settle, dom } = render("eeg-adventure", "motion");
    expect(root.querySelector(".pip-stage")!.className).toContain("eeg-bounce");
    const next = () => Array.from(doc.querySelectorAll<HTMLButtonElement>(".nav .btn")).pop()!;
    expect(root.querySelector(".pip-sticker")).toBeNull();
    for (let i = 0; i < 3; i++) { next().click(); settle(); }
    const stickers = root.querySelectorAll(".pip-bob .pip-sticker");
    expect(stickers).toHaveLength(5);
    expect(stickers[0].getAttribute("class")).toContain("eeg-pop");
    next().click(); settle();
    expect(root.querySelectorAll(".pip-sticker")).toHaveLength(5);
    expect(root.querySelector(".pip-sticker")!.getAttribute("class")).not.toContain("eeg-pop"); // already on
    next().click(); settle(); // hold still
    next().click(); settle(); // breathe
    const orb = root.querySelector(".breath")!;
    expect(orb.className).toContain("idle");
    (root.querySelector(".play .btn") as HTMLButtonElement).click();
    expect(orb.className).toContain("go");
    next().click(); // finale
    expect(root.querySelector(".pip-sticker")).toBeNull(); // stickers come off
    vi.advanceTimersByTime(400);
    expect(root.querySelector(".game .pm-confetti")).toBeTruthy();
    settle();
    expect(root.querySelector(".pm-confetti, .pm-sparks")).toBeNull();
    expectTypedComplete(root);
    dom.window.close();
  });

  it("school plan: caregiver checks pop and the ready count counts up", () => {
    const { root, settle, dom } = render("school-plan", "motion");
    const num = root.querySelector(".ready-num")!;
    settle();
    expect(num.textContent).toBe("0");
    const boxes = root.querySelectorAll<HTMLInputElement>(".member input.pm-check-input");
    expect(boxes.length).toBeGreaterThan(1);
    boxes[0].click();
    boxes[1].click();
    settle();
    expect(num.textContent).toBe("2");
    expect(root.querySelector(".member.done .pm-box path")).toBeTruthy();
    dom.window.close();
  });

  it("clinic card gives the open-now pill a breathing dot", () => {
    const html = widgetHtml("clinic-card");
    expect(html).toMatch(/\.status\.open \.dot \{ animation: clinic-breathe/);
    expect(html).toMatch(/@keyframes clinic-breathe/);
  });
});

describe("brand font", () => {
  it("embeds Fredoka 600 as a small WOFF2 data URI in every widget", () => {
    const bytes = Buffer.from(FREDOKA_600_WOFF2_BASE64, "base64");
    expect(bytes.subarray(0, 4).toString("latin1")).toBe("wOF2");
    expect(bytes.length).toBeLessThan(20 * 1024);
    expect(FONT_FACE_CSS.length).toBeLessThan(25 * 1024); // added to each widget's HTML
    for (const id of WIDGET_IDS) expect(widgetHtml(id)).toContain(FONT_FACE_CSS);
  });

  it("ships the OFL license next to the font", () => {
    const ofl = path.resolve(import.meta.dirname, "../src/brand/fonts/Fredoka-OFL.txt");
    expect(existsSync(ofl)).toBe(true);
    expect(readFileSync(ofl, "utf8")).toMatch(/SIL Open Font License, Version 1\.1/);
  });
});

describe("first-run intro splash", () => {
  it("plays once before the card, muted and inline, with Skip, then pops the content in", () => {
    const { doc, root, dom } = render("clinic-card", "motion");
    const splash = doc.querySelector<HTMLElement>(".pens-splash")!;
    expect(splash).toBeTruthy();
    expect(splash.nextElementSibling).toBe(root);
    expect(root.classList.contains("pens-splashing")).toBe(true);
    expect(root.querySelector(".footer")).toBeTruthy(); // the card is rendered underneath
    const video = splash.querySelector("video")!;
    expect(video.hasAttribute("muted")).toBe(true);
    expect(video.hasAttribute("autoplay")).toBe(true);
    expect(video.hasAttribute("playsinline")).toBe(true);
    expect(Array.from(video.querySelectorAll("source")).map((s) => s.getAttribute("src"))).toEqual(["/assets/intro.webm", "/assets/intro.mp4"]);
    const skip = splash.querySelector<HTMLButtonElement>(".pens-skip")!;
    expect(skip.textContent).toBe("Skip");
    expect(doc.activeElement).not.toBe(skip); // focus is not stolen
    skip.click();
    vi.advanceTimersByTime(300);
    expect(doc.querySelector(".pens-splash")).toBeNull();
    expect(root.classList.contains("pens-splashing")).toBe(false);
    expect(root.classList.contains("pens-revealed")).toBe(true);
    const api = (dom.window as unknown as { PENS: { api: { widgetState: () => Record<string, unknown>; setWidgetState: (s: object) => void } } }).PENS.api;
    expect(api.widgetState().pensIntro).toBe(1);
    api.setWidgetState({ other: true }); // widgets that overwrite their state keep the flag
    expect(api.widgetState().pensIntro).toBe(1);
    dom.window.close();
  });

  it("dismisses itself when the clip ends, or after ~4 s if it never plays", () => {
    const a = render("visit-prep", "motion");
    a.doc.querySelector("video")!.dispatchEvent(new a.dom.window.Event("playing"));
    a.doc.querySelector("video")!.dispatchEvent(new a.dom.window.Event("ended"));
    vi.advanceTimersByTime(300);
    expect(a.doc.querySelector(".pens-splash")).toBeNull();
    a.dom.window.close();
    vi.useRealTimers();
    const b = render("find-care", "motion", { lang: "es" });
    expect(b.doc.querySelector(".pens-skip")!.textContent).toBe("Saltar");
    vi.advanceTimersByTime(3900);
    expect(b.doc.querySelector(".pens-splash")).toBeTruthy();
    vi.advanceTimersByTime(400);
    expect(b.doc.querySelector(".pens-splash")).toBeNull();
    expect(b.root.classList.contains("pens-splashing")).toBe(false);
    b.dom.window.close();
  });

  it("never shows on seizure first aid, with an emergency card, under reduced motion, or with ?intro=off", () => {
    const cases: [WidgetId, Mode, Record<string, string>][] = [
      ["seizure-first-aid", "motion", {}],
      ["find-care", "motion", { concern: "he is not breathing" }],
      ["clinic-card", "reduced", {}],
      ["clinic-card", "motion", { intro: "off" }],
    ];
    for (const [id, mode, q] of cases) {
      const { doc, root, dom } = render(id, mode, q);
      expect(doc.querySelector(".pens-splash")).toBeNull();
      expect(root.classList.contains("pens-splashing")).toBe(false);
      dom.window.close();
      vi.useRealTimers();
    }
  });

  it("clinic card footer has a Replay intro link", () => {
    const { doc, dom } = render("clinic-card", "motion", { intro: "off" });
    const replay = doc.querySelector<HTMLButtonElement>(".footer .pens-replay")!;
    expect(replay.textContent).toBe("Replay intro");
    replay.click();
    expect(doc.querySelector(".pens-splash video")).toBeTruthy();
    dom.window.close();
    vi.useRealTimers();
    const r = render("clinic-card", "reduced");
    r.doc.querySelector<HTMLButtonElement>(".footer .pens-replay")!.click();
    expect(r.doc.querySelector(".pens-splash img")).toBeTruthy(); // reduced motion: poster only, briefly
    r.dom.window.close();
    expect(widgetHtml("visit-prep")).not.toContain("pens-replay\"");
  });

  it("widgets reference the clip by absolute URL on the app's own origin", async () => {
    const { PUBLIC_ORIGIN } = await import("../src/config.js");
    const html = widgetHtml("caregiver-quiz");
    expect(html).toContain(`window.__PENS_INTRO__ = {"origin":"${PUBLIC_ORIGIN}","mp4":"/assets/intro.mp4"`);
    expect(PUBLIC_ORIGIN).toMatch(/^https:\/\/[^/]+$/);
  });

  it("ships a small faststart H.264 clip, a VP9 WebM and the poster", () => {
    const dir = path.resolve(import.meta.dirname, "../public/assets");
    const mp4 = readFileSync(path.join(dir, "intro.mp4"));
    expect(mp4.length).toBeLessThanOrEqual(400 * 1024);
    expect(mp4.subarray(4, 8).toString("latin1")).toBe("ftyp");
    expect(mp4.indexOf("moov")).toBeLessThan(mp4.indexOf("mdat")); // faststart
    expect(mp4.indexOf("avc1")).toBeGreaterThan(0);
    expect(mp4.indexOf("soun")).toBe(-1); // no audio track
    const webm = readFileSync(path.join(dir, "intro.webm"));
    expect(webm.subarray(0, 4).toString("hex")).toBe("1a45dfa3");
    expect(webm.indexOf("V_VP9")).toBeGreaterThan(0);
    expect(readFileSync(path.join(dir, "intro-poster.jpg")).subarray(0, 2).toString("hex")).toBe("ffd8");
  });
});
