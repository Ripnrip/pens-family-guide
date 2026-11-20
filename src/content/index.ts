/**
 * Single typed knowledge module for the PENS app. All user-facing content lives here, EN + ES.
 */
export * from "./types.js";
export * from "./clinic.js";
export * from "./strings.js";
export * from "./services.js";
export * from "./visits.js";
export * from "./firstAid.js";
export * from "./schoolPlan.js";
export * from "./quiz.js";
export * from "./eegStory.js";
export * from "./referral.js";
export * from "./questions.js";
export * from "./team.js";

import type { Reviewable } from "./types.js";
import { ALL_CARE } from "./services.js";
import { VISITS } from "./visits.js";
import { FIRST_AID_STEPS, FIRST_AID_DONTS, CALL_911_WHEN } from "./firstAid.js";
import { HB1201 } from "./schoolPlan.js";
import { QUIZ } from "./quiz.js";
import { SCENES } from "./eegStory.js";
import { REFERRAL } from "./referral.js";
import { QUESTION_SETS } from "./questions.js";
import { SUITES, TEAM } from "./team.js";

/** Every clinical item that needs PENS clinician sign-off before launch. */
export function clinicalItems(): Reviewable[] {
  return [
    ...ALL_CARE,
    ...VISITS,
    ...FIRST_AID_STEPS,
    FIRST_AID_DONTS,
    CALL_911_WHEN,
    HB1201,
    ...QUIZ,
    ...SCENES,
    REFERRAL,
    ...QUESTION_SETS,
    ...TEAM,
    ...SUITES,
  ];
}

/** Summary used in structuredContent so reviewers and hosts can see review state. */
export function reviewStatus(items: Reviewable[]): "pending" | "approved" {
  return items.every((i) => i.clinicReview === "approved") ? "approved" : "pending";
}
