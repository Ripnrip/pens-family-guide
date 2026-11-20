import { readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";
import { describe, expect, it } from "vitest";
import { TOOLS, TOOL_ANNOTATIONS } from "../src/tools/index.js";
import { NEGATIVE_CASES, REVIEWER_CASES } from "../src/reviewer.js";
import { connectClient } from "./helpers.js";

const sub = JSON.parse(readFileSync(new URL("../chatgpt-app-submission.json", import.meta.url), "utf8"));
const schema = JSON.parse(readFileSync(new URL("./fixtures/chatgpt-app-submission.v1.schema.json", import.meta.url), "utf8"));

describe("chatgpt-app-submission.json", () => {
  it("validates against the official submission schema (v1)", () => {
    const ajv = new (Ajv2020 as unknown as typeof Ajv2020.default)({ strict: false, allErrors: true });
    const validate = ajv.compile(schema);
    const ok = validate(sub);
    expect(validate.errors ?? []).toEqual([]);
    expect(ok).toBe(true);
  });

  it("has PENS app info within the form limits", () => {
    expect(sub.app_info.display_name).toBe("PENS");
    expect(sub.app_info.subtitle.length).toBeLessThanOrEqual(30);
    expect(sub.app_info.description).toContain("BinaryBros LLC");
    expect(sub.app_info.description).toContain("Pediatric Epilepsy & Neurology Specialists");
    expect(schema.$defs.appInfo.properties.category.enum).toContain(sub.app_info.category);
  });

  it("lists exactly the registered tools, with annotations matching the live server", async () => {
    expect(Object.keys(sub.tools).sort()).toEqual(TOOLS.map((t) => t.name).sort());
    const ctx = await connectClient();
    try {
      const { tools } = await ctx.client.listTools();
      for (const t of tools) {
        const declared = sub.tools[t.name].annotations;
        expect(declared).toEqual({ ...TOOL_ANNOTATIONS });
        for (const k of Object.keys(declared)) expect((t.annotations as Record<string, unknown>)[k], `${t.name}.${k}`).toBe(declared[k]);
      }
    } finally {
      await ctx.close();
    }
  });

  it("gives a written justification for every annotation", () => {
    for (const [name, tool] of Object.entries<{ justifications: Record<string, string> }>(sub.tools)) {
      for (const k of ["read_only_justification", "open_world_justification", "destructive_justification", "idempotent_justification"]) {
        expect(tool.justifications[k]?.length ?? 0, `${name}.${k}`).toBeGreaterThan(40);
      }
    }
  });

  it("mirrors the /reviewer-demo prompts and only references real tools", () => {
    const names = new Set(TOOLS.map((t) => t.name));
    const prompts = new Set(REVIEWER_CASES.flatMap((c) => [c.prompt.en, c.prompt.es]));
    for (const tc of sub.test_cases) {
      expect(prompts.has(tc.user_prompt), tc.user_prompt).toBe(true);
      expect(names.has(tc.tools_triggered), tc.tools_triggered).toBe(true);
    }
    const negatives = new Set(NEGATIVE_CASES.map((c) => c.prompt.en));
    for (const tc of sub.negative_test_cases) expect(negatives.has(tc.user_prompt)).toBe(true);
    // Every tool is exercised by at least one reviewer case.
    expect(new Set(REVIEWER_CASES.map((c) => c.tool))).toEqual(names);
  });
});
