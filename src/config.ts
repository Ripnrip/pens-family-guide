/** App-wide facts shared by the MCP server, pages, submission metadata and tests. */

export const APP_NAME = "PENS";
export const APP_FULL_NAME = "Pediatric Epilepsy & Neurology Specialists";
export const APP_DESCRIPTOR = "Tampa Bay";
export const OPERATOR = "BinaryBros LLC";
export const SUPPORT_EMAIL = "noeticactivity@gmail.com";
export const PAGES_UPDATED = "2026-11-20";

/**
 * Deployed origin of this app. Widgets may load only the app's own intro animation from here
 * (MCP Apps `_meta.ui.csp.resourceDomains` and ChatGPT `openai/widgetCSP.resource_domains`).
 */
export const PUBLIC_ORIGIN: string = (process.env.PUBLIC_ORIGIN ?? "https://pens-family-guide.vercel.app").replace(/\/+$/, "");

/** First-run intro animation (sped-up block tumble into the PENS logo), served from public/assets. */
export const INTRO_ASSETS = {
  mp4: "/assets/intro.mp4",
  webm: "/assets/intro.webm",
  poster: "/assets/intro-poster.jpg",
} as const;

/** Public MCP endpoint. */
export const MCP_PATH = "/mcp";
/**
 * Stable, unlisted alias of /mcp used for the ChatGPT app directory submission
 * (same pattern as Sanctum Reflections). Keep it in sync with vercel.json.
 */
export const SUBMISSION_PATH = "/mcp/submission-d661e169";

export const CLINIC_CONTACT = {
  name: "Pediatric Epilepsy & Neurology Specialists",
  address: "508 S. Habana Ave., Suite 340, Tampa, FL 33609",
  phone: "(813) 873-7367",
  phoneHref: "tel:+18138737367",
  website: "https://www.pensoftampabay.com/",
  hours: {
    en: ["Monday – Thursday: 7:30 AM – 5:00 PM", "Friday: 7:30 AM – 4:30 PM"],
    es: ["Lunes – jueves: 7:30 a. m. – 5:00 p. m.", "Viernes: 7:30 a. m. – 4:30 p. m."],
  },
} as const;
