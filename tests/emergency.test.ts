import { describe, expect, it } from "vitest";
import { buildEmergencyCard, detectEmergency, type EmergencyCategory } from "../src/safety/index.js";
import { executeTool, getTool } from "../src/tools/index.js";

const POSITIVE: [string, EmergencyCategory][] = [
  ["My daughter has been seizing for 6 minutes", "prolonged_seizure"],
  ["seizure lasting more than five minutes", "prolonged_seizure"],
  ["the seizure won't stop", "prolonged_seizure"],
  ["he's having back to back seizures", "prolonged_seizure"],
  ["Lleva 7 minutos convulsionando", "prolonged_seizure"],
  ["la convulsión no para", "prolonged_seizure"],
  ["my son is having a seizure right now", "active_seizure"],
  ["mi hijo está convulsionando", "active_seizure"],
  ["she is not breathing", "not_breathing"],
  ["he's having trouble breathing after the seizure", "not_breathing"],
  ["mi hija no respira", "not_breathing"],
  ["his lips are turning blue", "blue_lips"],
  ["tiene los labios azules", "blue_lips"],
  ["se está poniendo morado", "blue_lips"],
  ["this is her first seizure ever", "first_seizure"],
  ["Es su primera convulsión", "first_seizure"],
  ["he hit his head when he fell during the seizure", "injury"],
  ["se golpeó la cabeza", "injury"],
  ["she won't wake up after the seizure", "wont_wake"],
  ["he is unresponsive", "wont_wake"],
  ["no despierta", "wont_wake"],
  ["he had a seizure in the pool", "water"],
  ["tuvo una convulsión en la piscina", "water"],
  ["my son swallowed a bunch of pills", "ingestion"],
  ["my teen said he wants to kill himself", "suicidal"],
  ["she's talking about suicide", "suicidal"],
  ["mi hijo dice que quiere morir", "suicidal"],
  ["he's been hurting himself", "suicidal"],
];

const NEGATIVE = [
  "does PENS see kids with ADHD?",
  "my son has headaches",
  "what should I bring to an EEG?",
  "her seizures usually last less than 2 minutes",
  "he had a seizure 10 minutes ago and is now awake and talking",
  "¿Atienden niños con autismo?",
  "mi hija tiene migrañas",
  "how do I get a school seizure plan?",
  "",
];

describe("emergency detector", () => {
  for (const [text, cat] of POSITIVE) {
    it(`flags ${cat}: "${text}"`, () => {
      const r = detectEmergency(text);
      expect(r.triggered).toBe(true);
      expect(r.categories).toContain(cat);
    });
  }
  for (const text of NEGATIVE) {
    it(`does not flag: "${text}"`, () => {
      expect(detectEmergency(text).triggered).toBe(false);
    });
  }

  it("builds a bilingual urgent card with 911 first and the office for non-emergencies", () => {
    const r = detectEmergency("seizure for 10 minutes");
    const en = buildEmergencyCard(r, "en")!;
    const es = buildEmergencyCard(r, "es")!;
    expect(en.actions[0]).toMatchObject({ href: "tel:911", kind: "urgent" });
    expect(en.title).toMatch(/911/);
    expect(es.title).toMatch(/911/);
    expect(es.title).not.toEqual(en.title);
    expect(en.nonEmergency).toContain("(813) 873-7367");
  });

  it("adds 988 for self-harm statements", () => {
    const card = buildEmergencyCard(detectEmergency("she wants to die"), "en")!;
    expect(card.actions.map((a) => a.href)).toContain("tel:988");
  });

  it("tools return the urgent card in structuredContent and lead the text with 911", () => {
    const res = executeTool(getTool("find_care")!, { concern: "my son's lips are blue and he's not breathing", lang: "en" });
    expect(res.structuredContent.emergency).toBeTruthy();
    expect(res.content[0].text.startsWith("⚠️")).toBe(true);
    expect(res.content[0].text).toMatch(/911/);

    const fa = executeTool(getTool("seizure_first_aid")!, { situation: "lleva 6 minutos convulsionando" });
    expect(fa.structuredContent.lang).toBe("es");
    expect((fa.structuredContent.emergency as { title: string }).title).toMatch(/911/);
  });

  it("does not attach an urgent card for ordinary questions", () => {
    const res = executeTool(getTool("find_care")!, { concern: "does PENS see kids with ADHD?" });
    expect(res.structuredContent.emergency).toBeUndefined();
  });
});
