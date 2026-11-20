/**
 * Phone-first Family Guide (/guide), its web manifest, a QR code to it, and a printable
 * waiting-room poster. Each card opens the same widget code the ChatGPT/Claude app uses, via /preview.
 */
import QRCode from "qrcode";
import type { Request } from "express";
import { CLINIC } from "./content/clinic.js";

type Lang = "en" | "es";
type T = { en: string; es: string };

interface GuideCard {
  widget: string;
  query?: string;
  title: T;
  blurb: T;
  accent: string;
}

const PROMPTS: { text: T; widget: string; query?: string }[] = [
  { text: { en: "Help us ask our questions in both languages", es: "Ayúdenos a preparar nuestras preguntas en los dos idiomas" }, widget: "question-card", query: "visit_type=routine_eeg" },
  { text: { en: "Can my kid try the EEG stickers?", es: "¿Mi hijo puede probar las pegatinas del EEG?" }, widget: "eeg-adventure" },
  { text: { en: "Grandma is babysitting. Can we practice together?", es: "La abuela lo cuida hoy. ¿Podemos practicar juntos?" }, widget: "caregiver-quiz" },
];

const CARDS: GuideCard[] = [
  { widget: "question-card", title: { en: "Our questions", es: "Nuestras preguntas" }, blurb: { en: "Pick questions, then pass the phone in English or Spanish.", es: "Elija preguntas y pase el teléfono en español o inglés." }, accent: "#2F7FC9" },
  { widget: "find-care", title: { en: "Find care", es: "Encontrar atención" }, blurb: { en: "Does PENS see kids for this? See services and next steps.", es: "¿PENS atiende esto? Vea servicios y próximos pasos." }, accent: "#0F6E74" },
  { widget: "visit-prep", query: "visit_type=sleep_deprived_eeg", title: { en: "Visit prep", es: "Preparar la visita" }, blurb: { en: "Checklists for EEGs, ADHD testing and first visits.", es: "Listas para EEG, pruebas de TDAH y primeras visitas." }, accent: "#5BA83B" },
  { widget: "eeg-adventure", title: { en: "My EEG Day with Pip", es: "Mi día de EEG con Pip" }, blurb: { en: "A short game that walks kids through an EEG.", es: "Un juego corto que explica el EEG a los niños." }, accent: "#F2C230" },
  { widget: "seizure-first-aid", title: { en: "Seizure first aid", es: "Primeros auxilios" }, blurb: { en: "Stay, safe, side, with a timer for the 5-minute mark.", es: "Quédese, seguro, de lado, con un cronómetro de 5 minutos." }, accent: "#B83A26" },
  { widget: "school-plan", title: { en: "Seizure-Ready Circle", es: "Círculo Preparado" }, blurb: { en: "Florida school seizure plans and who needs training.", es: "Planes escolares de Florida y quién necesita capacitación." }, accent: "#F29A2E" },
  { widget: "caregiver-quiz", title: { en: "Caregiver quiz", es: "Prueba para cuidadores" }, blurb: { en: "Five quick questions for sitters, coaches and grandparents.", es: "Cinco preguntas para niñeras, entrenadores y abuelos." }, accent: "#D8433A" },
  { widget: "clinic-card", title: { en: "Hours and directions", es: "Horario y cómo llegar" }, blurb: { en: "Open now? Address, phone and directions.", es: "¿Abierto ahora? Dirección, teléfono y cómo llegar." }, accent: "#0F6E74" },
  { widget: "appointment-handoff", title: { en: "Request an appointment", es: "Solicitar una cita" }, blurb: { en: "The official request form, phone and portal.", es: "El formulario oficial, teléfono y portal." }, accent: "#2F7FC9" },
  { widget: "referral-card", title: { en: "For pediatricians", es: "Para pediatras" }, blurb: { en: "How to refer a patient to PENS.", es: "Cómo referir a un paciente a PENS." }, accent: "#5BA83B" },
];

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function originOf(req: Request): string {
  const proto = String(req.headers["x-forwarded-proto"] ?? req.protocol ?? "https").split(",")[0];
  const host = String(req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost");
  return `${proto}://${host}`;
}

const FONT_STACK = "'Nunito', ui-rounded, 'SF Pro Rounded', system-ui, -apple-system, 'Segoe UI', sans-serif";
const HEAD_STACK = "'Fredoka', ui-rounded, 'SF Pro Rounded', system-ui, sans-serif";

export function guidePage(langIn: unknown, themeIn: unknown): string {
  const lang: Lang = langIn === "es" ? "es" : "en";
  const theme = themeIn === "midnight" || themeIn === "dark" ? "midnight" : "light";
  const L = (t: T) => esc(t[lang]);
  const q = (extra?: string) => {
    const parts = [`lang=${lang}`];
    if (theme === "midnight") parts.push("theme=dark");
    if (extra) parts.push(extra);
    return parts.join("&");
  };
  const other = lang === "en" ? "es" : "en";
  const otherTheme = theme === "light" ? "midnight" : "light";
  const prompts = PROMPTS.map((p) => `<a class="prompt" href="/preview/${p.widget}?${q(p.query)}">${L(p.text)}<span aria-hidden="true">→</span></a>`).join("");
  const cards = CARDS.map(
    (c) => `<a class="card" href="/preview/${c.widget}?${q(c.query)}" style="--accent:${c.accent}"><span class="dot" aria-hidden="true"></span><span class="ct">${L(c.title)}</span><span class="cb">${L(c.blurb)}</span></a>`,
  ).join("");
  return `<!doctype html>
<html lang="${lang}" data-theme="${theme}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${lang === "es" ? "Guía Familiar de PENS" : "PENS Family Guide"}</title>
<meta name="description" content="${lang === "es" ? "Respuestas de PENS para familias de Tampa Bay, en inglés y español." : "Answers from PENS for Tampa Bay families, in English and Spanish."}">
<link rel="manifest" href="/guide/manifest.webmanifest">
<link rel="icon" href="/assets/pens-icon-192.png">
<link rel="apple-touch-icon" href="/assets/pens-icon-512.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="PENS">
<meta name="theme-color" content="${theme === "midnight" ? "#141B34" : "#F4F6F7"}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
:root{--bg:#F4F6F7;--surface:#FFFFFF;--ink:#1D2B36;--muted:#4A5A66;--line:#DCE3E6;--brand:#0F6E74;--chip:#E8F4F6;--chipInk:#0F6E74;--prompt:#FFF8EC;--promptLine:#F2D9A6}
[data-theme=midnight]{--bg:#141B34;--surface:#1D2647;--ink:#F2F0FF;--muted:#C6C3E6;--line:#323D66;--brand:#B9B4F5;--chip:#2A3460;--chipInk:#E3E0FF;--prompt:#26305A;--promptLine:#F4C76B}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:${FONT_STACK};-webkit-font-smoothing:antialiased}
a{color:inherit}
.wrap{max-width:560px;margin:0 auto;padding:16px 18px calc(32px + env(safe-area-inset-bottom))}
header{display:flex;align-items:center;gap:12px;padding:6px 0 14px}
header img{width:52px;height:52px}
.brand{display:flex;flex-direction:column;flex:1;min-width:0}
.brand b{font-family:${HEAD_STACK};font-size:22px;line-height:1.1}
.brand span{font-size:12.5px;color:var(--muted)}
.pill{font-size:11.5px;font-weight:800;padding:3px 9px;border-radius:999px;background:var(--chip);color:var(--chipInk)}
.toggles{display:flex;gap:8px;margin:2px 0 18px}
.toggles a{min-height:44px;padding:0 16px;display:inline-flex;align-items:center;border-radius:999px;background:var(--surface);border:1px solid var(--line);font-weight:800;font-size:14px;text-decoration:none}
h1{font-family:${HEAD_STACK};font-size:28px;line-height:1.15;margin:4px 0 6px}
.lead{color:var(--muted);margin:0 0 16px;font-size:16px;line-height:1.45}
h2{font-family:${HEAD_STACK};font-size:19px;margin:24px 0 10px}
.prompt{display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:56px;padding:12px 16px;margin-bottom:10px;border-radius:16px;background:var(--prompt);border:1px solid var(--promptLine);font-weight:800;font-size:16px;text-decoration:none}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.card{display:flex;flex-direction:column;gap:6px;min-height:132px;padding:14px;border-radius:18px;background:var(--surface);border:1px solid var(--line);text-decoration:none;transition:transform .15s ease}
.card:active{transform:scale(.98)}
.dot{width:12px;height:12px;border-radius:4px;background:var(--accent)}
.ct{font-family:${HEAD_STACK};font-size:17px;line-height:1.2}
.cb{font-size:13.5px;color:var(--muted);line-height:1.4}
.install{margin-top:24px;padding:16px;border-radius:18px;background:var(--surface);border:1px solid var(--line);font-size:14.5px;line-height:1.5}
.install b{font-family:${HEAD_STACK};font-size:16px}
footer{margin-top:22px;font-size:13px;color:var(--muted);line-height:1.6}
.urgent{color:#B83A26;font-weight:800}
[data-theme=midnight] .urgent{color:#FFB4A8}
@media (prefers-reduced-motion:reduce){.card{transition:none}}
</style>
</head>
<body>
<div class="wrap">
<header>
  <img src="/assets/pens-blocks-192.png" alt="PENS">
  <div class="brand"><b>PENS</b><span>Pediatric Epilepsy &amp; Neurology Specialists</span></div>
  <span class="pill">${lang === "es" ? "Versión previa" : "Preview"}</span>
</header>
<nav class="toggles" aria-label="${lang === "es" ? "Idioma y tema" : "Language and theme"}">
  <a href="/guide?lang=${other}${theme === "midnight" ? "&theme=midnight" : ""}" lang="${other}">${other === "es" ? "Español" : "English"}</a>
  <a href="/guide?lang=${lang}&theme=${otherTheme}">${otherTheme === "midnight" ? (lang === "es" ? "Modo noche" : "Midnight") : (lang === "es" ? "Modo claro" : "Light")}</a>
</nav>
<h1>${lang === "es" ? "Guía Familiar de PENS" : "PENS Family Guide"}</h1>
<p class="lead">${lang === "es" ? "Respuestas claras de PENS para familias de Tampa Bay, en inglés y español." : "Clear answers from PENS for Tampa Bay families, in English and Spanish."}</p>
<h2>${lang === "es" ? "¿Qué lo trae hoy?" : "What brings you here?"}</h2>
${prompts}
<h2>${lang === "es" ? "Todas las herramientas" : "All tools"}</h2>
<div class="grid">${cards}</div>
<div class="install">
  <b>${lang === "es" ? "Agregar a la pantalla de inicio" : "Add to your home screen"}</b><br>
  ${lang === "es"
    ? "iPhone: toque Compartir y luego “Agregar a inicio”. Android: toque el menú ⋮ y luego “Agregar a la pantalla principal”."
    : "iPhone: tap Share, then “Add to Home Screen”. Android: tap the ⋮ menu, then “Add to Home screen”."}
</div>
<footer>
  <span class="urgent">${lang === "es" ? "En una emergencia, llame al 911." : "In an emergency, call 911."}</span><br>
  ${lang === "es" ? "Información general, no consejo médico." : "General information, not medical advice."}
  <a href="${esc(CLINIC.phoneHref)}">${esc(CLINIC.phone)}</a><br>
  <a href="/">${lang === "es" ? "Inicio" : "Home"}</a> · <a href="/privacy">${lang === "es" ? "Privacidad" : "Privacy"}</a> · <a href="/terms">${lang === "es" ? "Términos" : "Terms"}</a> · <a href="/support">${lang === "es" ? "Ayuda" : "Support"}</a><br>
  ${lang === "es" ? "App operada por BinaryBros LLC para PENS." : "App operated by BinaryBros LLC for PENS."}
</footer>
</div>
</body>
</html>`;
}

export function guideManifest(): Record<string, unknown> {
  return {
    name: "PENS Family Guide",
    short_name: "PENS",
    description: "Answers from Pediatric Epilepsy & Neurology Specialists for Tampa Bay families, in English and Spanish.",
    start_url: "/guide",
    scope: "/",
    display: "standalone",
    background_color: "#F4F6F7",
    theme_color: "#0F6E74",
    icons: [
      { src: "/assets/pens-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/assets/pens-icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/assets/pens-icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

export async function qrSvg(url: string): Promise<string> {
  return QRCode.toString(url, { type: "svg", errorCorrectionLevel: "M", margin: 1, color: { dark: "#1D2B36", light: "#FFFFFF" } });
}

export async function waitingRoomPage(origin: string): Promise<string> {
  const url = `${origin}/guide`;
  const svg = await qrSvg(url);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PENS Family Guide · Waiting room</title>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Nunito:wght@400;700&display=swap" rel="stylesheet">
<style>
@page{size:letter;margin:0.5in}
body{margin:0;font-family:${FONT_STACK};color:#1D2B36;background:#FFF8EC}
.sheet{max-width:7.5in;margin:0 auto;padding:36px 28px;text-align:center}
img.logo{width:220px}
h1{font-family:${HEAD_STACK};font-size:40px;margin:14px 0 4px;color:#0F6E74}
h2{font-family:${HEAD_STACK};font-size:28px;margin:0 0 24px;color:#1D2B36}
.qr{width:3.6in;height:3.6in;margin:0 auto;padding:14px;background:#fff;border-radius:24px;border:4px solid #0F6E74}
.qr svg{width:100%;height:100%}
.url{font-size:15px;margin-top:12px;color:#4A5A66;word-break:break-all}
ul{list-style:none;padding:0;margin:24px auto 0;max-width:5.6in;text-align:left;font-size:17px;line-height:1.7}
.foot{margin-top:24px;font-size:14px;color:#4A5A66}
.urgent{color:#B83A26;font-weight:700}
</style>
</head>
<body>
<div class="sheet">
  <img class="logo" src="/assets/pens-blocks-512.png" alt="PENS">
  <h1>Scan to open the PENS Family Guide</h1>
  <h2>Escanee para abrir la Guía Familiar de PENS</h2>
  <div class="qr" role="img" aria-label="QR code to ${esc(url)}">${svg}</div>
  <div class="url">${esc(url)}</div>
  <ul>
    <li>Questions for your visit, in English and Spanish · Preguntas para su visita</li>
    <li>EEG prep and a game with Pip for kids · Preparación para el EEG</li>
    <li>Seizure first aid for caregivers · Primeros auxilios</li>
  </ul>
  <p class="foot">General information, not medical advice. · Información general, no consejo médico.<br><span class="urgent">In an emergency, call 911. · En una emergencia, llame al 911.</span></p>
</div>
</body>
</html>`;
}

/** /try: in-chat style live demo plus the ways to share while the directory listing is pending. */
export function tryPage(origin: string, langIn: unknown): string {
  const lang: Lang = langIn === "es" ? "es" : "en";
  const es = lang === "es";
  const demos: { label: T; widget: string; query?: string; ask: T }[] = [
    { label: { en: "Our questions", es: "Nuestras preguntas" }, widget: "question-card", query: "visit_type=routine_eeg", ask: { en: "Help us ask our questions in both languages at our EEG visit.", es: "Ayúdenos a preparar nuestras preguntas en los dos idiomas para el EEG." } },
    { label: { en: "Find care", es: "Encontrar atención" }, widget: "find-care", query: "concern=ADHD", ask: { en: "Does PENS see kids with ADHD?", es: "¿PENS atiende a niños con TDAH?" } },
    { label: { en: "EEG prep", es: "Preparar EEG" }, widget: "visit-prep", query: "visit_type=sleep_deprived_eeg", ask: { en: "My daughter has a sleep-deprived EEG Thursday. How do we get ready?", es: "Mi hija tiene un EEG con privación de sueño el jueves. ¿Cómo nos preparamos?" } },
    { label: { en: "Pip's EEG game", es: "Juego de Pip" }, widget: "eeg-adventure", ask: { en: "Can you show my 6-year-old what happens at an EEG?", es: "¿Puede mostrarle a mi hijo de 6 años qué pasa en un EEG?" } },
    { label: { en: "Seizure first aid", es: "Primeros auxilios" }, widget: "seizure-first-aid", ask: { en: "What do I do if he has a seizure?", es: "¿Qué hago si tiene una convulsión?" } },
    { label: { en: "Caregiver quiz", es: "Prueba para cuidadores" }, widget: "caregiver-quiz", ask: { en: "Grandma is babysitting. Can we practice together?", es: "La abuela lo cuida hoy. ¿Podemos practicar juntos?" } },
  ];
  const src = (d: (typeof demos)[number]) => `/preview/${d.widget}?lang=${lang}${d.query ? "&" + d.query : ""}`;
  const buttons = demos
    .map((d, i) => `<button type="button" class="chip${i === 0 ? " on" : ""}" data-src="${esc(src(d))}" data-ask="${esc(d.ask[lang])}">${esc(d.label[lang])}</button>`)
    .join("");
  const mcp = `${origin}/mcp`;
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${es ? "Pruebe PENS · estudio en vivo" : "Try PENS · live studio"}</title>
<meta name="description" content="${es ? "Pruebe la app de PENS para ChatGPT y Claude con las mismas herramientas del plugin." : "Try the PENS app for ChatGPT and Claude with the same tools the plugin uses."}">
<link rel="icon" href="/assets/pens-icon-192.png">
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
:root{--bg:#F4F6F7;--ink:#1D2B36;--muted:#4A5A66;--line:#DCE3E6;--teal:#0F6E74;--sky:#E8F4F6}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:${FONT_STACK}}
a{color:var(--teal)}
header{max-width:1100px;margin:0 auto;padding:16px 20px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
header img{width:44px;height:44px}header b{font-family:${HEAD_STACK};font-size:20px}
header .status{font-size:13px;color:var(--muted)}header nav{margin-left:auto;display:flex;gap:16px;flex-wrap:wrap;font-weight:700;font-size:14px}
main{max-width:1100px;margin:0 auto;padding:0 20px 40px;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:24px}
@media (max-width:860px){main{grid-template-columns:1fr}}
.chat{background:#fff;border:1px solid var(--line);border-radius:24px;overflow:hidden;display:flex;flex-direction:column}
.bar{padding:12px 18px;border-bottom:1px solid var(--line);font-size:13px;color:var(--muted)}
.ask{align-self:flex-end;max-width:85%;margin:16px 18px 8px;background:#E2E8EB;padding:10px 16px;border-radius:18px;font-size:15px}
iframe{border:0;width:100%;height:680px;background:var(--bg)}
.chips{display:flex;gap:8px;flex-wrap:wrap;padding:12px 18px;border-top:1px solid var(--line)}
.chip{min-height:44px;padding:0 14px;border-radius:999px;border:1px solid var(--line);background:#fff;font:700 14px ${FONT_STACK};color:var(--ink);cursor:pointer}
.chip.on{background:var(--teal);border-color:var(--teal);color:#fff}
h1{font-family:${HEAD_STACK};font-size:30px;line-height:1.15;margin:8px 0}
h2{font-family:${HEAD_STACK};font-size:20px;margin:22px 0 8px}
.sub{color:var(--muted);font-size:15px;line-height:1.5}
ol{padding-left:20px;line-height:1.6;font-size:15px}
code{background:var(--sky);padding:2px 6px;border-radius:6px;font-size:13px;word-break:break-all}
.box{background:#fff;border:1px solid var(--line);border-radius:18px;padding:16px 18px;margin-top:12px}
.urgent{color:#B83A26;font-weight:800}
</style>
</head>
<body>
<header>
  <img src="/assets/pens-blocks-192.png" alt="PENS">
  <div><b>PENS</b><div class="status">${es ? "Versión para desarrolladores · vista previa" : "Developer preview · live dogfood"}</div></div>
  <nav><a href="/">${es ? "Sitio" : "Site"}</a><a href="/guide?lang=${lang}">${es ? "Guía Familiar" : "Family Guide"}</a><a href="/widget">${es ? "Solo el estudio ↗" : "Studio only ↗"}</a><a href="/try?lang=${es ? "en" : "es"}">${es ? "English" : "Español"}</a></nav>
</header>
<main>
  <section class="chat" aria-label="${es ? "Vista previa en el chat" : "In-chat preview"}">
    <div class="bar">${es ? "Vista previa en el chat · las mismas herramientas del plugin" : "In-chat preview · same tools the plugin uses"}</div>
    <div class="ask" id="ask">${esc(demos[0].ask[lang])}</div>
    <iframe id="studio" title="PENS" src="${esc(src(demos[0]))}"></iframe>
    <div class="chips" role="group" aria-label="${es ? "Pruebe una pregunta" : "Try a prompt"}">${buttons}</div>
  </section>
  <section>
    <h1>${es ? "Compártalo mientras llega al directorio" : "Share it while the directory listing is pending"}</h1>
    <p class="sub">${es ? "Cuatro formas de usar PENS hoy:" : "Four ways to use PENS today:"}</p>
    <div class="box"><b>1. ${es ? "Esta página" : "This page"}</b><br>${es ? "El estudio en vivo con preguntas de ejemplo." : "The live studio with sample prompts."}</div>
    <div class="box"><b>2. ${es ? "Guía Familiar en el teléfono" : "Family Guide on a phone"}</b><br><a href="/guide?lang=${lang}">${esc(origin)}/guide</a> · ${es ? "agréguela a la pantalla de inicio" : "add it to the home screen"} · <a href="/waiting-room">${es ? "póster con QR" : "QR poster"}</a></div>
    <div class="box"><b>3. ChatGPT (${es ? "modo desarrollador" : "developer mode"})</b>
      <ol><li>${es ? "Configuración → Apps y conectores → Avanzado → Modo desarrollador" : "Settings → Apps & Connectors → Advanced → Developer mode"}</li><li>${es ? "Crear → URL del servidor MCP:" : "Create → MCP server URL:"} <code>${esc(mcp)}</code></li><li>${es ? "Autenticación: ninguna. Luego use las preguntas de la izquierda." : "Authentication: none. Then use the prompts on the left."}</li></ol></div>
    <div class="box"><b>4. Claude (${es ? "conector personalizado" : "custom connector"})</b>
      <ol><li>${es ? "Configuración → Conectores → Agregar conector personalizado" : "Settings → Connectors → Add custom connector"}</li><li>URL: <code>${esc(mcp)}</code></li></ol></div>
    <p class="sub" style="margin-top:18px">${es ? "Información general, no consejo médico. No se recopila información de pacientes." : "General information, not medical advice. No patient information is collected."} <span class="urgent">${es ? "En una emergencia, llame al 911." : "In an emergency, call 911."}</span></p>
    <p class="sub"><a href="/privacy">${es ? "Privacidad" : "Privacy"}</a> · <a href="/terms">${es ? "Términos" : "Terms"}</a> · <a href="/support">${es ? "Ayuda" : "Support"}</a> · <a href="/reviewer-demo">Reviewer demo</a></p>
  </section>
</main>
<script>
(function(){var f=document.getElementById('studio'),a=document.getElementById('ask');
document.querySelectorAll('.chip').forEach(function(b){b.addEventListener('click',function(){
document.querySelectorAll('.chip').forEach(function(x){x.classList.remove('on')});b.classList.add('on');f.src=b.dataset.src;a.textContent=b.dataset.ask;});});})();
</script>
</body>
</html>`;
}
