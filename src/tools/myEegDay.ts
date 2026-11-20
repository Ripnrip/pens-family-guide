import { BREATH_ROUNDS, CHARACTER, GAME_UI, HOLD_STILL_SECONDS, SCENES } from "../content/index.js";
import { defineTool, langParam } from "./types.js";

export const myEegDay = defineTool({
  name: "my_eeg_day",
  title: "My EEG Day (kids' story game)",
  description:
    "Open an interactive story game for children ages 4–10 that walks through getting an EEG step by step with Pip, the friendly PENS helper: tap-to-continue scenes, a 'practice holding still' statue game with a timer, and a calming breathing exercise. Use when a parent wants to help a child feel ready for an EEG or brain-wave test.",
  widget: "eeg-adventure",
  invoking: "Waking up Pip… / Despertando a Pip…",
  invoked: "My EEG Day is ready / Mi día de EEG está listo",
  input: { lang: langParam },
  handler: (_args, { lang }) => {
    const scenes = SCENES.map((s) => ({ id: s.id, kind: s.kind, mood: s.mood, title: s.title[lang], text: s.text[lang] }));
    const ui = Object.fromEntries(Object.entries(GAME_UI).map(([k, v]) => [k, v[lang]]));
    return {
      structured: {
        character: CHARACTER.name[lang],
        scenes,
        holdSeconds: HOLD_STILL_SECONDS,
        breathRounds: BREATH_ROUNDS,
        labels: ui,
      },
      text:
        lang === "es"
          ? `Cuento interactivo "Mi día de EEG" con ${CHARACTER.name.es}: ${scenes.length} escenas, un juego de la estatua y respiración tranquila. ${GAME_UI.forGrownUps.es}`
          : `Interactive "My EEG Day" story with ${CHARACTER.name.en}: ${scenes.length} scenes, a statue game and calm breathing. ${GAME_UI.forGrownUps.en}`,
    };
  },
});
