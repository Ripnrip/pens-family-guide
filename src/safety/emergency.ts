import { CLINIC } from "../content/clinic.js";
import type { L, Lang } from "../content/types.js";
import { normalizeText } from "./normalize.js";

/**
 * Emergency detector. Runs on every free-text tool input (EN + ES).
 * Deliberately conservative: a false positive shows a "call 911 if this is happening now" card;
 * a false negative could delay emergency care.
 */
export type EmergencyCategory =
  | "prolonged_seizure"
  | "active_seizure"
  | "not_breathing"
  | "blue_lips"
  | "first_seizure"
  | "injury"
  | "wont_wake"
  | "water"
  | "ingestion"
  | "suicidal";

export interface EmergencyResult {
  triggered: boolean;
  categories: EmergencyCategory[];
}

const SEIZURE_WORD =
  /\b(seiz\w*|convuls\w*|fits?|shaking|jerking|twitching|ataques?|crisis|temblando|sacudi\w*|epilep\w*)\b/;

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  fifteen: 15, twenty: 20, thirty: 30,
  uno: 1, un: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9,
  diez: 10, quince: 15, veinte: 20, treinta: 30,
};

const DURATION =
  /(less than|under|menos de|hace)?\s*\b(\d+(?:[.,]\d+)?|one|two|three|four|five|six|seven|eight|nine|ten|fifteen|twenty|thirty|uno|un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|quince|veinte|treinta)\s*\+?\s*(min|mins|minute|minutes|minuto|minutos|hour|hours|hora|horas)\b(\s*ago)?/g;

function hasLongDuration(text: string): boolean {
  for (const m of text.matchAll(DURATION)) {
    const [, qualifier, rawNum, unit, ago] = m;
    if (qualifier || ago) continue; // "less than 5 min", "10 minutes ago", "hace 10 minutos"
    const n = NUMBER_WORDS[rawNum] ?? Number.parseFloat(rawNum.replace(",", "."));
    if (Number.isNaN(n)) continue;
    if (/^(hour|hours|hora|horas)$/.test(unit)) return true;
    if (n >= 5) return true;
  }
  return false;
}

type Rule = { category: EmergencyCategory; test: (t: string) => boolean };

const any = (...res: RegExp[]) => (t: string) => res.some((r) => r.test(t));
const withSeizure = (...res: RegExp[]) => (t: string) => SEIZURE_WORD.test(t) && res.some((r) => r.test(t));

const RULES: Rule[] = [
  {
    category: "prolonged_seizure",
    test: (t) =>
      (SEIZURE_WORD.test(t) && hasLongDuration(t)) ||
      withSeizure(
        /\b(wont|will not|doesnt|does not|isnt|is not|not|cant|can not|cannot) (stop|stopping|end|ending)\b/,
        /\bkeeps? (seizing|having|shaking|jerking)\b/,
        /\b(no para|no se detiene|no se le quita|no deja de|sigue convulsionando)\b/,
      )(t) ||
      any(
        /\bback to back seizures?\b/,
        /\bseizures? (one )?after (another|the other)\b/,
        /\bcluster of seizures\b/,
        /\bstatus epilepticus\b/,
        /\bestado epileptico\b/,
        /\buna (convulsion )?tras otra\b/,
      )(t),
  },
  {
    category: "active_seizure",
    test: any(
      /\b(is |she is |he is |shes |hes |they are |theyre )?(having|in) a seizure (right )?now\b/,
      /\bseizing (right )?now\b/,
      /\bseizure (is )?happening (right )?now\b/,
      /\besta (convulsionando|teniendo una convulsion|teniendo un ataque)\b/,
      /\bconvulsionando ahora\b/,
    ),
  },
  {
    category: "not_breathing",
    test: any(
      /\b(not|isnt|is not|stopped|cant|can not|cannot|trouble|struggling to|hard time|difficulty|wont|barely) ?breath\w*/,
      /\bchoking\b/,
      /\bno (esta )?respira\w*/,
      /\bno puede respirar\b/,
      /\bdejo de respirar\b/,
      /\b(dificultad|problemas?) para respirar\b/,
      /\bse (esta )?ahoga\w*/,
    ),
  },
  {
    category: "blue_lips",
    test: any(
      /\bblue (lips|face|skin)\b/,
      /\b(lips|face|skin) (are |is |turning |turned |going |look |looks )?(blue|purple|gray|grey)\b/,
      /\bturning (blue|purple|gray|grey)\b/,
      /\blabios (azules|morados)\b/,
      /\bcara (azul|morada)\b/,
      /\b(se (esta )?(puso|pone|poniendo)|esta) (azul|morad[oa])\b/,
    ),
  },
  {
    category: "first_seizure",
    test: any(
      /\bfirst (ever )?(seizure|convulsion|fit)\b/,
      /\bfirst time (\w+ ){0,3}(seizure|seized|convuls\w*)\b/,
      /\b(never|not) had a seizure before\b/,
      /\bprimera (convulsion|crisis|vez que convulsion\w*)\b/,
      /\bnunca (habia|ha) (tenido una convulsion|convulsionado)\b/,
    ),
  },
  {
    category: "injury",
    test: any(
      /\bhit (his|her|their|my|the) head\b/,
      /\bhead (injury|trauma|wound)\b/,
      /\b(concussion|conmocion)\b/,
      /\bbleeding\b/,
      /\b(sangrando|sangra mucho)\b/,
      /\b(injured|hurt) (himself|herself|themselves|themself|during|in the)\b/,
      /\bse (golpeo|lastimo|hirio)\b/,
      /\bgolpe en la cabeza\b/,
    ),
  },
  {
    category: "wont_wake",
    test: any(
      /\b(wont|will not|cant|can not|cannot|not|isnt|is not|hard to|unable to) (wake|waking)\b/,
      /\bunresponsive\b/,
      /\b(not|isnt|wont) respond(ing)?\b/,
      /\bpassed out\b/,
      /\bunconscious\b/,
      /\bno (se )?despierta\b/,
      /\bno responde\b/,
      /\binconsciente\b/,
      /\bse desmayo\b/,
    ),
  },
  {
    category: "water",
    test: withSeizure(
      /\b(in|into) (the )?(water|pool|bathtub|bath|tub|lake|ocean)\b/,
      /\ben (el )?agua\b/,
      /\b(piscina|alberca|banera|tina)\b/,
    ),
  },
  {
    category: "ingestion",
    test: any(
      /\boverdose\b/,
      /\bsobredosis\b/,
      /\bswallowed (\w+ ){0,3}(pills|medicine|medication|medicines|tablets)\b/,
      /\btook too (many|much)\b/,
      /\bse trago\b/,
      /\btomo demasiad\w*\b/,
      /\b(poison\w*|envenen\w*|intoxic\w*)\b/,
    ),
  },
  {
    category: "suicidal",
    test: any(
      /\bsuicid\w*/,
      /\bkill (my|him|her|them)sel(f|ves)\b/,
      /\b(want|wants|wanted|wanting) to die\b/,
      /\bend (my|his|her|their) (own )?life\b/,
      /\bhurt(ing)? (my|him|her|them)sel(f|ves)\b/,
      /\bself[ -]?harm\w*/,
      /\bcutting (my|him|her|them)sel(f|ves)\b/,
      /\bquitar(se|me) la vida\b/,
      /\bmatar(me|se)\b/,
      /\bquier(o|e) morir(me|se)?\b/,
      /\bhacer(se|me) dano\b/,
      /\bautolesion\w*/,
    ),
  },
];

export function detectEmergency(input: string | string[] | undefined | null): EmergencyResult {
  const raw = Array.isArray(input) ? input.join(" \n ") : input ?? "";
  if (!raw.trim()) return { triggered: false, categories: [] };
  const text = normalizeText(raw);
  const categories = RULES.filter((r) => r.test(text)).map((r) => r.category);
  return { triggered: categories.length > 0, categories };
}

// ---------------------------------------------------------------------------
// Urgent card content
// ---------------------------------------------------------------------------

const REASON: Record<EmergencyCategory, L> = {
  prolonged_seizure: {
    en: "A seizure lasting 5 minutes or longer, or seizures back to back, is an emergency.",
    es: "Una convulsión que dura 5 minutos o más, o convulsiones seguidas, es una emergencia.",
  },
  active_seizure: {
    en: "Stay with your child and time the seizure. Keep them safe and on their side. Call 911 if it reaches 5 minutes or there are any danger signs.",
    es: "Quédese con su hijo y tome el tiempo. Manténgalo seguro y de lado. Llame al 911 si llega a 5 minutos o hay señales de peligro.",
  },
  not_breathing: { en: "Trouble breathing is an emergency.", es: "La dificultad para respirar es una emergencia." },
  blue_lips: { en: "Blue or gray lips or face is an emergency.", es: "Labios o cara azules o grises es una emergencia." },
  first_seizure: {
    en: "A first-ever seizure should be checked right away. If it is happening now or just happened, call 911.",
    es: "Una primera convulsión debe revisarse de inmediato. Si está ocurriendo ahora o acaba de ocurrir, llame al 911.",
  },
  injury: { en: "A head injury or serious injury needs emergency care.", es: "Un golpe en la cabeza o una lesión grave necesita atención de emergencia." },
  wont_wake: {
    en: "A child who won't wake up or respond needs emergency care.",
    es: "Un niño que no despierta o no responde necesita atención de emergencia.",
  },
  water: { en: "A seizure in water is an emergency.", es: "Una convulsión en el agua es una emergencia." },
  ingestion: {
    en: "Swallowing too much medicine or a possible poisoning is an emergency. You can also call Poison Help at 1-800-222-1222.",
    es: "Tragar demasiado medicamento o un posible envenenamiento es una emergencia. También puede llamar a Poison Help al 1-800-222-1222.",
  },
  suicidal: {
    en: "If someone may hurt themselves, get help now. Call or text 988 (Suicide & Crisis Lifeline, en español disponible), or call 911.",
    es: "Si alguien podría hacerse daño, busque ayuda ahora. Llame o envíe un texto al 988 (Línea de Crisis y Suicidio, disponible en español), o llame al 911.",
  },
};

export interface EmergencyAction {
  label: string;
  href: string;
  kind: "urgent" | "secondary";
}

export interface EmergencyCard {
  level: "emergency";
  categories: EmergencyCategory[];
  title: string;
  lead: string;
  reasons: string[];
  actions: EmergencyAction[];
  nonEmergency: string;
}

export function buildEmergencyCard(result: EmergencyResult, lang: Lang): EmergencyCard | undefined {
  if (!result.triggered) return undefined;
  const actions: EmergencyAction[] = [
    { label: lang === "es" ? "Llamar al 911" : "Call 911", href: "tel:911", kind: "urgent" },
  ];
  if (result.categories.includes("suicidal")) {
    actions.push({ label: lang === "es" ? "Llamar o textear al 988" : "Call or text 988", href: "tel:988", kind: "urgent" });
  }
  if (result.categories.includes("ingestion")) {
    actions.push({ label: "Poison Help 1-800-222-1222", href: "tel:+18002221222", kind: "secondary" });
  }
  actions.push({ label: lang === "es" ? `Oficina PENS ${CLINIC.phone}` : `PENS office ${CLINIC.phone}`, href: CLINIC.phoneHref, kind: "secondary" });
  return {
    level: "emergency",
    categories: result.categories,
    title: lang === "es" ? "Si es una emergencia, llame al 911 ahora" : "If this is an emergency, call 911 now",
    lead:
      lang === "es"
        ? "Lo que describió puede ser una emergencia. No espere una respuesta en este chat."
        : "What you described may be an emergency. Don't wait for an answer in this chat.",
    reasons: result.categories.map((c) => REASON[c][lang]),
    actions,
    nonEmergency:
      lang === "es"
        ? `Para preguntas que no son de emergencia, llame a PENS al ${CLINIC.phone} en horario de oficina.`
        : `For non-emergency questions, call PENS at ${CLINIC.phone} during office hours.`,
  };
}

export function emergencyText(card: EmergencyCard): string {
  return [`⚠️ ${card.title}.`, card.lead, ...card.reasons.map((r) => `- ${r}`), card.nonEmergency].join("\n");
}
