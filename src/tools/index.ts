import { z } from "zod";
import { UI, clinicalItems, reviewStatus } from "../content/index.js";
import { resolveLang } from "../lib/lang.js";
import { emergencyText, guardInput, safetyEnvelope } from "../safety/index.js";
import { widgetUri } from "../widgets/ids.js";
import type { AnyToolDef } from "./types.js";
import { clinicInfo } from "./clinicInfo.js";
import { findCare } from "./findCare.js";
import { prepareForVisit } from "./prepareForVisit.js";
import { myEegDay } from "./myEegDay.js";
import { seizureFirstAid } from "./seizureFirstAid.js";
import { schoolSeizurePlan } from "./schoolSeizurePlan.js";
import { caregiverQuiz } from "./caregiverQuiz.js";
import { requestAppointment } from "./requestAppointment.js";
import { forPediatricians } from "./forPediatricians.js";
import { visitQuestions } from "./visitQuestions.js";

export const TOOLS: AnyToolDef[] = [
  visitQuestions,
  clinicInfo,
  findCare,
  prepareForVisit,
  myEegDay,
  seizureFirstAid,
  schoolSeizurePlan,
  caregiverQuiz,
  requestAppointment,
  forPediatricians,
];

export function getTool(name: string): AnyToolDef | undefined {
  return TOOLS.find((t) => t.name === name);
}

/** Strict input schema: unknown arguments (e.g. `patient_name`, `dob`) are rejected. */
export function inputSchemaFor(def: AnyToolDef) {
  return z.object(def.input).strict();
}

/**
 * Every PENS tool returns static, curated content: no writes, no side effects, no external calls.
 * All four MCP annotation hints are explicit booleans (see chatgpt-app-submission.json for the
 * written justifications).
 */
export const TOOL_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

export function toolAnnotations(def: AnyToolDef) {
  return { title: def.title, ...TOOL_ANNOTATIONS };
}

/**
 * Descriptor-level `_meta`: MCP Apps `ui.resourceUri` links the tool to its UI resource
 * (ext-apps `registerAppTool` also mirrors it to the legacy `ui/resourceUri` key), and the
 * `openai/*` keys keep ChatGPT Apps SDK compatibility.
 */
export function toolMeta(def: AnyToolDef): Record<string, unknown> {
  return {
    ui: { resourceUri: widgetUri(def.widget) },
    "openai/outputTemplate": widgetUri(def.widget),
    "openai/toolInvocation/invoking": def.invoking,
    "openai/toolInvocation/invoked": def.invoked,
    "openai/widgetAccessible": def.widgetAccessible ?? false,
    "openai/resultCanProduceWidget": true,
  };
}

export interface ExecuteResult {
  [key: string]: unknown;
  content: { type: "text"; text: string }[];
  structuredContent: Record<string, unknown>;
  _meta?: Record<string, unknown>;
}

const CONTENT_REVIEW = reviewStatus(clinicalItems());

/**
 * Run a tool through the safety layer: PHI scrub -> emergency detection -> handler -> envelope.
 * Used by the MCP server, the /preview routes and the tests.
 */
export function executeTool(
  def: AnyToolDef,
  rawArgs: Record<string, unknown> | undefined,
  opts: { meta?: Record<string, unknown>; now?: Date } = {},
): ExecuteResult {
  const guard = guardInput(rawArgs ?? {});
  const texts = Object.entries(guard.args)
    .filter(([k, v]) => k !== "lang" && typeof v === "string")
    .map(([, v]) => v as string);
  const lang = resolveLang({ lang: guard.args.lang, meta: opts.meta, texts });
  const env = safetyEnvelope(guard, lang);
  const out = def.handler(guard.args, { lang, now: opts.now ?? new Date() });

  const structuredContent: Record<string, unknown> = JSON.parse(
    JSON.stringify({
      tool: def.name,
      lang,
      ...out.structured,
      ...env,
      contentReview: { status: CONTENT_REVIEW, label: CONTENT_REVIEW === "approved" ? undefined : UI.pendingReview[lang] },
    }),
  );

  const parts: string[] = [];
  if (env.emergency) parts.push(emergencyText(env.emergency));
  if (env.privacyNotice) parts.push(env.privacyNotice);
  parts.push(out.text);
  parts.push(`_${env.disclaimer}_`);

  const result: ExecuteResult = {
    content: [{ type: "text", text: parts.join("\n\n") }],
    structuredContent,
  };
  if (out.widgetMeta) result._meta = out.widgetMeta;
  return result;
}
