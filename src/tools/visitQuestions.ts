import { z } from "zod";
import {
  CUSTOM_QUESTION_MAX,
  MAX_QUESTIONS,
  QUESTION_SETS,
  QUESTION_VISIT_TYPES,
  SUGGESTED_MIN,
  type Lang,
} from "../content/index.js";
import { CLINIC_CONTACT } from "../config.js";
import { defineTool, langParam } from "./types.js";

/** Words that are normally capitalized mid-sentence and are not names. */
const CAPITAL_OK = new Set([
  "eeg", "pens", "adhd", "tdah", "mri", "ct", "ok", "i", "isap", "iep", "florida", "tampa", "english", "spanish",
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "healow",
]);

/**
 * True when free text looks like it carries a personal name: a capitalized word that is not at the
 * start of a sentence and is not a known term. Deliberately strict: the family can always rephrase.
 */
export function looksLikeName(text: string): boolean {
  const tokens = text.split(/\s+/).filter(Boolean);
  for (let i = 1; i < tokens.length; i++) {
    if (/[.?!¿¡:]$/.test(tokens[i - 1])) continue;
    const word = tokens[i].replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "");
    if (/^\p{Lu}\p{Ll}+$/u.test(word) && !CAPITAL_OK.has(word.toLowerCase())) return true;
  }
  return false;
}

export type CustomStatus = "none" | "ok" | "removed";

/**
 * Check a family-written question. `scrubbed` has already been through the safety layer's PHI scrub
 * (which leaves "[... removed]" markers). Anything that still looks personal is dropped, never repaired.
 */
export function checkCustomQuestion(scrubbed: string | undefined): { status: CustomStatus; text?: string } {
  const text = (scrubbed ?? "").replace(/\s+/g, " ").trim();
  if (!text) return { status: "none" };
  if (text.length > CUSTOM_QUESTION_MAX || /\[[^\]]*removed\]/i.test(text) || /\d{3,}/.test(text) || looksLikeName(text)) return { status: "removed" };
  return { status: "ok", text };
}

const CARD_LABELS: Record<Lang, Record<string, string>> = {
  en: {
    cardTitle: "Our questions",
    forVisit: "For our visit",
    other: "En español",
    ownWords: "In our own words",
    footer: "General questions for our visit. No personal details on this card.",
  },
  es: {
    cardTitle: "Nuestras preguntas",
    forVisit: "Para nuestra visita",
    other: "In English",
    ownWords: "En nuestras palabras",
    footer: "Preguntas generales para nuestra visita. Esta tarjeta no contiene datos personales.",
  },
};

export const visitQuestions = defineTool({
  name: "visit_questions",
  title: "Our questions card",
  description:
    "Builds an 'Our questions' card a family can show or hand to the PENS team: pick a visit type (first_visit, routine_eeg, sleep_deprived_eeg, video_eeg, adhd_testing, follow_up, school_plan), tap up to 5 suggested questions, and show them in English and Spanish together ('pass the phone'). Use when a parent wants help asking their questions, preparing questions for a visit or EEG, or bridging English and Spanish at the clinic. It answers none of the questions and stores nothing.",
  widget: "question-card",
  invoking: "Getting your questions ready… / Preparando sus preguntas…",
  invoked: "Question card ready / Tarjeta de preguntas lista",
  widgetAccessible: true,
  input: {
    visit_type: z.enum(QUESTION_VISIT_TYPES).optional().describe("Which visit the questions are for. Defaults to first_visit."),
    question_ids: z
      .array(z.string().regex(/^[a-z0-9_]{1,40}$/))
      .max(MAX_QUESTIONS)
      .optional()
      .describe(`Up to ${MAX_QUESTIONS} suggested-question ids to pre-select (ids are listed in this tool's result). Unknown ids are ignored.`),
    custom_question: z
      .string()
      .max(CUSTOM_QUESTION_MAX)
      .optional()
      .describe(
        "Optional single general question in the family's own words. Must not include names, birthdates, contact details, or medical record information; anything that looks personal is dropped and never stored.",
      ),
    lang: langParam,
  },
  handler: ({ visit_type, question_ids, custom_question }, { lang }) => {
    const type = visit_type ?? "first_visit";
    const set = QUESTION_SETS.find((s) => s.type === type) ?? QUESTION_SETS[0];
    const es = lang === "es";
    const other: Lang = es ? "en" : "es";
    const known = new Set(set.questions.map((x) => x.id));
    const selected = [...new Set((question_ids ?? []).filter((id: string) => known.has(id)))].slice(0, MAX_QUESTIONS);
    const custom = checkCustomQuestion(custom_question);
    const chosen = set.questions.filter((x) => selected.includes(x.id));
    const lines = (chosen.length ? chosen : set.questions).map((x) => `- ${x.text[lang]} / ${x.text[other]} (id: ${x.id})`);

    return {
      structured: {
        visitType: type,
        visitTypes: QUESTION_SETS.map((s) => ({ type: s.type, icon: s.icon, title: s.title })),
        sets: Object.fromEntries(QUESTION_SETS.map((s) => [s.type, s.questions.map((x) => ({ id: x.id, en: x.text.en, es: x.text.es }))])),
        selected,
        customStatus: custom.status,
        ...(custom.text ? { custom: custom.text } : {}),
        limits: { max: MAX_QUESTIONS, suggestedMin: SUGGESTED_MIN, customMax: CUSTOM_QUESTION_MAX },
        clinic: { name: CLINIC_CONTACT.name, phone: CLINIC_CONTACT.phone },
        cardLabels: CARD_LABELS,
        labels: {
          heading: es ? "Nuestras preguntas" : "Our questions",
          intro: es
            ? "Elija el tipo de visita y toque de 3 a 5 preguntas. Su tarjeta las muestra en español e inglés."
            : "Pick the visit type and tap 3 to 5 questions. Your card shows them in English and Spanish.",
          visitType: es ? "Tipo de visita" : "Visit type",
          suggested: es ? "Preguntas sugeridas" : "Suggested questions",
          picked: es ? "elegidas" : "picked",
          of: es ? "de" : "of",
          maxReached: es ? "Puede elegir hasta 5 preguntas." : "You can pick up to 5 questions.",
          show: es ? "Mostrar mi tarjeta" : "Show my card",
          edit: es ? "Editar preguntas" : "Edit questions",
          save: es ? "Guardar como imagen" : "Save as image",
          saved: es ? "Imagen guardada." : "Image saved.",
          flip: es ? "Pasar el teléfono: English primero" : "Pass the phone: Español first",
          flipBack: es ? "Pasar el teléfono: español primero" : "Pass the phone: English first",
          full: es ? "Pantalla completa" : "Full screen",
          close: es ? "Cerrar" : "Close",
          screenshotHint: es ? "Tome una captura de pantalla para guardar su tarjeta." : "Take a screenshot to save your card.",
          customLabel: es ? "Agregar una pregunta propia (opcional)" : "Add your own question (optional)",
          customHint: es
            ? "Solo una pregunta general. No escriba nombres, fechas de nacimiento ni otros datos personales."
            : "One general question only. Do not type names, birthdates or other personal details.",
          customAdd: es ? "Agregar" : "Add",
          customRemove: es ? "Quitar" : "Remove",
          customRemoved: es
            ? "No agregamos esa pregunta porque parecía incluir datos personales. Escríbala sin nombres ni fechas."
            : "We did not add that question because it looked like it had personal details. Try it without names or dates.",
          customUnavailable: es
            ? "Aquí no se pueden agregar preguntas propias. Use las preguntas sugeridas."
            : "Your own questions cannot be added here. Please use the suggested questions.",
          yours: es ? "Su pregunta" : "Your question",
          empty: es ? "Toque al menos una pregunta." : "Tap at least one question.",
        },
      },
      text: [
        `${set.icon} ${es ? "Nuestras preguntas" : "Our questions"}: ${set.title[lang]}`,
        chosen.length ? (es ? "Preguntas elegidas:" : "Selected questions:") : es ? "Preguntas sugeridas (elija de 3 a 5):" : `Suggested questions (pick ${SUGGESTED_MIN} to ${MAX_QUESTIONS}):`,
        ...lines,
        custom.status === "ok" ? `- ${custom.text}` : "",
        custom.status === "removed"
          ? es
            ? "La pregunta propia no se agregó porque parecía incluir datos personales."
            : "The custom question was not added because it looked like it contained personal details."
          : "",
        es
          ? "La tarjeta muestra las preguntas en español e inglés para enseñarla al equipo de PENS. Esta herramienta no responde las preguntas."
          : "The card shows the questions in English and Spanish to show the PENS team. This tool does not answer the questions.",
      ]
        .filter(Boolean)
        .join("\n"),
    };
  },
});
