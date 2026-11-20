import type { Lang } from "../content/types.js";
import { normalizeText } from "../safety/normalize.js";

const ES_HINTS = new Set([
  "el", "la", "los", "las", "mi", "hijo", "hija", "nino", "nina", "que", "tiene", "con", "para", "por", "una", "como",
  "es", "esta", "dolor", "cabeza", "convulsion", "convulsiones", "cita", "donde", "cuando", "horario", "ayuda", "escuela",
  "puedo", "necesito", "hola", "gracias", "senor", "pediatra", "atienden", "ninos", "lleva", "minutos", "convulsionando",
  "ahora", "hace", "pero", "porque", "tambien", "muy", "del", "al", "se", "su", "sus", "nuestro", "nuestra", "ataques",
  "temblando", "respira", "despierta", "llama", "quiere", "dolores", "migrana", "atencion", "cita",
]);

/** Heuristic Spanish detector for free text, used only when no explicit lang/locale is given. */
export function looksSpanish(text: string): boolean {
  const words = normalizeText(text).split(/[^a-z]+/).filter(Boolean);
  if (!words.length) return false;
  const hits = words.filter((w) => ES_HINTS.has(w)).length;
  return hits >= 2 || (words.length <= 3 && hits >= 1);
}

export function langFromLocale(locale: unknown): Lang | undefined {
  if (typeof locale !== "string" || !locale) return undefined;
  return locale.toLowerCase().startsWith("es") ? "es" : "en";
}

/**
 * Language resolution order: explicit `lang` arg > Spanish free text (bilingual users often run an
 * English-locale device) > host locale (`_meta["openai/locale"]`, `_meta["webplus/i18n"]`) > English.
 */
export function resolveLang(opts: { lang?: unknown; meta?: Record<string, unknown> | undefined; texts?: string[] }): Lang {
  if (opts.lang === "en" || opts.lang === "es") return opts.lang;
  if (opts.texts?.some((t) => t && looksSpanish(t))) return "es";
  const meta = opts.meta ?? {};
  return langFromLocale(meta["openai/locale"]) ?? langFromLocale(meta["webplus/i18n"]) ?? "en";
}
