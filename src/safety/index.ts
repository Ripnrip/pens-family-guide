import type { Lang } from "../content/types.js";
import { UI } from "../content/strings.js";
import { detectEmergency, buildEmergencyCard, emergencyText, type EmergencyCard, type EmergencyResult } from "./emergency.js";
import { scrubPhi, findPhiKeys, type PhiKind } from "./phi.js";

export * from "./emergency.js";
export * from "./phi.js";
export { normalizeText } from "./normalize.js";

export interface GuardResult<A> {
  /** Args with every free-text string scrubbed of PHI. */
  args: A;
  phiFound: PhiKind[];
  /** Argument names that looked like PHI fields (they are dropped). */
  phiKeys: string[];
  emergency: EmergencyResult;
}

/**
 * Run the safety layer on tool arguments:
 *  1. drop any argument whose *name* looks like PHI (defense in depth; schemas are already strict),
 *  2. scrub PHI from every free-text string,
 *  3. run the emergency detector on the combined original free text.
 */
export function guardInput<A extends Record<string, unknown>>(rawArgs: A | undefined): GuardResult<A> {
  const input = (rawArgs ?? {}) as Record<string, unknown>;
  const phiKeys = findPhiKeys(input);
  const out: Record<string, unknown> = {};
  const texts: string[] = [];
  const found = new Set<PhiKind>();
  for (const [k, v] of Object.entries(input)) {
    if (phiKeys.includes(k)) continue;
    if (typeof v === "string") {
      texts.push(v);
      const s = scrubPhi(v);
      s.found.forEach((f) => found.add(f));
      out[k] = s.clean;
    } else {
      out[k] = v;
    }
  }
  return { args: out as A, phiFound: [...found], phiKeys, emergency: detectEmergency(texts) };
}

export interface SafetyEnvelope {
  disclaimer: string;
  emergency?: EmergencyCard;
  privacyNotice?: string;
}

export function safetyEnvelope(guard: GuardResult<unknown & Record<string, unknown>>, lang: Lang): SafetyEnvelope {
  const env: SafetyEnvelope = { disclaimer: UI.disclaimer[lang] };
  const card = buildEmergencyCard(guard.emergency, lang);
  if (card) env.emergency = card;
  if (guard.phiFound.length || guard.phiKeys.length) env.privacyNotice = UI.privacyNotice[lang];
  return env;
}

export { emergencyText };
