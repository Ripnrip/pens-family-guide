import { CLINIC, REFERRAL } from "../content/index.js";
import { defineTool, freeText, langParam } from "./types.js";

export const forPediatricians = defineTool({
  name: "for_pediatricians",
  title: "Referring to PENS (for providers)",
  description:
    "Referral information for pediatricians and other referring providers sending patients to PENS: fax and phone, what to include with a referral, and when to call for urgent vs. routine referrals (emergencies go to the ED). Use when a clinician or office staff asks how to refer to PENS. Never enter patient information.",
  widget: "referral-card",
  invoking: "Getting referral info… / Obteniendo información de referidos…",
  invoked: "PENS referral info / Información de referidos",
  input: {
    question: freeText("Optional: the provider's question about referring.").optional(),
    lang: langParam,
  },
  handler: (_args, { lang }) => {
    const es = lang === "es";
    return {
      structured: {
        fax: CLINIC.fax,
        phone: CLINIC.phone,
        phoneHref: CLINIC.phoneHref,
        include: REFERRAL.include[lang],
        urgent: REFERRAL.urgent[lang],
        routine: REFERRAL.routine[lang],
        emergencyGuidance: REFERRAL.emergency[lang],
        note: REFERRAL.note[lang],
        address: CLINIC.address.full,
        labels: {
          heading: es ? "Referir a PENS" : "Refer to PENS",
          fax: es ? "Fax de referidos" : "Referral fax",
          phone: es ? "Teléfono" : "Phone",
          include: es ? "Incluya" : "Please include",
          urgent: es ? "Urgente" : "Urgent",
          routine: es ? "Rutina" : "Routine",
          emergency: es ? "Emergencia" : "Emergency",
          call: es ? "Llamar a la oficina" : "Call the office",
        },
      },
      text: [
        `${es ? "Fax de referidos" : "Referral fax"}: ${CLINIC.fax} · ${es ? "Teléfono" : "Phone"}: ${CLINIC.phone}`,
        `${es ? "Incluya" : "Include"}: ${REFERRAL.include[lang].join("; ")}.`,
        REFERRAL.urgent[lang],
        REFERRAL.routine[lang],
        REFERRAL.emergency[lang],
        REFERRAL.note[lang],
      ].join("\n"),
    };
  },
});
