import { ARRIVAL_TIPS, CLINIC, HOURS_SUMMARY, UI } from "../content/index.js";
import { TEAM } from "../content/team.js";
import { TEAM_PHOTOS } from "../content/teamPhotos.js";
import { describeStatus, getOpenStatus } from "../lib/hours.js";
import { defineTool, langParam } from "./types.js";

export const clinicInfo = defineTool({
  name: "clinic_info",
  title: "PENS clinic info & hours",
  description:
    "Get Pediatric Epilepsy & Neurology Specialists (PENS, Tampa, FL) office hours, whether the office is open right now (Eastern time), the lunch closure, address, phone, fax, map link, and arrival/parking tips. Use when someone asks when PENS is open, where it is, how to call, or how to get there.",
  widget: "clinic-card",
  invoking: "Checking PENS hours… / Consultando el horario…",
  invoked: "PENS clinic info / Información de la clínica",
  input: { lang: langParam },
  handler: (_args, { lang, now }) => {
    const status = getOpenStatus(now);
    const desc = describeStatus(status, lang);
    const hours = HOURS_SUMMARY[lang];
    const tips = ARRIVAL_TIPS.map((t) => ({ id: t.id, text: t.text[lang], verified: t.verified }));
    const es = lang === "es";
    return {
      structured: {
        clinic: {
          name: CLINIC.name,
          shortName: CLINIC.shortName,
          tagline: CLINIC.tagline[lang],
          medicalDirector: CLINIC.medicalDirector,
          team: CLINIC.team[lang],
          address: CLINIC.address.full,
          phone: CLINIC.phone,
          phoneHref: CLINIC.phoneHref,
          fax: CLINIC.fax,
          email: CLINIC.email,
          mapUrl: CLINIC.links.map,
          website: CLINIC.links.website,
          directionsUrl: CLINIC.links.directions,
        },
        status: { state: status.state, label: desc.label, detail: desc.detail, localTime: status.localTime, timeZone: CLINIC.timeZone },
        hours,
        arrivalTips: tips,
        teamPreview: {
          count: TEAM.length,
          spanishCount: TEAM.filter((m) => m.spanish === "yes").length,
          faces: TEAM.slice(0, 6).map((m) => ({ name: m.name, photo: TEAM_PHOTOS[m.photo] ?? "" })).filter((f) => f.photo),
          title: es ? "Conozca al equipo" : "Meet the team",
          blurb: es
            ? `${TEAM.length} médicos, enfermeros practicantes y consejeros, varios hablan español.`
            : `${TEAM.length} doctors, nurse practitioners and counselors, several who speak Spanish.`,
          cta: es ? "Ver el equipo" : "Meet the team",
          prompt: es ? "Muéstrame el equipo de PENS" : "Show me the PENS team",
        },
        labels: {
          hours: es ? "Horario" : "Hours",
          address: es ? "Dirección" : "Address",
          arrival: es ? "Al llegar" : "Arriving",
          call: UI.call[lang],
          directions: UI.directions[lang],
          website: UI.website[lang],
          fax: "Fax",
          director: es ? "Director médico" : "Medical director",
          unverified: es ? "por verificar" : "to verify",
          timeNote: es ? "Hora del Este (Tampa)" : "Eastern Time (Tampa)",
        },
      },
      text: [
        `${CLINIC.name} (PENS): ${desc.label}. ${desc.detail}`,
        ...hours.map((h) => `- ${h.days}: ${h.hours}`),
        `${es ? "Dirección" : "Address"}: ${CLINIC.address.full}`,
        `${es ? "Teléfono" : "Phone"}: ${CLINIC.phone} · Fax: ${CLINIC.fax}`,
        `${es ? "Mapa" : "Map"}: ${CLINIC.links.map}`,
      ].join("\n"),
    };
  },
});
