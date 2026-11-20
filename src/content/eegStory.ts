import type { L, Reviewable } from "./types.js";

/**
 * "My EEG Day" story for ages 4-10, starring Pip, the PENS helper: a round sunshine-yellow
 * character whose wiggly antenna stands in for the brain's tiny electrical messages.
 */
export const CHARACTER = {
  name: { en: "Pip", es: "Pip" } satisfies L,
};

export type SceneKind = "story" | "holdStill" | "breathe" | "finish";

export interface Scene extends Reviewable {
  kind: SceneKind;
  mood: "happy" | "curious" | "calm" | "proud";
  title: L;
  text: L;
}

export const SCENES: Scene[] = [
  {
    id: "eeg-hello",
    clinicReview: "pending",
    kind: "story",
    mood: "happy",
    title: { en: "Hi, I'm Pip!", es: "¡Hola, soy Pip!" },
    text: {
      en: "I'm Pip, and my antenna wiggles when I think! Your brain sends tiny messages too. Today an EEG will help the doctors see them. Let's go together!",
      es: "¡Soy Pip y mi antena se mueve cuando pienso! Tu cerebro también manda mensajitos. Hoy un EEG ayudará a los doctores a verlos. ¡Vamos juntos!",
    },
  },
  {
    id: "eeg-room",
    clinicReview: "pending",
    kind: "story",
    mood: "curious",
    title: { en: "The EEG room", es: "El cuarto del EEG" },
    text: {
      en: "There's a comfy bed or chair, a computer, and a friendly helper called a technologist. Your grown-up can stay close by.",
      es: "Hay una cama o silla cómoda, una computadora y una persona amable llamada técnico. Tu adulto puede quedarse cerca.",
    },
  },
  {
    id: "eeg-measure",
    clinicReview: "pending",
    kind: "story",
    mood: "curious",
    title: { en: "Measuring time", es: "Hora de medir" },
    text: {
      en: "The helper measures your head with a soft tape, like measuring for a crown! They make little marks with a washable pencil. Tickly!",
      es: "La persona mide tu cabeza con una cinta suave, ¡como para una corona! Hace marquitas con un lápiz lavable. ¡Da cosquillas!",
    },
  },
  {
    id: "eeg-stickers",
    clinicReview: "pending",
    kind: "story",
    mood: "happy",
    title: { en: "Sticker hat", es: "Gorro de calcomanías" },
    text: {
      en: "Small stickers with wires go on your head with a cool, squishy paste. It might feel a little cold or scratchy, but it doesn't hurt. No shots!",
      es: "Te ponen calcomanías pequeñas con cables en la cabeza con una pasta fresca y blandita. Puede sentirse un poco frío, pero no duele. ¡Sin inyecciones!",
    },
  },
  {
    id: "eeg-listen",
    clinicReview: "pending",
    kind: "story",
    mood: "calm",
    title: { en: "The computer listens", es: "La computadora escucha" },
    text: {
      en: "The wires let the computer draw squiggly lines of your brain's messages, like music notes. You might be asked to blow like a pinwheel or look at blinking lights.",
      es: "Los cables dejan que la computadora dibuje líneas onduladas con los mensajes de tu cerebro, como notas musicales. Quizás te pidan soplar como un rehilete o mirar luces que parpadean.",
    },
  },
  {
    id: "eeg-hold",
    clinicReview: "pending",
    kind: "holdStill",
    mood: "calm",
    title: { en: "Statue practice!", es: "¡A practicar la estatua!" },
    text: {
      en: "During the EEG you rest very still, like a statue. Let's practice! Press and hold the star and stay still until the light fills up.",
      es: "Durante el EEG descansas muy quieto, como una estatua. ¡Practiquemos! Mantén presionada la estrella y quédate quieto hasta que se llene la luz.",
    },
  },
  {
    id: "eeg-breathe",
    clinicReview: "pending",
    kind: "breathe",
    mood: "calm",
    title: { en: "Sunshine breathing", es: "Respiración de sol" },
    text: {
      en: "When you feel wiggly or worried, breathe with me. In as the sun grows… out as it gets small.",
      es: "Cuando te sientas inquieto o preocupado, respira conmigo. Inhala cuando el sol crece… exhala cuando se hace pequeño.",
    },
  },
  {
    id: "eeg-done",
    clinicReview: "pending",
    kind: "finish",
    mood: "proud",
    title: { en: "All done, brave star!", es: "¡Terminamos, estrella valiente!" },
    text: {
      en: "The stickers come off and the paste gets wiped away (a bath at home gets the rest). You did it! I'm so proud of you.",
      es: "Te quitan las calcomanías y limpian la pasta (un baño en casa quita el resto). ¡Lo lograste! Estoy muy orgulloso de ti.",
    },
  },
];

export const GAME_UI = {
  next: { en: "Next", es: "Siguiente" },
  back: { en: "Back", es: "Atrás" },
  restart: { en: "Start again", es: "Empezar de nuevo" },
  holdStar: { en: "Hold the star", es: "Mantén la estrella" },
  keepHolding: { en: "Keep holding… so still!", es: "Sigue así… ¡muy quieto!" },
  heldIt: { en: "Amazing statue! You held still!", es: "¡Estatua increíble! ¡Te quedaste quieto!" },
  oops: { en: "Oops! Let's try again.", es: "¡Uy! Intentemos otra vez." },
  breatheIn: { en: "Breathe in…", es: "Inhala…" },
  breatheOut: { en: "Breathe out…", es: "Exhala…" },
  startBreathing: { en: "Start breathing", es: "Empezar a respirar" },
  breathingDone: { en: "Nice and calm!", es: "¡Muy tranquilo!" },
  fullscreen: { en: "Full screen", es: "Pantalla completa" },
  seconds: { en: "seconds", es: "segundos" },
  forGrownUps: {
    en: "For grown-ups: this story explains a typical EEG. Your child's visit may differ; ask the PENS team.",
    es: "Para adultos: este cuento explica un EEG típico. La visita de su hijo puede ser diferente; pregunte al equipo de PENS.",
  },
} satisfies Record<string, L>;

export const HOLD_STILL_SECONDS = 10;
export const BREATH_ROUNDS = 3;
