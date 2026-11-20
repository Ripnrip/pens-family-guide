import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { allStrings, connectClient } from "./helpers.js";
import { TOOLS } from "../src/tools/index.js";
import { LANGS } from "../src/content/index.js";

const SAMPLE_ARGS: Record<string, Record<string, unknown>> = {
  find_care: { concern: "my son has headaches" },
  prepare_for_visit: { visit_type: "sleep_deprived_eeg" },
  school_seizure_plan: { audience: "school_staff" },
};

describe("every tool returns valid structuredContent in EN and ES", () => {
  let ctx: Awaited<ReturnType<typeof connectClient>>;
  beforeAll(async () => { ctx = await connectClient(); });
  afterAll(async () => { await ctx.close(); });

  for (const def of TOOLS) {
    for (const lang of LANGS) {
      it(`${def.name} (${lang})`, async () => {
        const res = await ctx.client.callTool({ name: def.name, arguments: { ...(SAMPLE_ARGS[def.name] ?? {}), lang } });
        expect(res.isError).toBeFalsy();
        const sc = res.structuredContent as Record<string, unknown>;
        expect(sc).toBeTruthy();
        expect(sc.tool).toBe(def.name);
        expect(sc.lang).toBe(lang);
        expect(typeof sc.disclaimer).toBe("string");
        expect((sc.disclaimer as string).length).toBeGreaterThan(20);
        expect(sc.labels).toBeTypeOf("object");
        expect(sc.contentReview).toMatchObject({ status: "pending" });
        expect(sc.emergency).toBeUndefined();
        // Round-trips as JSON and has no empty strings.
        expect(JSON.parse(JSON.stringify(sc))).toEqual(sc);
        for (const s of allStrings(sc)) expect(s.trim().length).toBeGreaterThan(0);
        const text = (res.content as { type: string; text: string }[])[0];
        expect(text.type).toBe("text");
        expect(text.text.length).toBeGreaterThan(20);
      });
    }

    it(`${def.name} localizes labels between EN and ES`, async () => {
      const [en, es] = await Promise.all(
        LANGS.map((lang) => ctx.client.callTool({ name: def.name, arguments: { ...(SAMPLE_ARGS[def.name] ?? {}), lang } })),
      );
      const enSc = en.structuredContent as Record<string, unknown>;
      const esSc = es.structuredContent as Record<string, unknown>;
      expect(esSc.disclaimer).not.toEqual(enSc.disclaimer);
      expect(JSON.stringify(esSc.labels)).not.toEqual(JSON.stringify(enSc.labels));
    });
  }

  it("defaults language from the openai/locale hint, then Spanish free text", async () => {
    const { executeTool, getTool } = await import("../src/tools/index.js");
    const ci = getTool("clinic_info")!;
    expect(executeTool(ci, {}, { meta: { "openai/locale": "es-MX" } }).structuredContent.lang).toBe("es");
    expect(executeTool(ci, {}, { meta: { "openai/locale": "en-US" } }).structuredContent.lang).toBe("en");
    const fc = getTool("find_care")!;
    expect(executeTool(fc, { concern: "mi hija tiene dolor de cabeza" }).structuredContent.lang).toBe("es");
  });

  it("find_care matches ADHD, headaches and Spanish concerns", async () => {
    const { matchCare } = await import("../src/tools/findCare.js");
    expect(matchCare("does PENS see kids with ADHD?").map((m) => m.item.id)).toContain("adhd");
    expect(matchCare("does PENS see kids with ADHD?").map((m) => m.item.id)).toContain("adhd-testing");
    expect(matchCare("my son has headaches")[0].item.id).toBe("headache");
    expect(matchCare("mi hijo tiene convulsiones")[0].item.id).toBe("epilepsy");
    expect(matchCare("necesito un electroencefalograma").map((m) => m.item.id)).toContain("eeg");
    expect(matchCare("what's your address?")).toHaveLength(0);
  });

  it("clinic_info includes computed open-now status", async () => {
    const res = await ctx.client.callTool({ name: "clinic_info", arguments: { lang: "en" } });
    const sc = res.structuredContent as { status: { state: string; label: string } };
    expect(["open", "lunch", "closed"]).toContain(sc.status.state);
    expect(sc.status.label).toMatch(/Open|Closed/);
  });
});
