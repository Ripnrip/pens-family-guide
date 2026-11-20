/** Lowercase, strip accents and apostrophes, collapse whitespace. "Won’t" -> "wont", "convulsión" -> "convulsion". */
export function normalizeText(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[’'`´]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
