export const WIDGET_IDS = [
  "question-card",
  "clinic-card",
  "find-care",
  "visit-prep",
  "eeg-adventure",
  "seizure-first-aid",
  "school-plan",
  "caregiver-quiz",
  "appointment-handoff",
  "referral-card",
  "team-directory",
] as const;

export type WidgetId = (typeof WIDGET_IDS)[number];

/** MCP Apps UI resource URI, e.g. ui://pens/clinic-card.html */
export const widgetUri = (id: WidgetId) => `ui://pens/${id}.html`;
