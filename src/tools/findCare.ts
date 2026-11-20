import { AGE_NOTE, ALL_CARE, CLINIC, CONDITIONS, UI, type CareItem, type Lang } from "../content/index.js";
import { normalizeText } from "../safety/normalize.js";
import { defineTool, freeText, langParam } from "./types.js";

export interface CareMatch {
  item: CareItem;
  score: number;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Keyword match: a keyword matches when it starts at a word boundary (so "epilep" matches "epileptic"). */
export function matchCare(concern: string, max = 4): CareMatch[] {
  const text = ` ${normalizeText(concern)} `;
  const scored = ALL_CARE.map((item) => {
    let score = 0;
    for (const kw of item.keywords) {
      if (new RegExp(`(?<![a-z0-9])${escapeRe(kw)}`).test(text)) score += kw.length > 4 ? 2 : 1;
    }
    return { item, score };
  })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score || (a.item.kind === "condition" ? -1 : 1));

  // Add related services of matched conditions.
  const result: CareMatch[] = [];
  const seen = new Set<string>();
  const push = (m: CareMatch) => {
    if (!seen.has(m.item.id) && result.length < max) {
      seen.add(m.item.id);
      result.push(m);
    }
  };
  for (const m of scored) push(m);
  for (const m of scored) {
    for (const rel of m.item.related ?? []) {
      const item = ALL_CARE.find((c) => c.id === rel);
      if (item) push({ item, score: 0 });
    }
  }
  return result;
}

function view(item: CareItem, lang: Lang) {
  return {
    id: item.id,
    kind: item.kind,
    icon: item.icon,
    title: item.title[lang],
    summary: item.summary[lang],
    nextStep: item.nextStep[lang],
    clinicReview: item.clinicReview,
  };
}

export const findCare = defineTool({
  name: "find_care",
  title: "Find care at PENS",
  description:
    "Match a parent's plain-language concern about their child (e.g. 'does PENS see kids with ADHD?', 'my son has headaches', 'staring spells', 'necesito un EEG') to the pediatric neurology conditions PENS treats and services it offers (EEG, video EEG, ADHD testing, neuropsychology, behavioral health, research), with the next step to get care. General information only; does not diagnose. Safety: if the concern describes an emergency, the result leads with a call-911 card.",
  widget: "find-care",
  invoking: "Finding care at PENS… / Buscando atención en PENS…",
  invoked: "Care options at PENS / Opciones de atención en PENS",
  input: {
    concern: freeText("The concern in the parent's own words, e.g. 'my daughter has migraines'."),
    lang: langParam,
  },
  handler: ({ concern }, { lang }) => {
    const matches = matchCare(concern);
    const items = matches.map((m) => view(m.item, lang));
    const es = lang === "es";
    const general = es
      ? "PENS atiende muchas condiciones neurológicas en niños. Llame a la oficina para preguntar si PENS es adecuado para su hijo."
      : "PENS cares for many neurological conditions in children. Call the office to ask whether PENS is the right fit for your child.";
    const structured = {
      matched: items.length > 0,
      items,
      general: items.length ? undefined : general,
      conditionsWeTreat: CONDITIONS.map((c) => ({ id: c.id, icon: c.icon, title: c.title[lang] })),
      ageNote: AGE_NOTE[lang],
      actions: {
        requestAppointmentUrl: CLINIC.links.requestAppointment,
        phone: CLINIC.phone,
        phoneHref: CLINIC.phoneHref,
      },
      labels: {
        heading: es ? "Cómo puede ayudar PENS" : "How PENS can help",
        condition: es ? "Condición" : "Condition",
        service: es ? "Servicio" : "Service",
        nextStep: es ? "Próximo paso" : "Next step",
        requestAppointment: UI.requestAppointment[lang],
        call: UI.call[lang],
        conditionsHeading: es ? "Condiciones que atiende PENS" : "Conditions PENS treats",
        prepPrompt: es ? "¿Cómo me preparo para la visita?" : "How do I prepare for the visit?",
      },
    };
    const text = items.length
      ? [
          es ? "PENS puede ayudar con:" : "PENS can help with:",
          ...items.map((i) => `- ${i.title}: ${i.summary} ${es ? "Próximo paso" : "Next step"}: ${i.nextStep}`),
          `${es ? "Teléfono" : "Phone"}: ${CLINIC.phone}`,
        ].join("\n")
      : `${general}\n${es ? "Condiciones" : "Conditions"}: ${CONDITIONS.map((c) => c.title[lang]).join(", ")}.\n${es ? "Teléfono" : "Phone"}: ${CLINIC.phone}`;
    return { structured, text };
  },
});
