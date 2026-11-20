import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { findPhiKeys, guardInput, scrubPhi } from "../src/safety/index.js";
import { executeTool, getTool } from "../src/tools/index.js";
import { connectClient } from "./helpers.js";

describe("PHI scrubbing", () => {
  const cases: [string, string, string][] = [
    ["My son's name is Jake Smith and he has headaches", "name", "Jake"],
    ["Mi hija se llama Sofía y tiene convulsiones", "name", "Sofía"],
    ["born 03/14/2018", "date", "03/14/2018"],
    ["DOB: 2018-03-14", "date", "2018-03-14"],
    ["nació el 14 de marzo de 2018", "date", "14 de marzo de 2018"],
    ["his birthday is March 14, 2018", "date", "March 14, 2018"],
    ["MRN 12345678", "record_number", "12345678"],
    ["medical record number: A-99812", "record_number", "A-99812"],
    ["número de expediente 445566", "record_number", "445566"],
    ["call me at 813-555-0199", "phone", "555-0199"],
    ["email mom@example.com", "email", "mom@example.com"],
    ["SSN 123-45-6789", "ssn", "123-45-6789"],
  ];
  for (const [input, kind, secret] of cases) {
    it(`removes ${kind} from "${input}"`, () => {
      const r = scrubPhi(input);
      expect(r.found).toContain(kind);
      expect(r.clean).not.toContain(secret);
    });
  }

  it("leaves ordinary text alone", () => {
    const r = scrubPhi("Does PENS see kids with ADHD? My son is 7 and has headaches for 3 weeks.");
    expect(r.found).toEqual([]);
    expect(r.clean).toContain("ADHD");
  });

  it("flags PHI-looking argument names", () => {
    expect(findPhiKeys({ patient_name: "x", dob: "y", lang: "en", concern: "z" }).sort()).toEqual(["dob", "patient_name"]);
    const g = guardInput({ child_name: "Ana", concern: "headaches" } as Record<string, unknown>);
    expect(g.args).not.toHaveProperty("child_name");
    expect(g.phiKeys).toEqual(["child_name"]);
  });

  it("tools never echo PHI back and add a privacy notice", () => {
    const res = executeTool(getTool("find_care")!, { concern: "My daughter's name is Emma Lopez, DOB 04/02/2017, MRN 99887766. She has migraines." });
    const blob = JSON.stringify(res);
    for (const s of ["Emma", "Lopez", "04/02/2017", "99887766"]) expect(blob).not.toContain(s);
    expect(res.structuredContent.privacyNotice).toBeTruthy();
    expect((res.structuredContent.items as { id: string }[])[0].id).toBe("headache");
  });
});

describe("PHI refusal at the MCP boundary", () => {
  let ctx: Awaited<ReturnType<typeof connectClient>>;
  beforeAll(async () => { ctx = await connectClient(); });
  afterAll(async () => { await ctx.close(); });

  it("rejects calls that include PHI fields", async () => {
    let refused = false;
    try {
      const res = await ctx.client.callTool({ name: "request_appointment", arguments: { patient_name: "Jake Smith", dob: "2018-03-14" } });
      refused = !!res.isError;
      expect(JSON.stringify(res.structuredContent ?? {})).not.toContain("Jake");
    } catch {
      refused = true;
    }
    expect(refused).toBe(true);
  });
});
