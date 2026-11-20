/**
 * PENS brand module: the single source for colors, type, the Pip mascot and the logo.
 *
 * Pages, widgets, the guide and the /preview shell all read from here. The logo is the PENS toy
 * blocks, cut out once into scripts/brand-src/pens-blocks-source.png; `npm run brand:logo` rebuilds
 * every derived file in public/assets/ (pens-blocks*.png, pens-logo.svg, pens-logo-*.png, pens-icon-*.png).
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const TOKENS = {
  teal: "#0F6E74",
  sunshine: "#F6B93B",
  /** Decorative only (cheeks, antenna tip, accents). Never for urgent UI. */
  coral: "#F2765A",
  /** Urgent / call-911 UI. White text on brick passes WCAG AA. */
  brick: "#B83A26",
  sky: "#E8F4F6",
  ink: "#1D2B36",
  page: "#F4F6F7",
  white: "#FFFFFF",
} as const;

/**
 * Accent colors sampled from the PENS toy-block logo. Use sparingly (quiz tiles, feature icons,
 * step dots). The base stays teal, and urgent UI stays brick.
 */
export const BLOCKS = {
  red: "#D8433A",
  green: "#5BA83B",
  blue: "#2F7FC9",
  yellow: "#F2C230",
  orange: "#F29A2E",
  cream: "#FFF8EC",
  /** Deeper red and blue for fills that carry white text (4.5:1 or better). */
  redDeep: "#C2362E",
  blueDeep: "#2569A8",
} as const;

/** Midnight theme: deep blue surfaces, lavender controls, warm gold accents. Pip stays sunshine yellow. */
export const MIDNIGHT = {
  bg: "#141B34",
  surface: "#1D2647",
  raised: "#252F57",
  chip: "#2A3560",
  border: "#3A4677",
  ink: "#EEF0FF",
  muted: "#B4BCDB",
  lavender: "#B9B4F5",
  gold: "#F4C76B",
  success: "#8FE3B0",
  urgentBg: "#3B1F2B",
  urgentText: "#FFB4A6",
} as const;

/** Block accents as [fill, text on that fill]. Every pair passes WCAG AA (see tests/theme.test.ts). */
export const BLOCK_ACCENTS: readonly { key: string; fill: string; ink: string }[] = [
  { key: "red", fill: BLOCKS.redDeep, ink: TOKENS.white },
  { key: "blue", fill: BLOCKS.blueDeep, ink: TOKENS.white },
  { key: "yellow", fill: BLOCKS.yellow, ink: TOKENS.ink },
  { key: "green", fill: BLOCKS.green, ink: TOKENS.ink },
  { key: "orange", fill: BLOCKS.orange, ink: TOKENS.ink },
];

/** Text/background pairs used by the themes; tests assert each is at least 4.5:1. */
export const CONTRAST_PAIRS: readonly { name: string; fg: string; bg: string }[] = [
  { name: "light ink on page", fg: TOKENS.ink, bg: TOKENS.page },
  { name: "light ink on surface", fg: TOKENS.ink, bg: TOKENS.white },
  { name: "light muted on surface", fg: "#4A5B68", bg: TOKENS.white },
  { name: "light muted on page", fg: "#4A5B68", bg: TOKENS.page },
  { name: "light muted on cream", fg: "#4A5B68", bg: BLOCKS.cream },
  { name: "light teal on surface", fg: TOKENS.teal, bg: TOKENS.white },
  { name: "light teal on sky", fg: TOKENS.teal, bg: TOKENS.sky },
  { name: "light teal on page", fg: TOKENS.teal, bg: TOKENS.page },
  { name: "light teal on cream", fg: TOKENS.teal, bg: BLOCKS.cream },
  { name: "white on teal", fg: TOKENS.white, bg: TOKENS.teal },
  { name: "ink on sunshine", fg: TOKENS.ink, bg: TOKENS.sunshine },
  { name: "ink on cream", fg: TOKENS.ink, bg: BLOCKS.cream },
  { name: "white on brick", fg: TOKENS.white, bg: TOKENS.brick },
  { name: "brick on urgent tint", fg: TOKENS.brick, bg: "#FBE9E5" },
  { name: "ink on urgent tint", fg: TOKENS.ink, bg: "#FBE9E5" },
  { name: "light success on surface", fg: "#1E7B4A", bg: TOKENS.white },
  ...BLOCK_ACCENTS.map((a) => ({ name: `block ${a.key}`, fg: a.ink, bg: a.fill })),
  { name: "midnight ink on bg", fg: MIDNIGHT.ink, bg: MIDNIGHT.bg },
  { name: "midnight ink on surface", fg: MIDNIGHT.ink, bg: MIDNIGHT.surface },
  { name: "midnight ink on raised", fg: MIDNIGHT.ink, bg: MIDNIGHT.raised },
  { name: "midnight ink on chip", fg: MIDNIGHT.ink, bg: MIDNIGHT.chip },
  { name: "midnight muted on bg", fg: MIDNIGHT.muted, bg: MIDNIGHT.bg },
  { name: "midnight muted on surface", fg: MIDNIGHT.muted, bg: MIDNIGHT.surface },
  { name: "midnight lavender on bg", fg: MIDNIGHT.lavender, bg: MIDNIGHT.bg },
  { name: "midnight lavender on surface", fg: MIDNIGHT.lavender, bg: MIDNIGHT.surface },
  { name: "midnight bg on lavender", fg: MIDNIGHT.bg, bg: MIDNIGHT.lavender },
  { name: "midnight bg on gold", fg: MIDNIGHT.bg, bg: MIDNIGHT.gold },
  { name: "midnight gold on surface", fg: MIDNIGHT.gold, bg: MIDNIGHT.surface },
  { name: "midnight success on surface", fg: MIDNIGHT.success, bg: MIDNIGHT.surface },
  { name: "midnight ink on urgent tint", fg: MIDNIGHT.ink, bg: MIDNIGHT.urgentBg },
  { name: "midnight urgent text on urgent tint", fg: MIDNIGHT.urgentText, bg: MIDNIGHT.urgentBg },
];

function channel(v: number): number {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
/** WCAG 2.x contrast ratio of two #RRGGBB colors. */
export function contrastRatio(a: string, b: string): number {
  const lum = (hex: string) =>
    0.2126 * channel(parseInt(hex.slice(1, 3), 16)) + 0.7152 * channel(parseInt(hex.slice(3, 5), 16)) + 0.0722 * channel(parseInt(hex.slice(5, 7), 16));
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Font stacks. Fredoka/Nunito are used when installed; nothing is fetched (widgets have an empty CSP). */
export const FONT_HEADING = `"Fredoka", "Nunito", ui-rounded, "SF Pro Rounded", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`;
export const FONT_BODY = `"Nunito", ui-rounded, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;

/** Public URL of the swappable logo asset. */
export const LOGO_PUBLIC_PATH = "/assets/pens-logo.svg";
export const LOGO_PNG_PATHS = { 512: "/assets/pens-logo-512.png", 1024: "/assets/pens-logo-1024.png" } as const;
/** Transparent cut-out of the blocks, and square app icons (blocks on a cream rounded tile). */
export const BLOCKS_PNG_PATHS = { 192: "/assets/pens-blocks-192.png", 512: "/assets/pens-blocks-512.png", 1024: "/assets/pens-blocks.png" } as const;
export const ICON_PNG_PATHS = {
  192: "/assets/pens-icon-192.png",
  512: "/assets/pens-icon-512.png",
  1024: "/assets/pens-icon-1024.png",
  maskable: "/assets/pens-icon-maskable-512.png",
} as const;
/** Serif stack for the "Pediatric Epilepsy & Neurology Specialists" wordmark (system fonts only). */
export const FONT_WORDMARK = `"Cormorant Garamond", "Trajan Pro", "Hoefler Text", "Baskerville", "Palatino Linotype", Palatino, Georgia, "Times New Roman", serif`;

/** Built-in fallback mark, used only if public/assets/pens-logo.svg is missing. */
export const PLACEHOLDER_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="PENS">
  <title>PENS</title>
  <rect x="0" y="0" width="512" height="512" rx="112" ry="112" fill="${TOKENS.teal}"/>
  <polyline points="64,214 150,214 178,214 200,150 226,286 252,118 278,262 300,214 340,214 448,214" fill="none" stroke="${TOKENS.sunshine}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="448" cy="214" r="16" fill="${TOKENS.sunshine}"/>
  <text x="256" y="408" text-anchor="middle" font-family="Fredoka, Nunito, 'Arial Rounded MT Bold', Arial, Helvetica, sans-serif" font-weight="700" font-size="132" letter-spacing="6" fill="${TOKENS.white}">PENS</text>
</svg>
`;

const HERE = path.dirname(fileURLToPath(import.meta.url));

/** Project root candidates: src/brand -> ../.., dist/brand -> ../.., and the process cwd (Vercel /var/task). */
export function projectRootCandidates(): string[] {
  return [path.resolve(HERE, "..", ".."), process.cwd()];
}

export function logoFilePath(): string | null {
  for (const root of projectRootCandidates()) {
    const p = path.join(root, "public", "assets", "pens-logo.svg");
    if (existsSync(p)) return p;
  }
  return null;
}

let logoCache: string | null = null;
/** The current logo SVG markup (from public/assets/pens-logo.svg, else the built-in placeholder). */
export function logoSvg(): string {
  if (logoCache === null) {
    const file = logoFilePath();
    logoCache = file ? readFileSync(file, "utf8") : PLACEHOLDER_LOGO_SVG;
  }
  return logoCache;
}

/** data: URI of the logo, for widgets (which cannot load server URLs). */
export function logoDataUri(): string {
  return `data:image/svg+xml;base64,${Buffer.from(logoSvg(), "utf8").toString("base64")}`;
}

export type PipMood = "happy" | "curious" | "calm" | "proud";

const PIP_MOUTHS: Record<PipMood, string> = {
  happy: "M66 112 Q80 126 94 112",
  curious: "M70 116 Q80 119 90 114",
  calm: "M69 114 Q80 121 91 114",
  proud: "M63 110 Q80 132 97 110",
};

/**
 * Pip: a round sunshine-yellow helper with a wavy teal antenna tipped with a coral dot,
 * big ink eyes with white highlights, rosy coral cheeks and a smile. Original character.
 *
 * Class hooks for motion (all disabled under prefers-reduced-motion): .pip-bob, .pip-eyes, .pip-antenna.
 */
export function pipSvg(opts: { mood?: PipMood; size?: number; label?: string; className?: string } = {}): string {
  const mood = opts.mood ?? "happy";
  const size = opts.size ?? 150;
  const label = opts.label ?? "Pip";
  const cls = ["pip", opts.className].filter(Boolean).join(" ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="${size}" height="${size}" class="${cls}" role="img" aria-label="${label}">
<g class="pip-bob">
  <g class="pip-antenna">
    <path d="M80 44 C72 36 90 30 82 22 S86 10 94 9" fill="none" stroke="${TOKENS.teal}" stroke-width="4.5" stroke-linecap="round"/>
    <circle cx="94" cy="9" r="7" fill="${TOKENS.coral}"/>
  </g>
  <ellipse cx="80" cy="150" rx="34" ry="5" fill="${TOKENS.ink}" opacity=".10"/>
  <circle cx="80" cy="94" r="52" fill="${TOKENS.sunshine}"/>
  <path d="M42 74 A52 52 0 0 1 98 44" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity=".35"/>
  <g class="pip-eyes">
    <ellipse cx="63" cy="88" rx="9.5" ry="12" fill="${TOKENS.ink}"/>
    <ellipse cx="97" cy="88" rx="9.5" ry="12" fill="${TOKENS.ink}"/>
    <circle cx="66.5" cy="83" r="3.8" fill="#FFFFFF"/>
    <circle cx="100.5" cy="83" r="3.8" fill="#FFFFFF"/>
    <circle cx="60.5" cy="93" r="1.6" fill="#FFFFFF"/>
    <circle cx="94.5" cy="93" r="1.6" fill="#FFFFFF"/>
  </g>
  <ellipse cx="47" cy="106" rx="9" ry="6" fill="${TOKENS.coral}" opacity=".55"/>
  <ellipse cx="113" cy="106" rx="9" ry="6" fill="${TOKENS.coral}" opacity=".55"/>
  <path d="${PIP_MOUTHS[mood]}" fill="none" stroke="${TOKENS.ink}" stroke-width="4.5" stroke-linecap="round"/>
</g>
</svg>`;
}

/** Shared motion CSS for Pip (used by widgets and pages). */
export const PIP_MOTION_CSS = `
@media (prefers-reduced-motion: no-preference) {
  .pip .pip-bob { animation: pip-bob 3.2s ease-in-out infinite; transform-origin: 80px 150px; }
  .pip .pip-eyes { animation: pip-blink 4.8s infinite; transform-origin: 80px 88px; transform-box: view-box; }
  .pip .pip-antenna { animation: pip-sway 2.6s ease-in-out infinite alternate; transform-origin: 80px 44px; transform-box: view-box; }
}
@keyframes pip-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes pip-blink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(.1); } }
@keyframes pip-sway { from { transform: rotate(-5deg); } to { transform: rotate(5deg); } }
`;

/** Brand payload injected into every widget (all values are trusted, server-generated markup). */
export function widgetBrand(): { logo: string; pip: Record<PipMood, string>; name: string; descriptor: string } {
  const moods: PipMood[] = ["happy", "curious", "calm", "proud"];
  return {
    logo: logoDataUri(),
    pip: Object.fromEntries(moods.map((m) => [m, pipSvg({ mood: m, size: 150 })])) as Record<PipMood, string>,
    name: "PENS",
    descriptor: "Tampa Bay",
  };
}
