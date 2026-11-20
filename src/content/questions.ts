import type { L, Reviewable } from "./types.js";

/**
 * "Our questions" card: curated questions a family can tap and show (or hand) to the PENS team.
 * Every question exists in English and Spanish so the card works in "pass the phone" mode.
 */
export const QUESTION_VISIT_TYPES = [
  "first_visit",
  "routine_eeg",
  "sleep_deprived_eeg",
  "video_eeg",
  "adhd_testing",
  "follow_up",
  "school_plan",
] as const;
export type QuestionVisitType = (typeof QUESTION_VISIT_TYPES)[number];

export const MAX_QUESTIONS = 5;
export const SUGGESTED_MIN = 3;
export const CUSTOM_QUESTION_MAX = 140;

export interface SuggestedQuestion {
  id: string;
  text: L;
}

export interface QuestionSet extends Reviewable {
  type: QuestionVisitType;
  icon: string;
  title: L;
  questions: SuggestedQuestion[];
}

const q = (id: string, en: string, es: string): SuggestedQuestion => ({ id, text: { en, es } });

export const QUESTION_SETS: QuestionSet[] = [
  {
    id: "questions-first-visit",
    clinicReview: "pending",
    type: "first_visit",
    icon: "👋",
    title: { en: "First visit", es: "Primera visita" },
    questions: [
      q("fv_first", "What will happen first at our visit?", "¿Qué pasará primero en nuestra visita?"),
      q("fv_length", "About how long will the visit take?", "¿Cuánto tiempo durará la visita, más o menos?"),
      q("fv_bring", "What should we bring with us?", "¿Qué debemos traer?"),
      q("fv_tests", "Will our child need any tests, and when?", "¿Nuestro hijo necesitará algún examen, y cuándo?"),
      q("fv_comfort", "How can we help our child feel comfortable?", "¿Cómo podemos ayudar a nuestro hijo a sentirse cómodo?"),
      q("fv_contact", "Who do we call if we have questions after the visit?", "¿A quién llamamos si tenemos preguntas después de la visita?"),
      q("fv_next", "What are the next steps after today?", "¿Cuáles son los próximos pasos después de hoy?"),
    ],
  },
  {
    id: "questions-routine-eeg",
    clinicReview: "pending",
    type: "routine_eeg",
    icon: "🧠",
    title: { en: "EEG", es: "EEG" },
    questions: [
      q("eeg_first", "What will happen first when we arrive for the EEG?", "¿Qué pasará primero cuando lleguemos para el EEG?"),
      q("eeg_comfort", "How can we help our child feel comfortable during the EEG?", "¿Cómo podemos ayudar a nuestro hijo a sentirse cómodo durante el EEG?"),
      q("eeg_stay", "Can a parent stay in the room the whole time?", "¿Puede uno de los padres quedarse en la sala todo el tiempo?"),
      q("eeg_length", "About how long will the EEG take?", "¿Cuánto tiempo durará el EEG, más o menos?"),
      q("eeg_hair", "How do we get the paste out of our child's hair afterward?", "¿Cómo quitamos la pasta del cabello de nuestro hijo después?"),
      q("eeg_results", "When and how will we receive the results?", "¿Cuándo y cómo recibiremos los resultados?"),
      q("eeg_toy", "Can our child bring a favorite toy or blanket?", "¿Puede nuestro hijo traer un juguete o una cobija favorita?"),
    ],
  },
  {
    id: "questions-sleep-deprived-eeg",
    clinicReview: "pending",
    type: "sleep_deprived_eeg",
    icon: "😴",
    title: { en: "Sleep-deprived EEG", es: "EEG con privación de sueño" },
    questions: [
      q("sd_sleep", "How much sleep should our child get the night before?", "¿Cuánto debe dormir nuestro hijo la noche anterior?"),
      q("sd_awake", "What are good ways to keep our child awake on the way here?", "¿Cuáles son buenas maneras de mantener despierto a nuestro hijo en el camino?"),
      q("sd_nosleep", "What happens if our child does not fall asleep during the test?", "¿Qué pasa si nuestro hijo no se duerme durante el examen?"),
      q("sd_comfort", "How can we help our child feel comfortable during the EEG?", "¿Cómo podemos ayudar a nuestro hijo a sentirse cómodo durante el EEG?"),
      q("sd_length", "About how long will we be here?", "¿Cuánto tiempo estaremos aquí, más o menos?"),
      q("sd_results", "When and how will we receive the results?", "¿Cuándo y cómo recibiremos los resultados?"),
    ],
  },
  {
    id: "questions-video-eeg",
    clinicReview: "pending",
    type: "video_eeg",
    icon: "🎥",
    title: { en: "Video EEG", es: "Video EEG" },
    questions: [
      q("ve_first", "What will happen first when we arrive?", "¿Qué pasará primero cuando lleguemos?"),
      q("ve_pack", "What should we pack for the stay?", "¿Qué debemos empacar para la estadía?"),
      q("ve_stay", "Can a parent stay with our child the whole time?", "¿Puede uno de los padres quedarse con nuestro hijo todo el tiempo?"),
      q("ve_move", "Can our child play, eat and move around during the monitoring?", "¿Puede nuestro hijo jugar, comer y moverse durante el monitoreo?"),
      q("ve_event", "What should we do if we see an event during the monitoring?", "¿Qué debemos hacer si vemos un episodio durante el monitoreo?"),
      q("ve_length", "How long do you expect the monitoring to last?", "¿Cuánto tiempo esperan que dure el monitoreo?"),
      q("ve_results", "When and how will we receive the results?", "¿Cuándo y cómo recibiremos los resultados?"),
    ],
  },
  {
    id: "questions-adhd-testing",
    clinicReview: "pending",
    type: "adhd_testing",
    icon: "🎯",
    title: { en: "ADHD testing", es: "Evaluación de TDAH" },
    questions: [
      q("adhd_what", "What will our child do during the testing?", "¿Qué hará nuestro hijo durante la evaluación?"),
      q("adhd_length", "About how long will the testing take?", "¿Cuánto tiempo durará la evaluación, más o menos?"),
      q("adhd_morning", "Is there anything we should do or avoid that morning?", "¿Hay algo que debamos hacer o evitar esa mañana?"),
      q("adhd_room", "Can a parent be in the room during the testing?", "¿Puede uno de los padres estar en la sala durante la evaluación?"),
      q("adhd_results", "When and how will we receive the results?", "¿Cuándo y cómo recibiremos los resultados?"),
      q("adhd_school", "What information from school would be helpful to bring?", "¿Qué información de la escuela sería útil traer?"),
    ],
  },
  {
    id: "questions-follow-up",
    clinicReview: "pending",
    type: "follow_up",
    icon: "🔁",
    title: { en: "Follow-up visit", es: "Visita de seguimiento" },
    questions: [
      q("fu_since", "What would you like to know about how things have gone since our last visit?", "¿Qué les gustaría saber sobre cómo han ido las cosas desde la última visita?"),
      q("fu_track", "What should we keep track of at home before the next visit?", "¿Qué debemos anotar en casa antes de la próxima visita?"),
      q("fu_call", "When should we call the office between visits?", "¿Cuándo debemos llamar a la oficina entre visitas?"),
      q("fu_refill", "How do we ask for a refill before we run out?", "¿Cómo pedimos una reposición antes de que se nos acabe?"),
      q("fu_next", "When should our next visit be?", "¿Cuándo debe ser nuestra próxima visita?"),
      q("fu_results", "When and how will we receive any new results?", "¿Cuándo y cómo recibiremos los resultados nuevos?"),
    ],
  },
  {
    id: "questions-school-plan",
    clinicReview: "pending",
    type: "school_plan",
    icon: "🏫",
    title: { en: "School / seizure plan", es: "Escuela / plan de convulsiones" },
    questions: [
      q("sp_request", "How do we request a seizure action plan for school?", "¿Cómo solicitamos un plan de acción para convulsiones para la escuela?"),
      q("sp_time", "How long does it take to receive the completed plan?", "¿Cuánto tiempo tarda en estar listo el plan?"),
      q("sp_who", "Who at school should have a copy of the plan?", "¿Quién en la escuela debe tener una copia del plan?"),
      q("sp_update", "How often should the plan be updated?", "¿Cada cuánto se debe actualizar el plan?"),
      q("sp_caregivers", "What should babysitters and grandparents know?", "¿Qué deben saber las niñeras y los abuelos?"),
      q("sp_forms", "Are there school forms you need us to bring?", "¿Hay formularios de la escuela que debamos traer?"),
    ],
  },
];

export const QUESTION_IDS: ReadonlySet<string> = new Set(QUESTION_SETS.flatMap((s) => s.questions.map((x) => x.id)));
