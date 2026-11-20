import type { L, Reviewable } from "./types.js";

export const EPILEPSY_TRAINING_URL = "https://www.epilepsy.com/programs/training-education";

export const HB1201: Reviewable & {
  title: L;
  summary: L<string[]>;
  isapWhat: L;
  requestSteps: L<string[]>;
  sourceNote: L;
} = {
  id: "school-hb1201",
  clinicReview: "pending",
  title: {
    en: "Florida CS/HB 1201: student seizure action plans",
    es: "Florida CS/HB 1201: planes de acción para convulsiones de estudiantes",
  },
  summary: {
    en: [
      "Effective July 1, 2026.",
      "A student's Individualized Seizure Action Plan (ISAP) must be developed and signed by a medical professional.",
      "Charter schools are now included.",
      "School staff who teach or transport a student with an ISAP need seizure training.",
    ],
    es: [
      "Vigente desde el 1 de julio de 2026.",
      "El Plan de Acción Individualizado para Convulsiones (ISAP) del estudiante debe ser elaborado y firmado por un profesional médico.",
      "Ahora incluye a las escuelas chárter.",
      "El personal escolar que enseña o transporta a un estudiante con ISAP necesita capacitación sobre convulsiones.",
    ],
  },
  isapWhat: {
    en: "An ISAP is a written plan for one specific student: what their seizures look like, what to do, when to give any rescue medicine, and when to call 911. It's shared with the people who care for the child at school.",
    es: "Un ISAP es un plan escrito para un estudiante específico: cómo son sus convulsiones, qué hacer, cuándo dar algún medicamento de rescate y cuándo llamar al 911. Se comparte con las personas que cuidan al niño en la escuela.",
  },
  requestSteps: {
    en: [
      "Call PENS at (813) 873-7367 to request a seizure action plan.",
      "Ask your school for any district form they use, and share it with PENS.",
      "Allow time for the provider to complete and sign it; plan ahead of the school year.",
      "Give the signed plan to the school nurse and update it whenever the treatment changes.",
    ],
    es: [
      "Llame a PENS al (813) 873-7367 para solicitar un plan de acción para convulsiones.",
      "Pida a la escuela el formulario del distrito, si tienen uno, y compártalo con PENS.",
      "Dé tiempo al proveedor para completarlo y firmarlo; planifique antes del año escolar.",
      "Entregue el plan firmado a la enfermera escolar y actualícelo cuando cambie el tratamiento.",
    ],
  },
  sourceNote: {
    en: "Summary for families; read the law and your district's policy for full details. Not legal advice.",
    es: "Resumen para familias; consulte la ley y la política de su distrito para más detalles. No es asesoría legal.",
  },
};

export interface CircleMember {
  id: string;
  icon: string;
  role: L;
  tip: L;
}

export const CAREGIVER_CIRCLE: CircleMember[] = [
  { id: "nurse", icon: "🩺", role: { en: "School nurse", es: "Enfermera escolar" }, tip: { en: "Gets the signed ISAP and any rescue medicine", es: "Recibe el ISAP firmado y cualquier medicamento de rescate" } },
  { id: "teacher", icon: "🍎", role: { en: "Teacher(s)", es: "Maestro(s)" }, tip: { en: "Knows the plan and has completed seizure first-aid training", es: "Conoce el plan y completó la capacitación de primeros auxilios" } },
  { id: "bus", icon: "🚌", role: { en: "Bus driver", es: "Conductor del autobús" }, tip: { en: "Staff who transport a student with an ISAP need training", es: "El personal que transporta a un estudiante con ISAP necesita capacitación" } },
  { id: "coach", icon: "⚽", role: { en: "Coach / after-school staff", es: "Entrenador / personal extraescolar" }, tip: { en: "Knows water and sports safety from the plan", es: "Conoce la seguridad en el agua y deportes según el plan" } },
  { id: "sitter", icon: "🏠", role: { en: "Babysitter / family", es: "Niñera / familia" }, tip: { en: "Has a copy of the plan and knows when to call 911", es: "Tiene una copia del plan y sabe cuándo llamar al 911" } },
];
