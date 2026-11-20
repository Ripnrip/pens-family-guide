import type { L } from "./types.js";

/** Shared, non-clinical UI strings. */
export const UI = {
  disclaimer: {
    en: "General education only, not medical advice. PENS cannot diagnose or give treatment or dosing advice here. For emergencies call 911.",
    es: "Solo información educativa general, no es consejo médico. PENS no puede diagnosticar ni dar consejos de tratamiento o dosis aquí. En emergencias llame al 911.",
  },
  privacyNotice: {
    en: "For your privacy, please don't share names, birthdates, or medical record details here. We removed what looked like personal information.",
    es: "Por su privacidad, no comparta nombres, fechas de nacimiento ni datos del expediente médico aquí. Eliminamos lo que parecía información personal.",
  },
  call: { en: "Call", es: "Llamar" },
  callOffice: { en: "Call the office", es: "Llamar a la oficina" },
  call911: { en: "Call 911", es: "Llamar al 911" },
  requestAppointment: { en: "Request appointment", es: "Solicitar cita" },
  patientPortal: { en: "Patient portal (healow)", es: "Portal del paciente (healow)" },
  website: { en: "Website", es: "Sitio web" },
  directions: { en: "Directions", es: "Cómo llegar" },
  todoVerify: {
    en: "Link pending verification",
    es: "Enlace pendiente de verificación",
  },
  pendingReview: {
    en: "Draft content pending PENS clinical review",
    es: "Contenido preliminar pendiente de revisión clínica de PENS",
  },
} satisfies Record<string, L>;
