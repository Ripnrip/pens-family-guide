import { ACTION_PLAN_NOTE, CALL_911_WHEN, FIRST_AID_DONTS, FIRST_AID_STEPS, TIMER_THRESHOLDS } from "../content/index.js";
import { defineTool, freeText, langParam } from "./types.js";

export const seizureFirstAid = defineTool({
  name: "seizure_first_aid",
  title: "Seizure first aid (Stay, Safe, Side)",
  description:
    "General seizure first-aid steps from widely published public guidance (Stay, Safe, Side; time it; what not to do; when to call 911), with a large seizure timer a caregiver can start. Use when someone asks what to do during a seizure. Not a substitute for the child's own seizure action plan. If the situation describes an emergency, the result leads with a call-911 card.",
  widget: "seizure-first-aid",
  invoking: "Opening seizure first aid… / Abriendo primeros auxilios…",
  invoked: "Seizure first aid / Primeros auxilios para convulsiones",
  input: {
    situation: freeText("Optional: what is happening, in the caregiver's words.").optional(),
    lang: langParam,
  },
  handler: (_args, { lang }) => {
    const es = lang === "es";
    const steps = FIRST_AID_STEPS.map((s) => ({ id: s.id, keyword: s.keyword[lang], icon: s.icon, title: s.title[lang], points: s.points[lang] }));
    return {
      structured: {
        steps,
        donts: FIRST_AID_DONTS.items[lang],
        call911When: CALL_911_WHEN.items[lang],
        actionPlanNote: ACTION_PLAN_NOTE[lang],
        timer: TIMER_THRESHOLDS,
        labels: {
          heading: es ? "Primeros auxilios para convulsiones" : "Seizure first aid",
          start: es ? "Iniciar cronómetro" : "Start timer",
          stop: es ? "Detener" : "Stop",
          reset: es ? "Reiniciar" : "Reset",
          timerHint: es ? "Inicie el cronómetro cuando empiece la convulsión." : "Start the timer when the seizure starts.",
          warn: es ? "Casi 5 minutos: prepárese para llamar al 911." : "Almost 5 minutes: get ready to call 911.",
          callNow: es ? "5 minutos: llame al 911 ahora." : "5 minutes: call 911 now.",
          call911: es ? "Llamar al 911" : "Call 911",
          donts: es ? "No haga esto" : "Do not",
          when911: es ? "Llame al 911 si…" : "Call 911 if…",
        },
      },
      text: [
        es ? "Primeros auxilios generales para convulsiones:" : "General seizure first aid:",
        ...steps.map((s) => `- ${s.keyword}: ${s.title}. ${s.points.join("; ")}.`),
        `${es ? "No" : "Don't"}: ${FIRST_AID_DONTS.items[lang].join("; ")}.`,
        `${es ? "Llame al 911 si" : "Call 911 if"}: ${CALL_911_WHEN.items[lang].join("; ")}.`,
        ACTION_PLAN_NOTE[lang],
      ].join("\n"),
    };
  },
});
