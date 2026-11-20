import type { L, Reviewable } from "./types.js";

/**
 * General seizure first aid, summarized from widely published public guidance
 * (e.g. Epilepsy Foundation "Stay, Safe, Side"; CDC seizure first aid).
 * Not a substitute for the child's own seizure action plan.
 */
export interface FirstAidStep extends Reviewable {
  keyword: L; // STAY / SAFE / SIDE
  icon: string;
  title: L;
  points: L<string[]>;
}

export const FIRST_AID_STEPS: FirstAidStep[] = [
  {
    id: "fa-stay",
    clinicReview: "pending",
    keyword: { en: "STAY", es: "QUÉDESE" },
    icon: "⏱️",
    title: { en: "Stay with them and time it", es: "Quédese con el niño y tome el tiempo" },
    points: {
      en: ["Stay calm and stay with the child until they are fully awake and aware", "Start a timer when the seizure begins", "Notice what happens so you can describe it later"],
      es: ["Mantenga la calma y quédese con el niño hasta que esté completamente despierto y alerta", "Inicie un cronómetro cuando empiece la convulsión", "Observe lo que pasa para poder describirlo después"],
    },
  },
  {
    id: "fa-safe",
    clinicReview: "pending",
    keyword: { en: "SAFE", es: "SEGURO" },
    icon: "🛡️",
    title: { en: "Keep them safe", es: "Manténgalo seguro" },
    points: {
      en: ["Move hard or sharp objects away", "Cushion the head with something soft", "Loosen anything tight around the neck; remove glasses"],
      es: ["Aleje objetos duros o filosos", "Proteja la cabeza con algo suave", "Afloje lo que apriete el cuello; quite los lentes"],
    },
  },
  {
    id: "fa-side",
    clinicReview: "pending",
    keyword: { en: "SIDE", es: "DE LADO" },
    icon: "↪️",
    title: { en: "Turn them on their side", es: "Póngalo de lado" },
    points: {
      en: ["If they are not awake and aware, gently roll them onto their side", "This helps keep the airway clear"],
      es: ["Si no está despierto y alerta, gírelo suavemente de lado", "Esto ayuda a mantener libre la vía respiratoria"],
    },
  },
];

export const FIRST_AID_DONTS: Reviewable & { items: L<string[]> } = {
  id: "fa-donts",
  clinicReview: "pending",
  items: {
    en: ["Do NOT put anything in their mouth", "Do NOT hold them down or try to stop the movements", "Do NOT give food, drink or pills until they are fully awake"],
    es: ["NO ponga nada en su boca", "NO lo sujete ni trate de detener los movimientos", "NO le dé comida, bebida ni pastillas hasta que esté completamente despierto"],
  },
};

export const CALL_911_WHEN: Reviewable & { items: L<string[]> } = {
  id: "fa-call-911",
  clinicReview: "pending",
  items: {
    en: [
      "The seizure lasts 5 minutes or longer (or longer than their action plan says)",
      "Another seizure starts soon after, or they don't wake up between seizures",
      "They have trouble breathing, or lips or face turn blue",
      "It's their first seizure",
      "They are hurt, or the seizure happened in water",
      "They are hard to wake or not acting like themselves afterward",
      "Their seizure action plan says to call",
    ],
    es: [
      "La convulsión dura 5 minutos o más (o más de lo que indica su plan de acción)",
      "Empieza otra convulsión poco después, o no despierta entre convulsiones",
      "Tiene dificultad para respirar, o los labios o la cara se ponen azules",
      "Es su primera convulsión",
      "Se lastimó, o la convulsión ocurrió en el agua",
      "Es difícil despertarlo o no actúa como siempre después",
      "Su plan de acción para convulsiones indica llamar",
    ],
  },
};

export const ACTION_PLAN_NOTE: L = {
  en: "This is general first aid. If your child has a seizure action plan from their doctor, follow that plan first, including any rescue medicine instructions.",
  es: "Estos son primeros auxilios generales. Si su hijo tiene un plan de acción para convulsiones de su médico, siga primero ese plan, incluidas las instrucciones de medicamento de rescate.",
};

/** Timer thresholds (seconds) used by the first-aid widget. */
export const TIMER_THRESHOLDS = { warnAt: 4 * 60, callAt: 5 * 60 };
