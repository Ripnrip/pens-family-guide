import type { L, Reviewable } from "./types.js";

/** Info for referring providers. TODO-verify all items with PENS front office. */
export const REFERRAL: Reviewable & {
  include: L<string[]>;
  urgent: L;
  routine: L;
  emergency: L;
  note: L;
} = {
  id: "referral-guide",
  clinicReview: "pending",
  include: {
    en: [
      "Referral order with reason for referral and diagnosis/ICD-10 code",
      "Recent office notes and growth/vitals",
      "Relevant EEG, MRI/CT reports, and labs",
      "Current medication list and allergies",
      "Insurance information and authorization, if required",
      "Parent/guardian contact information",
      "Referring provider name, NPI, phone and fax for results",
    ],
    es: [
      "Orden de referido con motivo y diagnóstico/código ICD-10",
      "Notas recientes de consulta y crecimiento/signos vitales",
      "Reportes relevantes de EEG, MRI/CT y laboratorios",
      "Lista de medicamentos actuales y alergias",
      "Información del seguro y autorización, si se requiere",
      "Información de contacto del padre/tutor",
      "Nombre, NPI, teléfono y fax del proveedor que refiere, para los resultados",
    ],
  },
  urgent: {
    en: "Urgent but not emergent (e.g., new-onset seizures now stable, rapidly worsening symptoms): fax the referral AND call the office so the team can triage the timing.",
    es: "Urgente pero no de emergencia (p. ej., convulsiones nuevas ya estables, síntomas que empeoran rápido): envíe el referido por fax Y llame a la oficina para que el equipo determine la prioridad.",
  },
  routine: {
    en: "Routine: fax the referral with records. The office contacts the family to schedule.",
    es: "De rutina: envíe el referido por fax con los expedientes. La oficina contacta a la familia para programar.",
  },
  emergency: {
    en: "Emergencies (status epilepticus, altered consciousness, acute deficits) belong in the emergency department, not a referral.",
    es: "Las emergencias (estado epiléptico, alteración de la conciencia, déficits agudos) deben ir al departamento de emergencias, no a un referido.",
  },
  note: {
    en: "Send referrals by fax or phone only. Do not enter patient information in this chat.",
    es: "Envíe los referidos solo por fax o teléfono. No escriba información de pacientes en este chat.",
  },
};

export const APPOINTMENT_READY: L<string[]> = {
  en: [
    "Insurance card (and whether your plan needs a referral)",
    "Your pediatrician's name and office phone",
    "The main reason for the visit, in a sentence or two",
    "Names of past specialists and where any EEG or MRI was done",
    "Current medicines",
    "Days and times that work for you",
  ],
  es: [
    "Tarjeta del seguro (y si su plan necesita un referido)",
    "Nombre y teléfono del pediatra",
    "El motivo principal de la visita, en una o dos frases",
    "Nombres de especialistas anteriores y dónde se hizo algún EEG o MRI",
    "Medicamentos actuales",
    "Días y horarios que le convienen",
  ],
};
