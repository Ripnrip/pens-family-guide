/**
 * PENS clinicians ("Meet the team") and the suites at 508 S. Habana Ave.
 *
 * APPROVAL GATE: names, photos, credentials and bios below were copied from PENS's public
 * "Meet the Providers" page and office map. They need PENS approval before public listing.
 * Every person and suite is flagged `clinicReview: "pending"` until PENS signs off.
 *
 * Rules for anything built on this data: show the whole team neutrally, never rank or
 * recommend one clinician over another, and send scheduling to the office.
 */
import type { L, Reviewable } from "./types.js";

export const TEAM_ROLES = ["md", "np", "counsel"] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];

export const TEAM_FILTERS = ["all", "md", "np", "counsel", "spanish"] as const;
export type TeamFilter = (typeof TEAM_FILTERS)[number];

export const SUITE_IDS = ["340", "240", "140"] as const;
export type SuiteId = (typeof SUITE_IDS)[number];

/** Spanish: "yes" speaks Spanish, "basic" some Spanish, "no" not listed. */
export type SpanishLevel = "yes" | "basic" | "no";

export interface TeamMember extends Reviewable {
  /** Full name with degrees, as PENS publishes it. */
  name: string;
  /** Title line under the name. */
  credential: L;
  role: TeamRole;
  focus: L;
  /** Languages as shown to families. */
  languages: L<string[]>;
  spanish: SpanishLevel;
  /** Suite on the office map, or null when the map does not list one. */
  suite: SuiteId | null;
  joined: number;
  /** Key into TEAM_PHOTOS (src/content/teamPhotos.ts) and /assets/team/<photo>.jpg. */
  photo: string;
}

const EN = (extra: L<string[]> = { en: [], es: [] }): L<string[]> => ({ en: ["English", ...extra.en], es: ["Inglés", ...extra.es] });
const SPANISH: L<string[]> = { en: ["Spanish"], es: ["Español"] };

const person = (m: Omit<TeamMember, "clinicReview" | "id"> & { photo: string }): TeamMember => ({
  id: `team-${m.photo}`,
  clinicReview: "pending",
  ...m,
});

export const TEAM: TeamMember[] = [
  person({
    name: "José A. Ferreira, MD",
    credential: { en: "Medical director", es: "Director médico" },
    role: "md",
    focus: {
      en: "Child neurology and epilepsy. Principal investigator on many epilepsy, migraine, and neurobehavioral trials.",
      es: "Neurología infantil y epilepsia. Investigador principal en muchos estudios de epilepsia, migraña y trastornos neuroconductuales.",
    },
    languages: EN(SPANISH),
    spanish: "yes",
    suite: "140",
    joined: 1994,
    photo: "jose",
  }),
  person({
    name: "Carmen I. Ferreira, MD",
    credential: { en: "Pediatric neurologist", es: "Neuróloga pediátrica" },
    role: "md",
    focus: { en: "ADHD, headaches, and autism.", es: "TDAH, dolores de cabeza y autismo." },
    languages: EN(SPANISH),
    spanish: "yes",
    suite: "340",
    joined: 2005,
    photo: "carmen",
  }),
  person({
    name: "Lisa M. Calvo, MD",
    credential: { en: "Pediatric neurologist", es: "Neuróloga pediátrica" },
    role: "md",
    focus: { en: "Epilepsy and neurological disorders.", es: "Epilepsia y trastornos neurológicos." },
    languages: EN(SPANISH),
    spanish: "yes",
    suite: null,
    joined: 2023,
    photo: "lisa",
  }),
  person({
    name: "Michael Enriquez, MD",
    credential: { en: "Pediatric neurologist", es: "Neurólogo pediátrico" },
    role: "md",
    focus: {
      en: "Epilepsy, neuroimmunology, stroke, genetics, and neuromuscular care.",
      es: "Epilepsia, neuroinmunología, derrame, genética y cuidado neuromuscular.",
    },
    languages: EN(SPANISH),
    spanish: "yes",
    suite: null,
    joined: 2021,
    photo: "michael",
  }),
  person({
    name: "Rubens Garcia, MD",
    credential: { en: "Pediatric neurologist", es: "Neurólogo pediátrico" },
    role: "md",
    focus: {
      en: "Functional neurological disorders, headache, concussion, and epilepsy.",
      es: "Trastornos neurológicos funcionales, dolor de cabeza, conmoción y epilepsia.",
    },
    languages: EN(SPANISH),
    spanish: "yes",
    suite: null,
    joined: 2025,
    photo: "rubens",
  }),
  person({
    name: "Felicia Ferreira, DHSc, LMHC",
    credential: { en: "Director, behavioral health", es: "Directora de salud conductual" },
    role: "counsel",
    focus: {
      en: "Licensed mental health counselor. Family counseling for more than 20 years.",
      es: "Consejera de salud mental con licencia. Orientación familiar por más de 20 años.",
    },
    languages: EN(SPANISH),
    spanish: "yes",
    suite: "340",
    joined: 2016,
    photo: "felicia",
  }),
  person({
    name: "Yaribel Pastrana, LMHC",
    credential: { en: "Licensed mental health counselor", es: "Consejera de salud mental" },
    role: "counsel",
    focus: {
      en: "Therapy for children and adolescents, including developmental disabilities.",
      es: "Terapia para niños y adolescentes, incluidas discapacidades del desarrollo.",
    },
    languages: EN(SPANISH),
    spanish: "yes",
    suite: null,
    joined: 2026,
    photo: "yaribel",
  }),
  person({
    name: "Lizbeth Arroyo, MSN, APRN",
    credential: { en: "Family nurse practitioner", es: "Enfermera practicante de familia" },
    role: "np",
    focus: { en: "Pediatric neurology.", es: "Neurología pediátrica." },
    languages: EN(SPANISH),
    spanish: "yes",
    suite: "140",
    joined: 2011,
    photo: "lizbeth",
  }),
  person({
    name: "Katharine Quinn, DNP, APRN",
    credential: { en: "Pediatric nurse practitioner", es: "Enfermera practicante pediátrica" },
    role: "np",
    focus: { en: "ADHD and sleep in children with autism.", es: "TDAH y sueño en niños con autismo." },
    languages: EN(),
    spanish: "no",
    suite: "340",
    joined: 2017,
    photo: "katharine",
  }),
  person({
    name: "Kristin Fritch, MSN, APRN",
    credential: { en: "Pediatric nurse practitioner", es: "Enfermera practicante pediátrica" },
    role: "np",
    focus: { en: "Epilepsy and genetics.", es: "Epilepsia y genética." },
    languages: EN(),
    spanish: "no",
    suite: "140",
    joined: 2017,
    photo: "kristin",
  }),
  person({
    name: "Juliana Arbelaez Valenzuela, MSN, APRN",
    credential: { en: "Pediatric nurse practitioner", es: "Enfermera practicante pediátrica" },
    role: "np",
    focus: { en: "Pediatric neurology.", es: "Neurología pediátrica." },
    languages: EN(SPANISH),
    spanish: "yes",
    suite: null,
    joined: 2018,
    photo: "juliana",
  }),
  person({
    name: "Carron M. Schweiger, MSN, APRN",
    credential: { en: "Pediatric nurse practitioner", es: "Enfermera practicante pediátrica" },
    role: "np",
    focus: { en: "Neuromuscular disorders.", es: "Trastornos neuromusculares." },
    languages: EN(SPANISH),
    spanish: "yes",
    suite: "140",
    joined: 2023,
    photo: "carron",
  }),
  person({
    name: "Jessica Zahran, MSN, APRN",
    credential: { en: "Family nurse practitioner", es: "Enfermera practicante de familia" },
    role: "np",
    focus: { en: "ADHD, epilepsy, and developmental delay.", es: "TDAH, epilepsia y retraso del desarrollo." },
    languages: EN(),
    spanish: "no",
    suite: "140",
    joined: 2024,
    photo: "jessica-z",
  }),
  person({
    name: "Natalie Turaniczo, MSN, APRN",
    credential: { en: "Family nurse practitioner", es: "Enfermera practicante de familia" },
    role: "np",
    focus: { en: "Neurological disorders in children.", es: "Trastornos neurológicos en niños." },
    languages: EN(),
    spanish: "no",
    suite: "340",
    joined: 2024,
    photo: "natalie",
  }),
  person({
    name: "Marguerithe Leo, MSN, APRN",
    credential: { en: "Family nurse practitioner", es: "Enfermera practicante de familia" },
    role: "np",
    focus: {
      en: "Developmental assessments and chronic pediatric conditions.",
      es: "Evaluaciones del desarrollo y condiciones crónicas pediátricas.",
    },
    languages: EN({ en: ["Haitian Creole", "French", "Spanish (basic)"], es: ["Criollo haitiano", "Francés", "Español (básico)"] }),
    spanish: "basic",
    suite: null,
    joined: 2024,
    photo: "marguerithe",
  }),
  person({
    name: "Gina Hoyos, MSN, APRN",
    credential: { en: "Family nurse practitioner", es: "Enfermera practicante de familia" },
    role: "np",
    focus: { en: "Pediatric neurology.", es: "Neurología pediátrica." },
    languages: EN(),
    spanish: "no",
    suite: null,
    joined: 2025,
    photo: "gina",
  }),
  person({
    name: "Jessica Saldarriaga, MSN, APRN",
    credential: { en: "Family nurse practitioner", es: "Enfermera practicante de familia" },
    role: "np",
    focus: { en: "Seizures, ADHD, and developmental delay.", es: "Convulsiones, TDAH y retraso del desarrollo." },
    languages: EN(),
    spanish: "no",
    suite: null,
    joined: 2025,
    photo: "jessica-s",
  }),
  person({
    name: "Amber Tipker, MSN, APRN",
    credential: { en: "Pediatric nurse practitioner", es: "Enfermera practicante pediátrica" },
    role: "np",
    focus: { en: "Seizure and epilepsy nursing.", es: "Enfermería de convulsiones y epilepsia." },
    languages: EN(),
    spanish: "no",
    suite: null,
    joined: 2025,
    photo: "amber",
  }),
];

export interface Suite extends Reviewable {
  suite: SuiteId;
  title: L;
  kicker: L;
  /** What happens in this suite. */
  what: L<string[]>;
}

/** The suites PENS's office map publishes. Who is in each suite comes from TEAM[].suite. */
export const SUITES: Suite[] = [
  {
    id: "suite-340",
    clinicReview: "pending",
    suite: "340",
    title: { en: "Suite 340", es: "Suite 340" },
    kicker: { en: "Street address", es: "Dirección de la calle" },
    what: {
      en: ["The main office address", "QbTest ADHD testing", "ADOS testing, when a clinician recommends it"],
      es: ["La dirección principal del consultorio", "Prueba de TDAH QbTest", "Prueba ADOS, cuando un clínico la recomienda"],
    },
  },
  {
    id: "suite-240",
    clinicReview: "pending",
    suite: "240",
    title: { en: "Suite 240", es: "Suite 240" },
    kicker: { en: "Neurodiagnostic suite", es: "Suite de neurodiagnóstico" },
    what: {
      en: ["In-office EEG, about an hour", "Video EEG, often 24 to 72 hours when ordered"],
      es: ["EEG en el consultorio, cerca de una hora", "Video EEG, a menudo de 24 a 72 horas si se ordena"],
    },
  },
  {
    id: "suite-140",
    clinicReview: "pending",
    suite: "140",
    title: { en: "Suite 140", es: "Suite 140" },
    kicker: { en: "On the office map", es: "En el mapa del consultorio" },
    what: { en: ["Clinic visits"], es: ["Consultas"] },
  },
];

export const SUITE_NOTES = {
  lead: {
    en: "508 S. Habana Ave. is one building with several suites. These are the doors the office map publishes.",
    es: "508 S. Habana Ave. es un edificio con varias suites. Estas son las puertas que publica el mapa del consultorio.",
  },
  otherDoors: {
    en: "The map does not list a suite for every clinician. If it does not name them, do not guess the suite.",
    es: "El mapa no indica una suite para cada clínico. Si no los nombra, no adivine la suite.",
  },
  confirm: {
    en: "Your appointment reminder has the right suite. When in doubt, call the office.",
    es: "Su recordatorio de cita indica la suite correcta. Si tiene dudas, llame al consultorio.",
  },
} satisfies Record<string, L>;

/** Neutral link to public family reviews (no rating numbers, no quotes). */
export const GOOGLE_REVIEWS_URL = "https://www.google.com/maps/place/?q=place_id:ChIJz3Yl427DwogRld5Eww6dJqI";
/** PENS's own providers page. */
export const PROVIDERS_URL = "https://www.pensoftampabay.com/office/meet-the-providers";

const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** True when a member passes a filter. "spanish" includes basic Spanish. */
export function matchesFilter(m: TeamMember, filter: TeamFilter): boolean {
  if (filter === "all") return true;
  if (filter === "spanish") return m.spanish !== "no";
  return m.role === filter;
}

/** Accent- and case-insensitive search over name, title and focus (both languages). */
export function matchesSearch(m: TeamMember, query: string): boolean {
  const words = fold(query).split(/[^a-z0-9]+/).filter((w) => w.length >= 2);
  if (!words.length) return true;
  const blob = fold([m.name, m.credential.en, m.credential.es, m.focus.en, m.focus.es].join(" "));
  return words.every((w) => blob.includes(w));
}
