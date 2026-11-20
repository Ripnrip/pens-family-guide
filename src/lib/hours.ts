import { CLINIC, DAY_NAMES, HOURS, LUNCH } from "../content/clinic.js";
import type { Lang } from "../content/types.js";

export type OpenState = "open" | "lunch" | "closed";

export interface OpenStatus {
  state: OpenState;
  /** Local clinic weekday, 0 = Sunday. */
  weekday: number;
  /** Local clinic time "HH:MM" (24h). */
  localTime: string;
  /** Next transition, in clinic local time. */
  next: { state: OpenState; weekday: number; time: string; daysAhead: number };
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Wall-clock parts of `date` in the clinic's time zone (DST-safe via Intl). */
export function clinicLocalParts(date: Date, timeZone = CLINIC.timeZone): { weekday: number; minutes: number; hhmm: string } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const hour = Number(get("hour")) % 24;
  const minute = Number(get("minute"));
  return {
    weekday: WEEKDAYS.indexOf(get("weekday")),
    minutes: hour * 60 + minute,
    hhmm: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
  };
}

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export function getOpenStatus(now: Date = new Date()): OpenStatus {
  const { weekday, minutes, hhmm } = clinicLocalParts(now);
  const today = HOURS[weekday];
  const lunchStart = toMin(LUNCH.start);
  const lunchEnd = toMin(LUNCH.end);

  if (today) {
    const open = toMin(today.open);
    const close = toMin(today.close);
    if (minutes >= open && minutes < close) {
      if (minutes >= lunchStart && minutes < lunchEnd) {
        return { state: "lunch", weekday, localTime: hhmm, next: { state: "open", weekday, time: LUNCH.end, daysAhead: 0 } };
      }
      const closesForLunch = minutes < lunchStart;
      return {
        state: "open",
        weekday,
        localTime: hhmm,
        next: { state: closesForLunch ? "lunch" : "closed", weekday, time: closesForLunch ? LUNCH.start : today.close, daysAhead: 0 },
      };
    }
    if (minutes < open) {
      return { state: "closed", weekday, localTime: hhmm, next: { state: "open", weekday, time: today.open, daysAhead: 0 } };
    }
  }
  for (let i = 1; i <= 7; i++) {
    const d = (weekday + i) % 7;
    const h = HOURS[d];
    if (h) return { state: "closed", weekday, localTime: hhmm, next: { state: "open", weekday: d, time: h.open, daysAhead: i } };
  }
  /* c8 ignore next */
  throw new Error("No open days configured");
}

export function formatTime(hhmm: string, lang: Lang): string {
  const [h, m] = hhmm.split(":").map(Number);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const suffix = lang === "es" ? (h < 12 ? "a. m." : "p. m.") : h < 12 ? "AM" : "PM";
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** Add a final period unless the text already ends with one (Spanish "a. m." / "p. m."). */
const sentence = (s: string) => (s.endsWith(".") ? s : `${s}.`);

export function describeStatus(s: OpenStatus, lang: Lang): { label: string; detail: string } {
  const t = formatTime(s.next.time, lang);
  const dayName = DAY_NAMES[lang][s.next.weekday];
  const when =
    s.next.daysAhead === 0
      ? lang === "es" ? `hoy a las ${t}` : `today at ${t}`
      : s.next.daysAhead === 1
        ? lang === "es" ? `mañana (${dayName}) a las ${t}` : `tomorrow (${dayName}) at ${t}`
        : lang === "es" ? `el ${dayName} a las ${t}` : `${dayName} at ${t}`;
  if (lang === "es") {
    if (s.state === "open") return { label: "Abierto ahora", detail: sentence(s.next.state === "lunch" ? `Cierra para almorzar a las ${t}` : `Cierra a las ${t}`) };
    if (s.state === "lunch") return { label: "Cerrado por almuerzo", detail: sentence(`Reabre a las ${t}`) };
    return { label: "Cerrado ahora", detail: sentence(`Abre ${when}`) };
  }
  if (s.state === "open") return { label: "Open now", detail: s.next.state === "lunch" ? `Closes for lunch at ${t}.` : `Closes at ${t}.` };
  if (s.state === "lunch") return { label: "Closed for lunch", detail: `Reopens at ${t}.` };
  return { label: "Closed now", detail: sentence(`Opens ${when}`) };
}
