import { z } from "zod";
import { VISIT_TYPES, VISITS, type Lang, type VisitPrep } from "../content/index.js";
import { defineTool, langParam } from "./types.js";

export function visitView(v: VisitPrep, lang: Lang) {
  return {
    type: v.type,
    icon: v.icon,
    title: v.title[lang],
    checklist: v.checklist.map((c) => ({ id: c.id, text: c.text[lang] })),
    bring: v.bring[lang],
    expect: v.expect[lang],
    kidVersion: v.kidVersion[lang],
    clinicReview: v.clinicReview,
  };
}

export const prepareForVisit = defineTool({
  name: "prepare_for_visit",
  title: "Prepare for a PENS visit",
  description:
    "Checklist, what to bring, what to expect, and a kid-friendly explanation for a PENS visit type: first_visit, routine_eeg, sleep_deprived_eeg, video_eeg (monitoring stay), adhd_testing (computerized), or neuropsych_eval. Use when a family asks how to get ready for an appointment or test at PENS.",
  widget: "visit-prep",
  invoking: "Building your visit checklist… / Preparando su lista…",
  invoked: "Visit checklist ready / Lista de visita lista",
  widgetAccessible: true,
  input: {
    visit_type: z
      .enum(VISIT_TYPES)
      .optional()
      .describe("Which visit to prepare for. Defaults to first_visit."),
    lang: langParam,
  },
  handler: ({ visit_type }, { lang }) => {
    const type = visit_type ?? "first_visit";
    const v = VISITS.find((x) => x.type === type)!;
    const view = visitView(v, lang);
    const es = lang === "es";
    return {
      structured: {
        visit: view,
        visitTypes: VISITS.map((x) => ({ type: x.type, icon: x.icon, title: x.title[lang] })),
        labels: {
          checklist: es ? "Lista de preparación" : "Checklist",
          bring: es ? "Qué traer" : "What to bring",
          expect: es ? "Qué esperar" : "What to expect",
          kid: es ? "Para niños" : "For kids",
          grownUp: es ? "Para adultos" : "For grown-ups",
          done: es ? "listo" : "done",
          allSet: es ? "¡Todo listo!" : "All set!",
          progress: es ? "Progreso de la lista" : "Checklist progress",
          storyPrompt: es ? "Muéstrame el cuento Mi día de EEG" : "Show me the My EEG Day story",
        },
      },
      widgetMeta: { allVisits: Object.fromEntries(VISITS.map((x) => [x.type, visitView(x, lang)])) },
      text: [
        `${view.icon} ${view.title}`,
        `${es ? "Lista" : "Checklist"}:`,
        ...view.checklist.map((c) => `- [ ] ${c.text}`),
        `${es ? "Qué traer" : "Bring"}: ${view.bring.join("; ")}`,
        `${es ? "Qué esperar" : "Expect"}: ${view.expect.join("; ")}`,
        `${es ? "Para niños" : "For kids"}: ${view.kidVersion}`,
      ].join("\n"),
    };
  },
});
