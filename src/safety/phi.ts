/**
 * PHI guard. This app never collects protected health information:
 *  - No tool input schema has fields for names, birthdates, record numbers or contact info,
 *    and schemas are strict, so unknown fields (e.g. `patient_name`, `dob`) are rejected.
 *  - Free text is scrubbed before use, and tools never echo user text back.
 */

export type PhiKind = "email" | "phone" | "ssn" | "date" | "record_number" | "long_number" | "name";

export interface PhiScrubResult {
  clean: string;
  found: PhiKind[];
}

const MONTHS =
  "jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre";

const PATTERNS: { kind: PhiKind; re: RegExp; replacement: string }[] = [
  { kind: "email", re: /[\w.+-]+@[\w-]+(\.[\w-]+)+/gi, replacement: "[email removed]" },
  { kind: "ssn", re: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: "[id removed]" },
  {
    kind: "record_number",
    re: /\b(mrn|medical record(?: number| no\.?| #)?|record (?:number|no\.?|#)|chart (?:number|no\.?|#)|patient id|member id|policy (?:number|no\.?|#)|n[uú]mero de expediente|expediente|historia cl[ií]nica)\b\s*[:#]?\s*[\w-]*\d[\w-]*/gi,
    replacement: "[record number removed]",
  },
  {
    kind: "phone",
    re: /(?:\+?1[\s.-]?)?\(?\b\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g,
    replacement: "[phone removed]",
  },
  {
    kind: "date",
    re: new RegExp(
      [
        String.raw`\b\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}\b`,
        String.raw`\b\d{4}-\d{2}-\d{2}\b`,
        String.raw`\b(?:${MONTHS})\.?\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}\b`,
        String.raw`\b\d{1,2}\s+(?:de\s+)?(?:${MONTHS})\s+(?:de(?:l)?\s+)?\d{4}\b`,
      ].join("|"),
      "gi",
    ),
    replacement: "[date removed]",
  },
  { kind: "long_number", re: /\b\d{6,}\b/g, replacement: "[number removed]" },
  {
    kind: "name",
    // "my son's name is Jake Smith", "she is named Ana", "se llama Sofía", "me llamo Ana", "his name: Leo"
    re: /\b((?:his|her|their|my|the child'?s?|my (?:son|daughter|child|kid)'?s?|patient'?s?) name(?: is|:)|named|me llamo|se llama|mi nombre es|su nombre es|my name is|nombre(?: del paciente)?:)\s+([\p{L}][\p{L}'-]*)(\s+[\p{Lu}][\p{L}'-]*)?/giu,
    replacement: "$1 [name removed]",
  },
];

export function scrubPhi(input: string): PhiScrubResult {
  let clean = input;
  const found = new Set<PhiKind>();
  for (const { kind, re, replacement } of PATTERNS) {
    re.lastIndex = 0;
    if (re.test(clean)) {
      found.add(kind);
      re.lastIndex = 0;
      clean = clean.replace(re, replacement);
    }
  }
  return { clean, found: [...found] };
}

/** Argument names that would indicate an attempt to send PHI. Used for defense-in-depth checks. */
const PHI_KEY = /(^|_)(name|first|last|full_?name|dob|birth|birthday|birthdate|mrn|ssn|record|chart|email|phone|address|insurance_id|member_id|policy)(_|$)/i;

export function findPhiKeys(args: Record<string, unknown> | undefined | null): string[] {
  if (!args) return [];
  return Object.keys(args).filter((k) => PHI_KEY.test(k));
}
