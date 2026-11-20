import { RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { buildWidgetHtml } from "./shared.js";
import { PUBLIC_ORIGIN } from "../config.js";
import { WIDGET_IDS, widgetUri, type WidgetId } from "./ids.js";
import type { WidgetSource } from "./types.js";
import { clinicCard } from "./clinicCard.js";
import { findCareWidget } from "./findCare.js";
import { visitPrepWidget } from "./visitPrep.js";
import { eegAdventureWidget } from "./eegAdventure.js";
import { seizureFirstAidWidget } from "./seizureFirstAid.js";
import { schoolPlanWidget } from "./schoolPlan.js";
import { caregiverQuizWidget } from "./caregiverQuiz.js";
import { questionCardWidget } from "./questionCard.js";
import { teamDirectoryWidget } from "./teamDirectory.js";
import { appointmentHandoffWidget, referralCardWidget } from "./handoffAndReferral.js";

export { WIDGET_IDS, widgetUri, type WidgetId };

export const WIDGETS: Record<WidgetId, WidgetSource> = {
  "question-card": questionCardWidget,
  "clinic-card": clinicCard,
  "find-care": findCareWidget,
  "visit-prep": visitPrepWidget,
  "eeg-adventure": eegAdventureWidget,
  "seizure-first-aid": seizureFirstAidWidget,
  "school-plan": schoolPlanWidget,
  "caregiver-quiz": caregiverQuizWidget,
  "appointment-handoff": appointmentHandoffWidget,
  "referral-card": referralCardWidget,
  "team-directory": teamDirectoryWidget,
};

/** MCP Apps standard mime type: "text/html;profile=mcp-app" (rendered by ChatGPT, Claude and other MCP Apps hosts). */
export const WIDGET_MIME_TYPE: string = RESOURCE_MIME_TYPE;

const cache = new Map<WidgetId, string>();

/** Full self-contained HTML (inline CSS + JS) for a widget. */
export function widgetHtml(id: WidgetId): string {
  let html = cache.get(id);
  if (!html) {
    const w = WIDGETS[id];
    html = buildWidgetHtml({ id, title: w.title, css: w.css, script: w.script });
    cache.set(id, html);
  }
  return html;
}

/**
 * Resource-level `_meta`: MCP Apps `ui` plus the ChatGPT Apps SDK compatibility keys. The CSP allows
 * one resource origin, the app's own (PUBLIC_ORIGIN), for the first-run intro clip; no connections.
 */
export function widgetResourceMeta(id: WidgetId): Record<string, unknown> {
  return {
    ui: { csp: { connectDomains: [], resourceDomains: [PUBLIC_ORIGIN] }, prefersBorder: true },
    "openai/widgetDescription": WIDGETS[id].description,
    "openai/widgetPrefersBorder": true,
    "openai/widgetCSP": { connect_domains: [], resource_domains: [PUBLIC_ORIGIN] },
  };
}
