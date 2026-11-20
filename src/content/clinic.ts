import type { L } from "./types.js";

/** Public facts from pensoftampabay.com. Non-clinical, but verify before launch. */
export const CLINIC = {
  name: "Pediatric Epilepsy & Neurology Specialists",
  shortName: "PENS",
  since: 2001,
  tagline: {
    en: "Serving Tampa Bay families since 2001, the largest pediatric neurology group in Tampa Bay.",
    es: "Atendiendo a familias de Tampa Bay desde 2001, el grupo de neurología pediátrica más grande de Tampa Bay.",
  } satisfies L,
  medicalDirector: "Dr. José A. Ferreira",
  team: {
    en: "Board-certified physicians and nurse practitioners.",
    es: "Médicos certificados por la junta y enfermeros practicantes (nurse practitioners).",
  } satisfies L,
  address: {
    line1: "508 S. Habana Ave., Suite 340",
    city: "Tampa",
    state: "FL",
    zip: "33609",
    full: "508 S. Habana Ave., Suite 340, Tampa, FL 33609",
  },
  phone: "(813) 873-7367",
  phoneHref: "tel:+18138737367",
  fax: "(813) 875-9722",
  email: "info@pensoftampabay.com",
  timeZone: "America/New_York",
  links: {
    website: "https://www.pensoftampabay.com/",
    // TODO-verify: exact deep-link paths on pensoftampabay.com. Base URL is confirmed;
    // the paths below are best guesses and must be checked before launch.
    requestAppointment: "https://www.pensoftampabay.com/", // TODO-verify: "Request an Appointment" form path
    patientForms: "https://www.pensoftampabay.com/", // TODO-verify: "Patient Forms" path
    resources: "https://www.pensoftampabay.com/", // TODO-verify: "Resources" path
    officePolicies: "https://www.pensoftampabay.com/", // TODO-verify: "Office Policies" path
    financialInsurance: "https://www.pensoftampabay.com/", // TODO-verify: "Financial & Insurance" path
    directions: "https://www.pensoftampabay.com/", // TODO-verify: "Map & Directions" path
    // eClinicalWorks healow patient portal. TODO-verify: practice-specific portal URL.
    patientPortal: "https://healow.com/",
    map: "https://www.google.com/maps/search/?api=1&query=508+S+Habana+Ave+Suite+340+Tampa+FL+33609",
  },
  /** Flags for UI: which links are still unverified deep links. */
  unverifiedLinks: [
    "requestAppointment",
    "patientForms",
    "resources",
    "officePolicies",
    "financialInsurance",
    "directions",
    "patientPortal",
  ] as const,
};

/**
 * Weekly hours in local clinic time (America/New_York). Day numbers follow JS: 0 = Sunday.
 * Closed daily 12:30-1:00 PM for lunch.
 */
export interface DayHours {
  open: string; // "HH:MM" 24h
  close: string;
}
export const HOURS: Record<number, DayHours | null> = {
  0: null,
  1: { open: "07:30", close: "17:00" },
  2: { open: "07:30", close: "17:00" },
  3: { open: "07:30", close: "17:00" },
  4: { open: "07:30", close: "17:00" },
  5: { open: "07:30", close: "16:30" },
  6: null,
};
export const LUNCH = { start: "12:30", end: "13:00" };

export const DAY_NAMES: L<string[]> = {
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  es: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
};

export const HOURS_SUMMARY: L<{ days: string; hours: string }[]> = {
  en: [
    { days: "Monday – Thursday", hours: "7:30 AM – 5:00 PM" },
    { days: "Friday", hours: "7:30 AM – 4:30 PM" },
    { days: "Saturday – Sunday", hours: "Closed" },
    { days: "Lunch (daily)", hours: "Closed 12:30 – 1:00 PM" },
  ],
  es: [
    { days: "Lunes – jueves", hours: "7:30 a. m. – 5:00 p. m." },
    { days: "Viernes", hours: "7:30 a. m. – 4:30 p. m." },
    { days: "Sábado – domingo", hours: "Cerrado" },
    { days: "Almuerzo (diario)", hours: "Cerrado 12:30 – 1:00 p. m." },
  ],
};

/** TODO-verify with the office: parking and arrival details are not yet confirmed. */
export const ARRIVAL_TIPS: { id: string; verified: false; text: L }[] = [
  {
    id: "arrive-early",
    verified: false,
    text: {
      en: "Plan to arrive about 15 minutes early for check-in.",
      es: "Planee llegar unos 15 minutos antes para registrarse.",
    },
  },
  {
    id: "parking",
    verified: false,
    text: {
      en: "Parking: ask the office about parking for 508 S. Habana Ave. when you schedule.",
      es: "Estacionamiento: pregunte en la oficina sobre el estacionamiento en 508 S. Habana Ave. al hacer su cita.",
    },
  },
  {
    id: "suite",
    verified: false,
    text: {
      en: "The office is in Suite 340; take the elevator to the 3rd floor.",
      es: "La oficina está en la Suite 340; tome el ascensor al 3.er piso.",
    },
  },
  {
    id: "bring",
    verified: false,
    text: {
      en: "Bring your insurance card, a photo ID, and any referral your plan requires.",
      es: "Traiga su tarjeta de seguro, una identificación con foto y cualquier referido que exija su plan.",
    },
  },
];
