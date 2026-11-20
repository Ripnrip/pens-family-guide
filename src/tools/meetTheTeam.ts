import { z } from "zod";
import {
  CLINIC,
  GOOGLE_REVIEWS_URL,
  PROVIDERS_URL,
  SUITE_NOTES,
  SUITES,
  TEAM,
  TEAM_FILTERS,
  matchesFilter,
  matchesSearch,
  type Lang,
  type TeamFilter,
} from "../content/index.js";
import { defineTool, langParam } from "./types.js";

/** Short name without degrees, e.g. "Katharine Quinn". */
export const shortName = (name: string) => name.replace(/,.*$/, "");

const FILTER_LABELS: Record<TeamFilter, Record<Lang, string>> = {
  all: { en: "All", es: "Todos" },
  md: { en: "Physicians", es: "Médicos" },
  np: { en: "Nurse practitioners", es: "Enfermeros practicantes" },
  counsel: { en: "Counseling", es: "Orientación" },
  spanish: { en: "Speaks Spanish", es: "Habla español" },
};

const FILTER_TEXT: Record<TeamFilter, Record<Lang, string>> = {
  all: { en: "everyone", es: "todo el equipo" },
  md: { en: "physicians", es: "médicos" },
  np: { en: "nurse practitioners", es: "enfermeros practicantes" },
  counsel: { en: "counseling", es: "orientación" },
  spanish: { en: "clinicians who speak Spanish", es: "quienes hablan español" },
};

export const meetTheTeam = defineTool({
  name: "meet_the_team",
  title: "Meet the PENS team",
  description:
    "Neutral directory of the PENS team: photos, titles, focus areas, languages and suites for PENS's 18 physicians, nurse practitioners and counselors, plus 'Which suite?' for 508 S. Habana Ave. (Suite 340 main office, Suite 240 EEG, Suite 140). Use when a family asks who they might see, who speaks Spanish, about a named PENS clinician, or which suite to go to. Optional filter (all, md, np, counsel, spanish) and search (part of a clinician's name or a focus such as 'epilepsy'). It never ranks or recommends one clinician over another and does not schedule: scheduling goes through the office.",
  widget: "team-directory",
  invoking: "Opening the team… / Abriendo el equipo…",
  invoked: "The PENS team / El equipo de PENS",
  input: {
    filter: z.enum(TEAM_FILTERS).optional().describe("Show everyone (all, the default), physicians (md), nurse practitioners (np), counseling (counsel), or clinicians who speak Spanish (spanish)."),
    search: z
      .string()
      .max(60)
      .optional()
      .describe("Optional: part of a PENS clinician's name or a focus area, for example 'Quinn' or 'epilepsy'. Only for finding PENS staff. Never a patient's name or details."),
    lang: langParam,
  },
  handler: ({ filter, search }, { lang }) => {
    const es = lang === "es";
    const f: TeamFilter = filter ?? "all";
    const query = typeof search === "string" ? search.trim() : "";
    const shown = TEAM.filter((m) => matchesFilter(m, f) && (!query || matchesSearch(m, query)));
    const count = (role: string) => TEAM.filter((m) => m.role === role).length;

    const team = TEAM.map((m) => ({
      id: m.id,
      name: m.name,
      shortName: shortName(m.name),
      credential: m.credential[lang],
      role: m.role,
      focus: m.focus[lang],
      languages: m.languages[lang],
      spanish: m.spanish,
      suite: m.suite,
      joined: m.joined,
      photo: m.photo,
    }));
    const suites = SUITES.map((s) => ({
      suite: s.suite,
      title: s.title[lang],
      kicker: s.kicker[lang],
      what: s.what[lang],
      who: TEAM.filter((m) => m.suite === s.suite).map((m) => m.id),
    }));

    const line = (m: (typeof TEAM)[number]) =>
      `- ${m.name}, ${m.credential[lang]}: ${m.focus[lang]} ${es ? "Idiomas" : "Languages"}: ${m.languages[lang].join(", ")}.${m.suite ? ` Suite ${m.suite}.` : ""}`;

    return {
      structured: {
        filter: f,
        ...(query ? { matchIds: shown.map((m) => m.id) } : {}),
        total: TEAM.length,
        counts: { md: count("md"), np: count("np"), counsel: count("counsel"), spanish: TEAM.filter((m) => m.spanish !== "no").length },
        team,
        suites,
        notes: { lead: SUITE_NOTES.lead[lang], otherDoors: SUITE_NOTES.otherDoors[lang], confirm: SUITE_NOTES.confirm[lang] },
        links: { reviews: GOOGLE_REVIEWS_URL, providers: PROVIDERS_URL, phone: CLINIC.phone, phoneHref: CLINIC.phoneHref },
        labels: {
          heading: es ? "El equipo" : "The team",
          sub: es ? "Toque una cara para conocer a cada persona." : "Tap a face to meet each person.",
          search: es ? "Buscar en el equipo" : "Search the team",
          filters: Object.fromEntries(TEAM_FILTERS.map((k) => [k, FILTER_LABELS[k][lang]])),
          filterGroup: es ? "Filtrar el equipo" : "Filter the team",
          showing: es ? "Mostrando" : "Showing",
          empty: es ? "Nadie coincide. Pruebe otro nombre o filtro." : "No one matches. Try another name or filter.",
          showAll: es ? "Ver a todos" : "Show everyone",
          openProfile: es ? "Ver perfil" : "Open profile",
          languages: es ? "Idiomas" : "Languages",
          suite: "Suite",
          suiteUnknown: es ? "Vea su recordatorio de cita" : "Check your appointment reminder",
          since: es ? "En PENS desde" : "At PENS since",
          close: es ? "Cerrar" : "Close",
          whichSuite: es ? "¿Qué suite?" : "Which suite?",
          whoHere: es ? "Quién está aquí" : "Who is here",
          reviews: es ? "Lea lo que dicen las familias en Google" : "Read what families say on Google",
          providers: es ? "Conózcalos en el sitio de PENS" : "Meet them on the PENS site",
          schedule: es
            ? "Para programar, llame al consultorio. Este directorio no recomienda a un clínico sobre otro."
            : "To schedule, call the office. This directory does not recommend one clinician over another.",
          call: es ? `Llamar ${CLINIC.phone}` : `Call ${CLINIC.phone}`,
        },
      },
      text: [
        es
          ? `Equipo de PENS: ${TEAM.length} personas (${count("md")} médicos, ${count("np")} enfermeros practicantes, ${count("counsel")} consejeras) en 508 S. Habana Ave., Tampa.`
          : `PENS team: ${TEAM.length} people (${count("md")} physicians, ${count("np")} nurse practitioners, ${count("counsel")} counselors) at 508 S. Habana Ave., Tampa.`,
        query && !shown.length
          ? es ? "Nadie del equipo coincide con esa búsqueda." : "No one on the team matches that search."
          : `${es ? "Mostrando" : "Showing"} ${FILTER_TEXT[f][lang]}${query ? (es ? " que coinciden con la búsqueda" : " matching the search") : ""} (${shown.length}):`,
        ...shown.map(line),
        `${es ? "Suites" : "Suites"}: ${SUITES.map((s) => `${s.title[lang]} (${s.kicker[lang]}: ${s.what[lang].join(", ")})`).join("; ")}. ${SUITE_NOTES.confirm[lang]}`,
        es
          ? `No clasifique ni recomiende a un clínico sobre otro. Para programar, llame a PENS al ${CLINIC.phone}.`
          : `Do not rank or recommend one clinician over another. To schedule, call PENS at ${CLINIC.phone}.`,
      ].join("\n"),
    };
  },
});
