import type { L, Reviewable } from "./types.js";

export type CareKind = "service" | "condition";

export interface CareItem extends Reviewable {
  kind: CareKind;
  icon: string; // emoji, decorative only (aria-hidden in widgets)
  title: L;
  summary: L;
  nextStep: L;
  /** Normalized (lowercase, no accents) keywords. A keyword matches when it starts at a word boundary (prefix match). */
  keywords: string[];
  /** Related service ids, shown as "how PENS can help". */
  related?: string[];
}

export const SERVICES: CareItem[] = [
  {
    id: "eeg",
    kind: "service",
    clinicReview: "pending",
    icon: "🧠",
    title: { en: "EEG (electroencephalogram)", es: "EEG (electroencefalograma)" },
    summary: {
      en: "A painless test that records the brain's electrical activity using small sensors placed on the scalp. Often used when doctors are looking into seizures or spells.",
      es: "Una prueba sin dolor que registra la actividad eléctrica del cerebro con pequeños sensores en el cuero cabelludo. Se usa a menudo para estudiar convulsiones o episodios.",
    },
    nextStep: {
      en: "An EEG is ordered by a provider. If your child has an EEG scheduled, ask for the visit-prep checklist.",
      es: "Un proveedor ordena el EEG. Si su hijo tiene un EEG programado, pida la lista de preparación para la visita.",
    },
    keywords: ["eeg", "electroencefalograma", "brain wave", "brainwave", "ondas cerebrales", "brain test", "prueba del cerebro"],
  },
  {
    id: "video-eeg",
    kind: "service",
    clinicReview: "pending",
    icon: "🎥",
    title: { en: "Video EEG monitoring", es: "Monitoreo de video EEG" },
    summary: {
      en: "A longer EEG recorded together with video in PENS's neurodiagnostic suite, so the care team can see what happens during a spell and what the brain is doing at the same time.",
      es: "Un EEG más largo grabado junto con video en la unidad de neurodiagnóstico de PENS, para que el equipo vea lo que pasa durante un episodio y lo que hace el cerebro al mismo tiempo.",
    },
    nextStep: {
      en: "Video EEG is scheduled after a PENS provider orders it. Call the office with scheduling questions.",
      es: "El video EEG se programa después de que un proveedor de PENS lo ordene. Llame a la oficina si tiene preguntas.",
    },
    keywords: ["video eeg", "video-eeg", "monitoring", "monitoreo", "overnight", "toda la noche", "neurodiagnostic", "neurodiagnostico"],
  },
  {
    id: "adhd-testing",
    kind: "service",
    clinicReview: "pending",
    icon: "🎯",
    title: { en: "Computerized ADHD testing", es: "Pruebas computarizadas de TDAH" },
    summary: {
      en: "Computer-based attention testing that gives the care team objective information as part of an ADHD evaluation.",
      es: "Pruebas de atención por computadora que dan al equipo información objetiva como parte de una evaluación de TDAH.",
    },
    nextStep: {
      en: "Request an appointment and mention attention or focus concerns so the office can schedule the right visit.",
      es: "Solicite una cita y mencione las preocupaciones de atención o concentración para que la oficina programe la visita correcta.",
    },
    keywords: ["adhd", "tdah", "attention test", "prueba de atencion", "computerized", "computarizada"],
  },
  {
    id: "neuropsych",
    kind: "service",
    clinicReview: "pending",
    icon: "🧩",
    title: { en: "Neuropsychology evaluations", es: "Evaluaciones de neuropsicología" },
    summary: {
      en: "In-depth testing of thinking, learning, memory, attention and behavior that can help guide school and treatment planning.",
      es: "Pruebas detalladas del pensamiento, aprendizaje, memoria, atención y conducta que pueden ayudar a planificar la escuela y el tratamiento.",
    },
    nextStep: {
      en: "Ask the office how to get a neuropsychology evaluation scheduled and whether a referral is needed.",
      es: "Pregunte en la oficina cómo programar una evaluación de neuropsicología y si necesita un referido.",
    },
    keywords: ["neuropsych", "neuropsicolog", "learning", "aprendizaje", "memory", "memoria", "iep", "504", "school testing", "evaluacion escolar", "dyslexia", "dislexia"],
  },
  {
    id: "behavioral-health",
    kind: "service",
    clinicReview: "pending",
    icon: "💬",
    title: { en: "Behavioral health & counseling", es: "Salud conductual y consejería" },
    summary: {
      en: "Behavioral health services and mental health counseling for children and teens, alongside their neurology care.",
      es: "Servicios de salud conductual y consejería de salud mental para niños y adolescentes, junto con su atención neurológica.",
    },
    nextStep: {
      en: "Call the office to ask about behavioral health or counseling appointments.",
      es: "Llame a la oficina para preguntar por citas de salud conductual o consejería.",
    },
    keywords: ["behavior", "behaviour", "conducta", "counsel", "consejeria", "therapy", "terapia", "anxiety", "ansiedad", "depress", "mental health", "salud mental", "emotional", "emocional", "tantrum", "berrinche"],
  },
  {
    id: "research",
    kind: "service",
    clinicReview: "pending",
    icon: "🔬",
    title: { en: "Clinical research", es: "Investigación clínica" },
    summary: {
      en: "PENS has a Clinical Research Department. Families can ask whether any studies might be a fit.",
      es: "PENS tiene un Departamento de Investigación Clínica. Las familias pueden preguntar si algún estudio podría ser adecuado.",
    },
    nextStep: {
      en: "Ask your PENS provider or call the office about current research studies.",
      es: "Pregunte a su proveedor de PENS o llame a la oficina sobre los estudios de investigación actuales.",
    },
    keywords: ["research", "investigacion", "study", "studies", "estudio", "clinical trial", "ensayo clinico", "trial"],
  },
];

export const CONDITIONS: CareItem[] = [
  {
    id: "epilepsy",
    kind: "condition",
    clinicReview: "pending",
    icon: "⚡",
    title: { en: "Epilepsy & seizures", es: "Epilepsia y convulsiones" },
    summary: {
      en: "PENS cares for children with seizures and epilepsy, including evaluation, EEG testing and ongoing care.",
      es: "PENS atiende a niños con convulsiones y epilepsia, incluyendo evaluación, pruebas de EEG y atención continua.",
    },
    nextStep: {
      en: "Request an appointment. Your pediatrician may need to send a referral depending on your insurance.",
      es: "Solicite una cita. Según su seguro, es posible que su pediatra deba enviar un referido.",
    },
    keywords: ["seizure", "epilep", "convuls", "convulsion", "ataque", "crisis epileptic", "staring spell", "staring", "mirada fija", "episodio", "febrile", "febril", "jerk", "sacudida"],
    related: ["eeg", "video-eeg"],
  },
  {
    id: "headache",
    kind: "condition",
    clinicReview: "pending",
    icon: "🌤️",
    title: { en: "Headaches & migraine", es: "Dolores de cabeza y migraña" },
    summary: {
      en: "PENS evaluates and treats children and teens with frequent headaches and migraine.",
      es: "PENS evalúa y trata a niños y adolescentes con dolores de cabeza frecuentes y migraña.",
    },
    nextStep: {
      en: "Request an appointment. A headache diary (when, how long, what helped) can be useful to bring.",
      es: "Solicite una cita. Puede ser útil traer un diario de dolores de cabeza (cuándo, cuánto duró, qué ayudó).",
    },
    keywords: ["headache", "head ache", "migraine", "migrana", "dolor de cabeza", "dolores de cabeza", "jaqueca", "head hurts", "le duele la cabeza"],
  },
  {
    id: "adhd",
    kind: "condition",
    clinicReview: "pending",
    icon: "🎯",
    title: { en: "ADHD & attention", es: "TDAH y atención" },
    summary: {
      en: "PENS sees children with attention, focus and hyperactivity concerns, and offers computerized ADHD testing.",
      es: "PENS atiende a niños con problemas de atención, concentración e hiperactividad, y ofrece pruebas computarizadas de TDAH.",
    },
    nextStep: {
      en: "Request an appointment. Bring any school reports or teacher notes about attention.",
      es: "Solicite una cita. Traiga informes escolares o notas de los maestros sobre la atención.",
    },
    keywords: ["adhd", "tdah", "attention", "atencion", "focus", "concentra", "hyperactiv", "hiperactiv", "distracted", "distraido", "can't sit still", "no se queda quieto"],
    related: ["adhd-testing", "neuropsych"],
  },
  {
    id: "cerebral-palsy",
    kind: "condition",
    clinicReview: "pending",
    icon: "🤸",
    title: { en: "Cerebral palsy", es: "Parálisis cerebral" },
    summary: {
      en: "PENS provides neurology care for children with cerebral palsy.",
      es: "PENS ofrece atención neurológica a niños con parálisis cerebral.",
    },
    nextStep: {
      en: "Request an appointment and mention any therapists or specialists your child already sees.",
      es: "Solicite una cita y mencione los terapeutas o especialistas que ya atienden a su hijo.",
    },
    keywords: ["cerebral palsy", "paralisis cerebral", "cp ", "spastic", "espastic"],
  },
  {
    id: "autism",
    kind: "condition",
    clinicReview: "pending",
    icon: "🌈",
    title: { en: "Autism-related disorders", es: "Trastornos relacionados con el autismo" },
    summary: {
      en: "PENS sees children with autism-related neurological concerns.",
      es: "PENS atiende a niños con problemas neurológicos relacionados con el autismo.",
    },
    nextStep: {
      en: "Request an appointment. Let the office know about sensory needs so the visit can go smoothly.",
      es: "Solicite una cita. Informe a la oficina sobre necesidades sensoriales para que la visita sea más fácil.",
    },
    keywords: ["autism", "autis", "asd", "spectrum", "espectro", "nonverbal", "no verbal"],
    related: ["neuropsych", "behavioral-health"],
  },
  {
    id: "neuromuscular",
    kind: "condition",
    clinicReview: "pending",
    icon: "💪",
    title: { en: "Neuromuscular disorders", es: "Trastornos neuromusculares" },
    summary: {
      en: "PENS evaluates children with muscle weakness and other neuromuscular concerns.",
      es: "PENS evalúa a niños con debilidad muscular y otros problemas neuromusculares.",
    },
    nextStep: {
      en: "Request an appointment; your pediatrician can send recent notes with the referral.",
      es: "Solicite una cita; su pediatra puede enviar notas recientes con el referido.",
    },
    keywords: ["neuromuscular", "muscle", "muscul", "weakness", "debilidad", "weak", "debil", "dystrophy", "distrofia", "walking", "caminar", "tone", "tono"],
  },
  {
    id: "developmental-delay",
    kind: "condition",
    clinicReview: "pending",
    icon: "🌱",
    title: { en: "Developmental delay", es: "Retraso en el desarrollo" },
    summary: {
      en: "PENS sees children who are reaching milestones later than expected, such as talking, walking or learning.",
      es: "PENS atiende a niños que alcanzan sus etapas más tarde de lo esperado, como hablar, caminar o aprender.",
    },
    nextStep: {
      en: "Request an appointment. Notes from early intervention or school are helpful to bring.",
      es: "Solicite una cita. Es útil traer notas de intervención temprana o de la escuela.",
    },
    keywords: ["delay", "retraso", "milestone", "etapas", "not talking", "no habla", "speech", "habla", "late walker", "development", "desarrollo"],
    related: ["neuropsych"],
  },
];

export const ALL_CARE: CareItem[] = [...CONDITIONS, ...SERVICES];

export const AGE_NOTE = {
  en: "PENS is a pediatric practice for infants, children and teens.",
  es: "PENS es una práctica pediátrica para bebés, niños y adolescentes.",
} satisfies L;
