import { z } from "zod";
import { CAREGIVER_CIRCLE, CLINIC, EPILEPSY_TRAINING_URL, HB1201, UI } from "../content/index.js";
import { defineTool, freeText, langParam } from "./types.js";

export const schoolSeizurePlan = defineTool({
  name: "school_seizure_plan",
  title: "School seizure action plan (Florida HB 1201)",
  description:
    "Explain Florida CS/HB 1201 (effective July 1, 2026) for parents and school staff: what an Individualized Seizure Action Plan (ISAP) is, that it must be developed and signed by a medical professional, that charter schools are included, that staff who teach or transport the student need training, how to request a plan from PENS, and a caregiver-circle checklist with free seizure first-aid training links.",
  widget: "school-plan",
  invoking: "Opening the school plan guide… / Abriendo la guía escolar…",
  invoked: "School seizure plan guide / Guía del plan escolar",
  input: {
    audience: z.enum(["parent", "school_staff"]).optional().describe("Who is asking. Defaults to parent."),
    question: freeText("Optional: the user's question about school seizure plans.").optional(),
    lang: langParam,
  },
  handler: ({ audience }, { lang }) => {
    const es = lang === "es";
    const who = audience ?? "parent";
    const staffNote = es
      ? "Personal escolar: pida a la familia el ISAP firmado y complete la capacitación de primeros auxilios para convulsiones."
      : "School staff: ask the family for the signed ISAP and complete seizure first-aid training.";
    return {
      structured: {
        audience: who,
        title: HB1201.title[lang],
        summary: HB1201.summary[lang],
        isapWhat: HB1201.isapWhat[lang],
        requestSteps: HB1201.requestSteps[lang],
        staffNote: who === "school_staff" ? staffNote : undefined,
        sourceNote: HB1201.sourceNote[lang],
        circle: CAREGIVER_CIRCLE.map((m) => ({ id: m.id, icon: m.icon, role: m.role[lang], tip: m.tip[lang] })),
        trainingUrl: EPILEPSY_TRAINING_URL,
        phone: CLINIC.phone,
        phoneHref: CLINIC.phoneHref,
        labels: {
          law: es ? "Lo que dice la ley" : "What the law says",
          isap: es ? "¿Qué es un ISAP?" : "What is an ISAP?",
          request: es ? "Cómo pedir un plan a PENS" : "How to request a plan from PENS",
          circle: es ? "Su círculo de cuidado" : "Your caregiver circle",
          circleHint: es ? "Marque a quien ya tiene el plan y la capacitación." : "Check off who has the plan and training.",
          training: es ? "Capacitación gratuita (Epilepsy Foundation)" : "Free training (Epilepsy Foundation)",
          call: UI.callOffice[lang],
          ready: es ? "listos" : "ready",
        },
      },
      text: [
        HB1201.title[lang],
        ...HB1201.summary[lang].map((s) => `- ${s}`),
        HB1201.isapWhat[lang],
        ...(who === "school_staff" ? [staffNote] : []),
        `${es ? "Cómo pedirlo" : "How to request"}:`,
        ...HB1201.requestSteps[lang].map((s, i) => `${i + 1}. ${s}`),
        `${es ? "Capacitación" : "Training"}: ${EPILEPSY_TRAINING_URL}`,
        HB1201.sourceNote[lang],
      ].join("\n"),
    };
  },
});
