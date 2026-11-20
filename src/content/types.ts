/**
 * Shared content types. Every user-facing string exists in English and Spanish.
 *
 * Clinical items carry `clinicReview: "pending"` until a PENS clinician signs off.
 * Launch gate: `tests/content.test.ts` lists every pending item; flip to
 * "approved" only after clinical review (see README "Content review").
 */
export const LANGS = ["en", "es"] as const;
export type Lang = (typeof LANGS)[number];

/** A value that must exist in every supported language. */
export type L<T = string> = Record<Lang, T>;

export type ReviewStatus = "pending" | "approved";

export interface Reviewable {
  /** Stable id used in tests and review logs. */
  id: string;
  /** Clinical sign-off status. Must be "approved" by PENS clinicians before launch. */
  clinicReview: ReviewStatus;
}

/** Marks a fact that must be verified against pensoftampabay.com / the office before launch. */
export const TODO_VERIFY = "TODO-verify" as const;

export function pick<T>(value: L<T>, lang: Lang): T {
  return value[lang];
}
