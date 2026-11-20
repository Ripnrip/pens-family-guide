import { QUIZ } from "../content/index.js";
import { defineTool, langParam } from "./types.js";

export const caregiverQuiz = defineTool({
  name: "caregiver_quiz",
  title: "Seizure-Ready caregiver quiz",
  description:
    "Start a quick 5-question 'Seizure-Ready' quiz on seizure first aid for parents, grandparents, babysitters, teachers and coaches, with colorful answer tiles and a score at the end. Use when someone wants to test or practice their seizure first-aid knowledge.",
  widget: "caregiver-quiz",
  invoking: "Shuffling questions… / Preparando preguntas…",
  invoked: "Seizure-Ready quiz / Cuestionario Listos para Convulsiones",
  input: { lang: langParam },
  handler: (_args, { lang }) => {
    const es = lang === "es";
    const questions = QUIZ.map((q) => ({
      id: q.id,
      prompt: q.prompt[lang],
      answers: q.answers[lang],
      correctIndex: q.correctIndex,
      explain: q.explain[lang],
    }));
    return {
      structured: {
        title: es ? "¿Listo para una convulsión?" : "Seizure-Ready?",
        questions,
        labels: {
          start: es ? "¡Empezar!" : "Start!",
          question: es ? "Pregunta" : "Question",
          of: es ? "de" : "of",
          correct: es ? "¡Correcto!" : "Correct!",
          incorrect: es ? "No exactamente" : "Not quite",
          next: es ? "Siguiente" : "Next",
          finish: es ? "Ver resultado" : "See score",
          score: es ? "Tu puntaje" : "Your score",
          again: es ? "Jugar otra vez" : "Play again",
          perfect: es ? "¡Perfecto! Está listo para ayudar." : "Perfect! You're Seizure-Ready.",
          good: es ? "¡Bien! Repase los pasos de primeros auxilios." : "Nice! Review the first-aid steps to be fully ready.",
          learnMore: es ? "Muéstrame los primeros auxilios para convulsiones" : "Show me seizure first aid",
        },
      },
      text: es
        ? `Cuestionario de ${questions.length} preguntas sobre primeros auxilios para convulsiones. Responda en el widget.`
        : `${questions.length}-question seizure first-aid quiz. Answer in the widget.`,
    };
  },
});
