import { FONT_BODY, FONT_HEADING, LOGO_PUBLIC_PATH, PIP_MOTION_CSS, TOKENS, pipSvg } from "./brand/index.js";
import { APP_FULL_NAME, CLINIC_CONTACT, MCP_PATH, OPERATOR, PAGES_UPDATED, SUPPORT_EMAIL } from "./config.js";
import { NEGATIVE_CASES, REVIEWER_CASES, type ReviewerCase } from "./reviewer.js";
import { TOOLS } from "./tools/index.js";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const FULL = "Pediatric Epilepsy &amp; Neurology Specialists";

/** One factual sentence used on every page. */
export const OPERATED_BY_HTML = `PENS is operated by ${OPERATOR} on behalf of ${FULL}.`;

function contactBlock(): string {
  return `<p><strong>${FULL}</strong><br>${esc(CLINIC_CONTACT.address)}<br>
<a href="${CLINIC_CONTACT.phoneHref}">${CLINIC_CONTACT.phone}</a> · <a href="${CLINIC_CONTACT.website}">pensoftampabay.com</a><br>
${CLINIC_CONTACT.hours.en.map(esc).join("<br>")}</p>`;
}

export function page(title: string, body: string, opts: { active?: string } = {}): string {
  const nav = [
    ["/", "Home"],
    ["/support", "Support"],
    ["/privacy", "Privacy"],
    ["/terms", "Terms"],
    ["/reviewer-demo", "Reviewer demo"],
    ["/preview", "Widget preview"],
  ]
    .map(([href, label]) => `<a href="${href}"${opts.active === href ? ' aria-current="page"' : ""}>${label}</a>`)
    .join("");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<link rel="icon" href="${LOGO_PUBLIC_PATH}" type="image/svg+xml">
<style>
:root{--teal:${TOKENS.teal};--sun:${TOKENS.sunshine};--coral:${TOKENS.coral};--brick:${TOKENS.brick};--sky:${TOKENS.sky};--ink:${TOKENS.ink};--page:${TOKENS.page}}
*{box-sizing:border-box}
body{font:16px/1.6 ${FONT_BODY};color:var(--ink);background:var(--page);margin:0}
h1,h2,h3{font-family:${FONT_HEADING};font-weight:700;line-height:1.25}
h1{color:var(--teal);font-size:30px;margin:8px 0 12px}h2{margin-top:28px;font-size:21px}
a{color:var(--teal)}code{background:var(--sky);padding:1px 5px;border-radius:4px}
header.site{background:#fff;border-bottom:1px solid #DCE6E8}
.bar{max-width:880px;margin:0 auto;padding:12px 20px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--ink)}
.brand img{width:40px;height:40px;border-radius:10px;display:block}
.brand strong{font-family:${FONT_HEADING};font-size:20px;color:var(--teal)}
.brand span{font-size:13px;color:#4A5B68;display:block;line-height:1.1}
.badge{display:inline-block;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;background:var(--sun);color:var(--ink);border-radius:999px;padding:2px 9px}
nav.links{margin-left:auto;display:flex;gap:14px;flex-wrap:wrap;font-size:14px}
nav.links a{text-decoration:none;font-weight:700}nav.links a[aria-current]{text-decoration:underline}
main{max-width:880px;margin:24px auto;padding:28px 24px;background:#fff;border-radius:20px}
footer.site{max-width:880px;margin:0 auto 32px;padding:0 24px;font-size:13px;color:#4A5B68}
.card{border:1px solid #DCE6E8;border-radius:16px;padding:16px;margin:12px 0}
.case h3{margin:0 0 6px}.case .tool{font-size:13px}.case blockquote{margin:6px 0;padding:8px 12px;background:var(--sky);border-radius:10px;font-weight:700}
.urgent{border-left:5px solid var(--brick)}
.hero{display:flex;gap:20px;align-items:center;flex-wrap:wrap}
.hero .pip{flex:none}
${PIP_MOTION_CSS}
@media (prefers-reduced-motion: reduce){*{animation:none!important;transition:none!important}}
</style></head><body>
<header class="site"><div class="bar">
<a class="brand" href="/"><img src="${LOGO_PUBLIC_PATH}" alt="PENS logo" width="40" height="40"><div><strong>PENS</strong><span>Tampa Bay</span></div></a>
<span class="badge" title="This app is in preview">Preview</span>
<nav class="links" aria-label="Site">${nav}</nav>
</div></header>
<main>${body}</main>
<footer class="site"><p>${OPERATED_BY_HTML} Support: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>. In an emergency, call 911.</p></footer>
</body></html>`;
}

export function privacyPage(): string {
  return page(
    "Privacy Policy · PENS",
    `<h1>Privacy Policy</h1>
<p><em>Last updated ${PAGES_UPDATED}.</em> This policy covers PENS (the "App"), a ChatGPT app and Claude connector that provides general information about ${FULL} in Tampa, FL. ${OPERATED_BY_HTML}</p>
<h2>No protected health information (PHI) is collected</h2>
<p>The App does not ask for, accept, or store names, birthdates, contact details, medical record numbers, insurance IDs, or any other protected health information. Tool inputs have no fields for such data and reject unknown fields. If free text appears to contain personal details, the App removes them before use and does not repeat them.</p>
<h2>No data is stored</h2>
<p>The App is stateless. It does not keep databases, accounts, cookies, or conversation history. Each request is processed in memory and discarded. Standard hosting logs (for example timestamps and error messages) may be kept briefly by the hosting provider for reliability and security; the App does not log tool inputs.</p>
<h2>Third parties</h2>
<p>Your conversation itself is handled by the AI platform you use (for example OpenAI ChatGPT or Anthropic Claude) under that platform's privacy policy. Links in the App open the PENS website, the healow patient portal, or the Epilepsy Foundation; those sites have their own policies. The App's widgets load no external scripts, fonts, or trackers.</p>
<h2>Children</h2>
<p>Some content (like the "My EEG Day" story with Pip) is designed to be used by a parent or caregiver together with a child. The App collects no information from anyone, including children.</p>
<h2>Not medical advice; emergencies</h2>
<p>The App provides general education only. In an emergency, call 911.</p>
<h2>Contact</h2>
<p>App support: ${OPERATOR} · <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
${contactBlock()}
<hr><p lang="es"><strong>Resumen en español:</strong> PENS es operada por ${OPERATOR} en nombre de ${FULL}. La App no recopila ni guarda información de salud protegida (PHI) ni datos personales. No hay cuentas, cookies ni historial. Solo ofrece información educativa general; en una emergencia llame al 911. Contacto: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>`,
    { active: "/privacy" },
  );
}

export function termsPage(): string {
  return page(
    "Terms of Use · PENS",
    `<h1>Terms of Use</h1>
<p><em>Last updated ${PAGES_UPDATED}.</em> ${OPERATED_BY_HTML} By using the App you agree to these terms.</p>
<h2>General information only</h2>
<p>The App provides general educational information about PENS services, visits, and seizure first aid. It does not diagnose, treat, interpret test results, or give medication or dosing advice, and it does not create a patient-provider relationship. Always follow your child's own care plan and the advice of their clinicians.</p>
<h2>Emergencies</h2>
<p>Do not use the App for emergencies. Call 911 for a seizure lasting 5 minutes or longer, trouble breathing, blue lips, a child who won't wake, a serious injury, or any emergency.</p>
<h2>Appointments</h2>
<p>The App does not book appointments. It links to the official PENS request form, phone line and patient portal.</p>
<h2>Content review</h2>
<p>Clinical content in the App is prepared for review by PENS clinicians. Until that review is complete, each card shows a "pending clinician review" label. Information may change; contact the PENS office to confirm details.</p>
<h2>No warranty; limitation of liability</h2>
<p>The App is provided "as is" without warranties of any kind. To the extent permitted by law, ${OPERATOR} is not liable for any damages arising from use of the App.</p>
<h2>Contact</h2>
<p><a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
<hr><p lang="es"><strong>Resumen en español:</strong> La App ofrece solo información educativa general, no consejo médico, y no programa citas. En una emergencia llame al 911.</p>`,
    { active: "/terms" },
  );
}

export function supportPage(): string {
  return page(
    "Support · PENS",
    `<div class="hero">${pipSvg({ mood: "happy", size: 110, label: "Pip, the PENS helper" })}<div>
<h1>Support</h1>
<p>Need help with the PENS app in ChatGPT or Claude? Email <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>. ${OPERATED_BY_HTML}</p></div></div>
<div class="card urgent"><strong>Emergency?</strong> Call 911. Do not wait for an answer by email or chat.</div>
<h2>Questions about your child's care</h2>
<p>Appointments, prescriptions, test results and medical questions go to the PENS office, not app support:</p>
${contactBlock()}
<h2>Common app questions</h2>
<p><strong>How do I use it?</strong> Ask in plain language, for example "What are PENS's office hours?" or "Show my 6-year-old what happens during an EEG." See the <a href="/reviewer-demo">demo prompts</a>.</p>
<p><strong>Does it work in Spanish?</strong> Yes. Ask in Spanish and every card answers in Spanish.</p>
<p><strong>Is my information saved?</strong> No. The app stores nothing and asks for no personal details. See the <a href="/privacy">privacy policy</a>.</p>
<hr><p lang="es"><strong>Soporte en español:</strong> Escriba a <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>. Para citas o preguntas médicas, llame a PENS al <a href="${CLINIC_CONTACT.phoneHref}">${CLINIC_CONTACT.phone}</a>. En una emergencia, llame al 911.</p>`,
    { active: "/support" },
  );
}

function caseCard(c: ReviewerCase, lang: "en" | "es", n: number): string {
  return `<div class="card case"${lang === "es" ? ' lang="es"' : ""}><h3>${n}. ${c.tool ? `<code>${c.tool}</code>` : lang === "es" ? "Caso negativo" : "Negative case"}</h3>
<blockquote>${esc(c.prompt[lang])}</blockquote><p><strong>${lang === "es" ? "Resultado esperado" : "Expected"}:</strong> ${esc(c.expected[lang])}</p></div>`;
}

export function reviewerDemoPage(): string {
  return page(
    "Reviewer demo · PENS",
    `<h1>Reviewer demo</h1>
<p>Connect the MCP server at <code>${MCP_PATH}</code> (Streamable HTTP, no authentication), then paste each prompt below into a new chat. Every tool is read-only and returns curated content, so results are the same each time (only the clinic card's open-now status follows the current Tampa time). ${OPERATED_BY_HTML}</p>
<p>Widgets also render without a host at <a href="/preview">/preview</a>.</p>
<h2>English</h2>
${REVIEWER_CASES.map((c, i) => caseCard(c, "en", i + 1)).join("\n")}
<h2>English: safety cases</h2>
${NEGATIVE_CASES.map((c, i) => caseCard(c, "en", i + 1)).join("\n")}
<h2 lang="es">Español</h2>
${REVIEWER_CASES.map((c, i) => caseCard(c, "es", i + 1)).join("\n")}
<h2 lang="es">Español: casos de seguridad</h2>
${NEGATIVE_CASES.map((c, i) => caseCard(c, "es", i + 1)).join("\n")}
<h2>Tools</h2>
<ul>${TOOLS.map((t) => `<li><code>${t.name}</code>: ${esc(t.title)}</li>`).join("")}</ul>`,
    { active: "/reviewer-demo" },
  );
}

/** Fallback home page, used only when the splash site (site/index.html) is not present. */
export function homePage(): string {
  const tools = TOOLS.map((t) => `<li><code>${t.name}</code>: ${esc(t.title)}</li>`).join("");
  return page(
    `PENS · ${APP_FULL_NAME}`,
    `<div class="hero">${pipSvg({ mood: "happy", size: 120, label: "Pip, the PENS helper" })}<div>
<h1>PENS in ChatGPT and Claude</h1>
<p>Pediatric neurology answers for Tampa Bay families from ${FULL}: office hours, visit prep, seizure first aid, school seizure plans and a kids' EEG story with Pip.</p></div></div>
<p>Connect your assistant to <code>${MCP_PATH}</code>.</p>
<ul>${tools}</ul>`,
    { active: "/" },
  );
}
