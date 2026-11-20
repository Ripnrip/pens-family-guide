import type { L, Reviewable } from "./types.js";

export interface QuizQuestion extends Reviewable {
  prompt: L;
  answers: L<string[]>; // exactly 4
  correctIndex: number;
  explain: L;
}

export const QUIZ: QuizQuestion[] = [
  {
    id: "quiz-first",
    clinicReview: "pending",
    prompt: { en: "A child starts having a seizure. What do you do first?", es: "Un niño empieza a convulsionar. ¿Qué hace primero?" },
    answers: {
      en: ["Stay with them and start timing", "Run to find a spoon", "Splash water on their face", "Hold their arms still"],
      es: ["Quedarse con él y tomar el tiempo", "Buscar una cuchara", "Echarle agua en la cara", "Sujetarle los brazos"],
    },
    correctIndex: 0,
    explain: { en: "Stay calm, stay with them, and time it.", es: "Mantenga la calma, quédese con él y tome el tiempo." },
  },
  {
    id: "quiz-mouth",
    clinicReview: "pending",
    prompt: { en: "Should you put something in their mouth?", es: "¿Debe ponerle algo en la boca?" },
    answers: {
      en: ["Yes, so they don't swallow their tongue", "Only a soft cloth", "Never", "Only water"],
      es: ["Sí, para que no se trague la lengua", "Solo un trapo suave", "Nunca", "Solo agua"],
    },
    correctIndex: 2,
    explain: { en: "Never put anything in the mouth. A person can't swallow their tongue.", es: "Nunca ponga nada en la boca. Nadie puede tragarse la lengua." },
  },
  {
    id: "quiz-position",
    clinicReview: "pending",
    prompt: { en: "Which position helps keep the airway clear?", es: "¿Qué posición ayuda a mantener libre la vía respiratoria?" },
    answers: {
      en: ["Sitting up", "On their side", "Flat on their back", "Standing"],
      es: ["Sentado", "De lado", "Boca arriba", "De pie"],
    },
    correctIndex: 1,
    explain: { en: "Gently roll them onto their side.", es: "Gírelo suavemente de lado." },
  },
  {
    id: "quiz-911",
    clinicReview: "pending",
    prompt: { en: "Generally, call 911 if a seizure lasts at least…", es: "En general, llame al 911 si una convulsión dura al menos…" },
    answers: {
      en: ["30 seconds", "1 minute", "5 minutes", "30 minutes"],
      es: ["30 segundos", "1 minuto", "5 minutos", "30 minutos"],
    },
    correctIndex: 2,
    explain: { en: "5 minutes or longer, unless the child's action plan says otherwise.", es: "5 minutos o más, a menos que el plan de acción del niño indique otra cosa." },
  },
  {
    id: "quiz-hold",
    clinicReview: "pending",
    prompt: { en: "Should you hold the child down to stop the shaking?", es: "¿Debe sujetar al niño para detener las sacudidas?" },
    answers: {
      en: ["Yes, firmly", "No, keep the area safe instead", "Only their legs", "Only if it's a long seizure"],
      es: ["Sí, con firmeza", "No, mejor mantenga el área segura", "Solo las piernas", "Solo si es larga"],
    },
    correctIndex: 1,
    explain: { en: "Don't restrain them. Move hard objects away and cushion the head.", es: "No lo sujete. Aleje objetos duros y proteja la cabeza." },
  },
];
