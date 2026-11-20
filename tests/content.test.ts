import { describe, expect, it } from "vitest";
import * as content from "../src/content/index.js";
import { clinicalItems, LANGS } from "../src/content/index.js";

/** Walk any value; every object with both `en` and `es` keys must have non-empty, distinct-typed values. */
function checkBilingual(value: unknown, path: string, problems: string[]) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) return value.forEach((v, i) => checkBilingual(v, `${path}[${i}]`, problems));
  const obj = value as Record<string, unknown>;
  if ("en" in obj || "es" in obj) {
    for (const l of LANGS) {
      const v = obj[l];
      const empty = v === undefined || v === "" || (Array.isArray(v) && (v.length === 0 || v.some((x) => !x)));
      if (empty) problems.push(`${path}.${l}`);
    }
    if (Array.isArray(obj.en) && Array.isArray(obj.es) && obj.en.length !== obj.es.length) problems.push(`${path} en/es length mismatch`);
  }
  for (const [k, v] of Object.entries(obj)) checkBilingual(v, `${path}.${k}`, problems);
}

describe("knowledge module", () => {
  it("has every user-facing string in English and Spanish", () => {
    const problems: string[] = [];
    for (const [name, value] of Object.entries(content)) checkBilingual(value, name, problems);
    expect(problems).toEqual([]);
  });

  it("flags every clinical item for PENS clinician review", () => {
    const items = clinicalItems();
    expect(items.length).toBeGreaterThan(30);
    for (const i of items) expect(["pending", "approved"]).toContain(i.clinicReview);
    // Launch gate: until clinicians sign off, everything stays pending.
    expect(items.filter((i) => i.clinicReview !== "pending").map((i) => i.id)).toEqual([]);
  });

  it("uses unique clinical item ids", () => {
    const ids = clinicalItems().map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has a 5-question quiz with 4 answers each and valid correct indexes", () => {
    expect(content.QUIZ).toHaveLength(5);
    for (const q of content.QUIZ) {
      for (const l of LANGS) expect(q.answers[l]).toHaveLength(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(4);
    }
  });

  it("covers all six visit types", () => {
    expect(content.VISITS.map((v) => v.type).sort()).toEqual([...content.VISIT_TYPES].sort());
  });

  it("uses the confirmed clinic facts", () => {
    expect(content.CLINIC.address.full).toBe("508 S. Habana Ave., Suite 340, Tampa, FL 33609");
    expect(content.CLINIC.phone).toBe("(813) 873-7367");
    expect(content.CLINIC.fax).toBe("(813) 875-9722");
    expect(content.EPILEPSY_TRAINING_URL).toBe("https://www.epilepsy.com/programs/training-education");
  });
});
