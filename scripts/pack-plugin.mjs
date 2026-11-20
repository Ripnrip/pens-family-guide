// Builds the ChatGPT plugin package (same shape as the published BinaryBros plugins):
//   pens-family-guide/{plugin.json, mcp.json, assets/icon.png, skills/pens-family-guide/SKILL.md}
// Usage: npm run plugin:pack -- --base-url=https://your-host.vercel.app
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const arg = process.argv.find((a) => a.startsWith("--base-url="));
const base = (arg ? arg.split("=")[1] : "https://pens-family-guide.vercel.app").replace(/\/+$/, "");
const cfg = readFileSync(path.join(root, "src/config.ts"), "utf8");
const submission = cfg.match(/SUBMISSION_PATH\s*=\s*"([^"]+)"/)[1];
const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
const version = process.env.PLUGIN_VERSION || "1.0.0";

const src = path.join(root, "plugin/pens-family-guide");
const out = path.join(root, "dist-plugin");
const stage = path.join(out, "pens-family-guide");
rmSync(out, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });
cpSync(path.join(src, "skills"), path.join(stage, "skills"), { recursive: true });
mkdirSync(path.join(stage, "assets"), { recursive: true });
cpSync(path.join(src, "assets/icon.png"), path.join(stage, "assets/icon.png"));

const plugin = {
  $schema: "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  name: "pens-family-guide",
  version,
  description: "Answers from Pediatric Epilepsy & Neurology Specialists (PENS) in Tampa for families, caregivers, schools and pediatricians, in English and Spanish.",
  author: { name: "BinaryBros LLC", email: "noeticactivity@gmail.com", url: base },
  homepage: base,
  keywords: ["pediatric neurology", "epilepsy", "EEG", "ADHD", "Tampa", "bilingual"],
  extensions: {
    "com.openai": {
      interface: {
        displayName: "PENS Family Guide",
        shortDescription: "Pediatric neurology, Tampa Bay",
        longDescription:
          "Pediatric Epilepsy & Neurology Specialists (PENS) in South Tampa, inside your assistant. Find care, prepare for an EEG or ADHD testing, build a bilingual question card for your visit, help kids get ready with Pip, learn seizure first aid, and set up Florida school seizure plans. General information only, not medical advice; in an emergency, call 911. No patient information is collected.",
        developerName: "BinaryBros LLC",
        category: "Education & Research",
        capabilities: ["Interactive"],
        websiteURL: base,
        supportURL: `${base}/support`,
        privacyPolicyURL: `${base}/privacy`,
        termsOfServiceURL: `${base}/terms`,
        composerIcon: "./assets/icon.png",
        logo: "./assets/icon.png",
        brandColor: "#0F6E74",
        brandColorDark: "#5FC4C9",
        defaultPrompt: [
          "Does PENS see kids with ADHD?",
          "Help us ask our questions in both languages at our EEG visit.",
          "Mi hija tiene un EEG con privación de sueño. ¿Cómo nos preparamos?",
        ],
      },
      publication: {
        release_notes: "First release: ten read-only, bilingual PENS tools with interactive cards (find care, visit prep, our questions card, My EEG Day with Pip, seizure first aid, school seizure plans, caregiver quiz, clinic info, appointment hand-off, referral info). No patient data is collected.",
        translations: {
          es: {
            subtitle: "Neurología pediátrica, Tampa",
            description:
              "Pediatric Epilepsy & Neurology Specialists (PENS) del sur de Tampa en su asistente. Encuentre atención, prepárese para un EEG o pruebas de TDAH, prepare una tarjeta de preguntas bilingüe, ayude a los niños con Pip, aprenda primeros auxilios para convulsiones y planes escolares de Florida. Información general, no consejo médico; en una emergencia, llame al 911.",
          },
        },
      },
    },
  },
};
const mcp = {
  $schema: "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
  mcpServers: { "pens-family-guide": { type: "streamable-http", url: `${base}${submission}` } },
};
writeFileSync(path.join(stage, "plugin.json"), JSON.stringify(plugin, null, 2) + "\n");
writeFileSync(path.join(stage, "mcp.json"), JSON.stringify(mcp, null, 2) + "\n");
const zip = path.join(out, `pens-family-guide-${version}.zip`);
execFileSync("zip", ["-r", "-X", "-q", zip, "pens-family-guide", "-x", "*/.*"], { cwd: out });
console.log(`Packed ${zip}\n  MCP: ${mcp.mcpServers["pens-family-guide"].url}\n  pkg: ${pkg.name}`);
