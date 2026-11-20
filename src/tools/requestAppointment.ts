import { APPOINTMENT_READY, CLINIC, HOURS_SUMMARY, UI } from "../content/index.js";
import { defineTool, langParam } from "./types.js";

export const requestAppointment = defineTool({
  name: "request_appointment",
  title: "Request a PENS appointment",
  description:
    "Hand off to PENS's official ways to request an appointment: the website request form and the office phone, plus what information to have ready. This tool does NOT collect or send any personal information; never ask the user for names, birthdates, or medical details in chat.",
  widget: "appointment-handoff",
  invoking: "Getting appointment options… / Buscando opciones de cita…",
  invoked: "How to request an appointment / Cómo solicitar una cita",
  input: { lang: langParam },
  handler: (_args, { lang }) => {
    const es = lang === "es";
    return {
      structured: {
        options: [
          { id: "form", icon: "📝", label: UI.requestAppointment[lang], href: CLINIC.links.requestAppointment, verified: false },
          { id: "phone", icon: "📞", label: `${UI.call[lang]} ${CLINIC.phone}`, href: CLINIC.phoneHref, verified: true },
        ],
        haveReady: APPOINTMENT_READY[lang],
        hours: HOURS_SUMMARY[lang],
        privacy: es
          ? "Este chat no programa citas ni guarda información. Comparta los datos de su hijo solo con la oficina, o el formulario oficial."
          : "This chat doesn't book appointments or store information. Share your child's details only with the office or the official form.",
        labels: {
          heading: es ? "Solicitar una cita en PENS" : "Request a PENS appointment",
          haveReady: es ? "Tenga esto a mano" : "Have this ready",
          hours: es ? "Horario de la oficina" : "Office hours",
          unverified: es ? "enlace por verificar" : "link to verify",
        },
      },
      text: [
        es ? "Para solicitar una cita en PENS:" : "To request a PENS appointment:",
        `- ${es ? "Formulario" : "Form"}: ${CLINIC.links.requestAppointment}`,
        `- ${es ? "Teléfono" : "Phone"}: ${CLINIC.phone}`,
        `${es ? "Tenga a mano" : "Have ready"}: ${APPOINTMENT_READY[lang].join("; ")}.`,
        es ? "No comparta datos personales en este chat." : "Please don't share personal details in this chat.",
      ].join("\n"),
    };
  },
});
