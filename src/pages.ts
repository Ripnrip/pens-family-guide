import { FONT_BODY, FONT_HEADING, LOGO_PUBLIC_PATH, PIP_MOTION_CSS, TOKENS, pipSvg } from "./brand/index.js";
import { APP_FULL_NAME, CLINIC_CONTACT, MCP_PATH, OPERATOR, SUPPORT_EMAIL } from "./config.js";
import { NEGATIVE_CASES, REVIEWER_CASES, type ReviewerCase } from "./reviewer.js";
import { TOOLS } from "./tools/index.js";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const FULL = "Pediatric Epilepsy &amp; Neurology Specialists";

/** One factual sentence used on every page. */
export const OPERATED_BY_HTML = `PENS is operated by ${OPERATOR} on behalf of ${FULL}.`;

type PageLang = "en" | "es";

/** Effective date of the current privacy policy, terms and support pages. */
export const LEGAL_EFFECTIVE = { en: "November 20, 2026", es: "20 de noviembre de 2026" } as const;

function contactBlock(lang: PageLang = "en"): string {
  return `<p><strong>${FULL}</strong><br>${esc(CLINIC_CONTACT.address)}<br>
<a href="${CLINIC_CONTACT.phoneHref}">${CLINIC_CONTACT.phone}</a> · <a href="${CLINIC_CONTACT.website}">pensoftampabay.com</a><br>
${CLINIC_CONTACT.hours[lang].map(esc).join("<br>")}</p>`;
}

const mail = `<a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>`;
const clinicPhone = `<a href="${CLINIC_CONTACT.phoneHref}">${CLINIC_CONTACT.phone}</a>`;

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
.toc{background:var(--sky);border-radius:14px;padding:12px 16px;margin:12px 0}.toc a{font-weight:700}
.legal h2{border-top:1px solid #DCE6E8;padding-top:18px}.legal li{margin:4px 0}
.lang-jump{font-weight:800}
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

/* ------------------------------------------------------------------------------------------------
 * Privacy Policy, Terms of Use and Support.
 * Each page is English first, then a full Spanish version (#es) with an in-page jump link.
 * Statements here describe the code as built: stateless MCP server, strict tool schemas, PHI scrub
 * (src/safety/phi.ts), emergency detector (src/safety/emergency.ts), empty widget CSP
 * (src/widgets/index.ts), Google Fonts on the splash site and guide pages, and localStorage used
 * only for the splash site's language choice (site/index.html). Keep them in sync with the code.
 * ---------------------------------------------------------------------------------------------- */

function legalHeader(lang: PageLang, title: string): string {
  return lang === "en"
    ? `<h1>${title}</h1>
<p><strong>Effective ${LEGAL_EFFECTIVE.en}.</strong> ${OPERATED_BY_HTML}</p>
<p class="toc"><a class="lang-jump" href="#es" hreflang="es" lang="es">Leer en español ↓</a></p>`
    : `<h1>${title}</h1>
<p><strong>Vigente desde el ${LEGAL_EFFECTIVE.es}.</strong> PENS es operada por ${OPERATOR} en nombre de ${FULL}.</p>
<p class="toc"><a class="lang-jump" href="#en" hreflang="en" lang="en">Read in English ↑</a></p>`;
}

function privacyEn(): string {
  return `<section id="en" class="legal">
${legalHeader("en", "Privacy Policy")}
<p>This policy explains what information the PENS Family Guide (the "App") handles, why, who else receives it, how long it is kept, and the choices you have. The App includes the PENS app for ChatGPT and connector for Claude (an MCP server), the phone web guide at <a href="/guide">/guide</a>, the <a href="/try">/try</a> page, the waiting-room QR page and the PENS splash site. In this policy "we" and "us" mean ${OPERATOR}, which builds and runs the App on behalf of ${FULL} ("PENS").</p>

<h2>The short version</h2>
<ul>
<li><strong>No protected health information is collected.</strong> Please do not enter a child's name, date of birth, medical record number or health details. The App is designed to remove them if you do.</li>
<li><strong>No account, no sign-in, no database.</strong> The App does not store what you type.</li>
<li><strong>Not a medical service.</strong> The App gives general information only, not medical advice, and is not a substitute for your child's PENS care team. In an emergency, call 911.</li>
<li><strong>Nothing is sold</strong> and nothing is used for advertising.</li>
</ul>

<h2>Who operates the App</h2>
<p>${OPERATOR} operates the App on behalf of PENS, ${esc(CLINIC_CONTACT.address)}. Questions about this policy go to ${mail}. Questions about your child's care go to the PENS office at ${clinicPhone}.</p>

<h2>Not a medical service</h2>
<p>The App provides general education about PENS, visits, EEGs and seizure first aid. It is not medical advice, does not diagnose, interpret test results or give treatment or dosing advice, and is not a substitute for your child's clinicians at PENS. Using the App does not make you or your child a PENS patient.</p>

<h2>Data we process</h2>
<p><strong>What you ask the App.</strong> When ChatGPT or Claude uses one of the App's tools, the AI assistant sends our server a small set of values: the language (English or Spanish), a visit type or audience chosen from a fixed list, ids of suggested questions, and, for some tools, a short piece of text (a concern or question of up to 600 characters, or one optional custom question of up to 140 characters). Tool inputs have no fields for names, birthdates, contact details, record numbers or insurance information, and requests with any other fields are rejected.</p>
<p><strong>What the safety layer does with text.</strong> Before any text is used, the App:</p>
<ul>
<li>removes anything that looks like a name, date (including a date of birth), email address, phone number, Social Security number, medical record or member number, or other long number, and shows a privacy reminder;</li>
<li>drops any argument whose name suggests personal or health identifiers (for example a "name", "dob" or "record" field);</li>
<li>checks the text for emergency signs (for example a seizure lasting 5 minutes or more, trouble breathing or blue lips) and, if found, shows "call 911" guidance first, plus the 988 Suicide &amp; Crisis Lifeline when someone may hurt themselves.</li>
</ul>
<p>The App's answers are pre-written content; it does not repeat your free text back, with one exception: an optional custom question for the "Our questions" card. That question is checked and dropped if it still looks personal; if accepted, it is returned to your conversation only so it can appear on your card. It is never stored on our servers.</p>
<p><strong>Processing is in memory.</strong> Each request is handled by a fresh, stateless server instance and then discarded. We have no database, set no cookies and keep no conversation history. Our code does not write tool inputs to logs; if a request fails, an error message is recorded.</p>
<p><strong>Technical data.</strong> Like any website, our hosting provider automatically records standard request logs, which can include your IP address, browser or app type, the page or endpoint requested, the time and the response status. On the web pages, settings such as language or visit type appear in the page address, so they can appear in these logs. Please do not add personal details to a web address.</p>
<p><strong>On your device.</strong> The splash site saves your language choice (English or Spanish) in your browser's local storage. Card state, such as which questions you picked or your quiz progress, may be saved by ChatGPT or Claude with the conversation (see below). A question card you save as an image stays on your device.</p>
<p><strong>Support email.</strong> If you email us, we receive your email address and whatever you write.</p>
<p><strong>What we do not collect.</strong> No account details, passwords, payment information, precise location, contacts or access to your ChatGPT or Claude history. The App does not book appointments; it links to PENS's own request form and phone line.</p>

<h2>Purposes</h2>
<p>We use this information only to answer your request and show the App's cards, to keep the App safe (removing personal details and flagging emergencies), to keep it secure and working, to fix problems, to answer support and privacy requests, and to meet legal obligations. We do not sell personal information, share it for targeted advertising, or use it to build profiles.</p>

<h2>Service providers and recipients</h2>
<ul>
<li><strong>OpenAI (ChatGPT) and Anthropic (Claude)</strong> are the host apps. Your conversation, including anything you type, is handled by the assistant you use under its own privacy policy and settings. They decide what to send to our tools and may save card state with the conversation.</li>
<li><strong>Vercel</strong> hosts the App and keeps the standard request logs described above.</li>
<li><strong>Google Fonts</strong> supplies the typefaces on the splash site and the web guide pages, so Google receives your IP address and browser details when those pages load. The cards shown inside ChatGPT and Claude load no outside scripts, fonts or trackers.</li>
<li><strong>Linked sites</strong> such as the PENS website, Google Maps (for directions) and the Epilepsy Foundation open only when you choose a link, and have their own policies.</li>
<li><strong>PENS</strong> does not receive your questions or any data from the App. Contacting PENS happens only if you call or use PENS's request form.</li>
</ul>
<p>Authorized ${OPERATOR} personnel may view hosting logs when needed for security, operations or support. We may disclose information if the law requires it or to protect people, the App or others.</p>

<h2>Retention</h2>
<ul>
<li>Tool inputs: not stored. They exist in memory only while a request is processed.</li>
<li>Hosting request and error logs: kept for a limited period set by our hosting provider, then deleted automatically.</li>
<li>Support emails: kept as long as needed to answer you and keep a record of the request, then deleted.</li>
<li>Conversations and saved card state in ChatGPT or Claude: kept under that app's settings and policy.</li>
<li>The language choice in your browser: stays until you clear your browser's site data.</li>
</ul>


<h2>Children's privacy</h2>
<p>The App is for parents, caregivers, schools and clinicians. It is not directed to children under 13, and we do not knowingly collect personal information from children, consistent with the Children's Online Privacy Protection Act (COPPA). Some content, such as the "My EEG Day with Pip" game, is meant to be used by a child together with an adult. If you believe a child has sent us personal information, email ${mail} and we will delete it.</p>

<h2>Your choices and controls</h2>
<ul>
<li>You decide what to type. You can use every card without entering any personal details.</li>
<li>You can stop using the App at any time and remove it from ChatGPT or Claude in that app's settings, and delete conversations there.</li>
<li>You can clear the saved language choice by clearing your browser's site data.</li>
<li>You can ask us about, or ask us to delete, information we hold about you, such as a support email. Email ${mail} with "Privacy" in the subject. We may need enough detail to find the record. Because we keep no accounts or databases, we usually cannot link hosting logs to a person. Deleting our copy does not remove copies kept by OpenAI, Anthropic or other independent services.</li>
</ul>

<h2>Florida residents</h2>
<p>The App is provided for a medical practice in Tampa, Florida. We do not sell personal data or use it for targeted advertising, and we keep only the limited technical data described above. If you live in Florida or anywhere else, you can make the requests described in this policy by emailing ${mail}.</p>

<h2>Security</h2>
<p>We use encrypted HTTPS connections, strict input checks, automatic removal of personal details, cards that run in a sandbox with no outside connections, and no stored user data to protect. No system is perfectly secure. Our providers may process information in the United States or other countries where they operate.</p>

<h2>Changes to this policy</h2>
<p>We may update this policy when the App changes. The effective date at the top shows the current version, and important changes will be noted on this page.</p>

<h2>Contact</h2>
<p>App and privacy questions: ${OPERATOR} · ${mail}</p>
<p>Questions about your child's care go to PENS:</p>
${contactBlock("en")}
</section>`;
}

function privacyEs(): string {
  return `<section id="es" lang="es" class="legal">
${legalHeader("es", "Política de privacidad")}
<p>Esta política explica qué información maneja la Guía Familiar de PENS (la "App"), para qué, quién más la recibe, cuánto tiempo se guarda y qué opciones tiene usted. La App incluye la app de PENS para ChatGPT y el conector para Claude (un servidor MCP), la guía web para el teléfono en <a href="/guide?lang=es">/guide</a>, la página <a href="/try?lang=es">/try</a>, la página con código QR para la sala de espera y el sitio de presentación de PENS. En esta política, "nosotros" significa ${OPERATOR}, que crea y opera la App en nombre de ${FULL} ("PENS").</p>

<h2>En resumen</h2>
<ul>
<li><strong>No se recopila información de salud protegida.</strong> Por favor no escriba el nombre, la fecha de nacimiento, el número de expediente ni detalles de salud de su hijo. La App está diseñada para eliminarlos si lo hace.</li>
<li><strong>Sin cuenta, sin inicio de sesión, sin base de datos.</strong> La App no guarda lo que usted escribe.</li>
<li><strong>No es un servicio médico.</strong> La App ofrece solo información general, no es consejo médico y no reemplaza al equipo de atención de PENS de su hijo. En una emergencia, llame al 911.</li>
<li><strong>No vendemos nada</strong> ni usamos nada para publicidad.</li>
</ul>

<h2>Quién opera la App</h2>
<p>${OPERATOR} opera la App en nombre de PENS, ${esc(CLINIC_CONTACT.address)}. Las preguntas sobre esta política se envían a ${mail}. Las preguntas sobre la atención de su hijo van a la oficina de PENS al ${clinicPhone}.</p>

<h2>No es un servicio médico</h2>
<p>La App ofrece educación general sobre PENS, las visitas, los EEG y los primeros auxilios en caso de convulsiones. No es consejo médico; no diagnostica, no interpreta resultados de pruebas ni da consejos de tratamiento o dosis, y no reemplaza a los médicos de su hijo en PENS. Usar la App no los convierte a usted ni a su hijo en pacientes de PENS.</p>

<h2>Datos que procesamos</h2>
<p><strong>Lo que usted le pregunta a la App.</strong> Cuando ChatGPT o Claude usan una herramienta de la App, el asistente envía a nuestro servidor unos pocos valores: el idioma (inglés o español), un tipo de visita o de público elegido de una lista fija, los identificadores de preguntas sugeridas y, en algunas herramientas, un texto breve (una inquietud o pregunta de hasta 600 caracteres, o una pregunta propia opcional de hasta 140 caracteres). Las herramientas no tienen campos para nombres, fechas de nacimiento, datos de contacto, números de expediente ni información de seguro, y se rechaza cualquier solicitud con otros campos.</p>
<p><strong>Qué hace la capa de seguridad con el texto.</strong> Antes de usar cualquier texto, la App:</p>
<ul>
<li>elimina lo que parezca un nombre, una fecha (incluida una fecha de nacimiento), un correo electrónico, un teléfono, un número de Seguro Social, un número de expediente o de afiliado u otro número largo, y muestra un recordatorio de privacidad;</li>
<li>descarta cualquier campo cuyo nombre sugiera datos personales o de salud (por ejemplo "name", "dob" o "record");</li>
<li>revisa el texto en busca de señales de emergencia (por ejemplo, una convulsión de 5 minutos o más, dificultad para respirar o labios azules) y, si las encuentra, muestra primero la indicación de llamar al 911, y la Línea de Crisis y Suicidio 988 cuando alguien podría hacerse daño.</li>
</ul>
<p>Las respuestas de la App son contenido escrito de antemano; no repite su texto, con una excepción: la pregunta propia opcional de la tarjeta "Nuestras preguntas". Esa pregunta se revisa y se descarta si todavía parece personal; si se acepta, se devuelve a su conversación solo para mostrarla en su tarjeta. Nunca se guarda en nuestros servidores.</p>
<p><strong>El procesamiento ocurre en memoria.</strong> Cada solicitud la atiende una instancia nueva del servidor, sin estado, que luego se descarta. No tenemos base de datos, no usamos cookies ni guardamos historial de conversaciones. Nuestro código no registra lo que se envía a las herramientas; si una solicitud falla, se registra un mensaje de error.</p>
<p><strong>Datos técnicos.</strong> Como cualquier sitio web, nuestro proveedor de alojamiento registra automáticamente las solicitudes, lo que puede incluir su dirección IP, el tipo de navegador o app, la página solicitada, la hora y el resultado. En las páginas web, opciones como el idioma o el tipo de visita aparecen en la dirección de la página, por lo que pueden aparecer en esos registros. No agregue datos personales a una dirección web.</p>
<p><strong>En su dispositivo.</strong> El sitio de presentación guarda su idioma (inglés o español) en el almacenamiento local de su navegador. El estado de una tarjeta, como las preguntas elegidas o su avance en la prueba, puede guardarlo ChatGPT o Claude junto con la conversación (vea abajo). Una tarjeta de preguntas que guarde como imagen se queda en su dispositivo.</p>
<p><strong>Correo de soporte.</strong> Si nos escribe, recibimos su correo electrónico y lo que nos escriba.</p>
<p><strong>Lo que no recopilamos.</strong> Datos de cuenta, contraseñas, información de pago, ubicación precisa, contactos ni acceso a su historial de ChatGPT o Claude. La App no programa citas; enlaza al formulario de solicitud y al teléfono de PENS.</p>

<h2>Para qué usamos los datos</h2>
<p>Usamos esta información solo para responder a su solicitud y mostrar las tarjetas de la App, para mantenerla segura (eliminar datos personales y señalar emergencias), para que funcione bien, para corregir problemas, para responder solicitudes de soporte y de privacidad, y para cumplir la ley. No vendemos información personal, no la compartimos para publicidad dirigida ni la usamos para crear perfiles.</p>

<h2>Proveedores de servicios y destinatarios</h2>
<ul>
<li><strong>OpenAI (ChatGPT) y Anthropic (Claude)</strong> son las apps anfitrionas. Su conversación, incluido lo que escriba, la maneja el asistente que usted use según su propia política de privacidad y su configuración. Ellos deciden qué enviar a nuestras herramientas y pueden guardar el estado de las tarjetas con la conversación.</li>
<li><strong>Vercel</strong> aloja la App y guarda los registros de solicitudes descritos arriba.</li>
<li><strong>Google Fonts</strong> proporciona las tipografías del sitio de presentación y de las páginas de la guía web, por lo que Google recibe su dirección IP y datos del navegador cuando se cargan esas páginas. Las tarjetas que se muestran dentro de ChatGPT y Claude no cargan scripts, fuentes ni rastreadores externos.</li>
<li><strong>Sitios enlazados</strong> como el sitio web de PENS, Google Maps (para indicaciones) y la Epilepsy Foundation se abren solo si usted elige el enlace, y tienen sus propias políticas.</li>
<li><strong>PENS</strong> no recibe sus preguntas ni ningún dato de la App. Usted se comunica con PENS solo si llama o usa el formulario de solicitud de PENS.</li>
</ul>
<p>El personal autorizado de ${OPERATOR} puede ver los registros del alojamiento cuando sea necesario por seguridad, operación o soporte. Podemos divulgar información si la ley lo exige o para proteger a las personas, la App u otros.</p>

<h2>Cuánto tiempo se guarda</h2>
<ul>
<li>Lo enviado a las herramientas: no se guarda. Existe en memoria solo mientras se procesa la solicitud.</li>
<li>Registros de solicitudes y errores del alojamiento: se guardan por un periodo limitado que fija nuestro proveedor de alojamiento y luego se eliminan automáticamente.</li>
<li>Correos de soporte: se guardan el tiempo necesario para responderle y llevar un registro de la solicitud, y luego se eliminan.</li>
<li>Conversaciones y estado de tarjetas en ChatGPT o Claude: según la configuración y la política de esa app.</li>
<li>El idioma guardado en su navegador: hasta que borre los datos del sitio en su navegador.</li>
</ul>


<h2>Privacidad de los niños</h2>
<p>La App es para padres, cuidadores, escuelas y profesionales de la salud. No está dirigida a menores de 13 años y no recopilamos a sabiendas información personal de niños, de acuerdo con la Ley de Protección de la Privacidad Infantil en Línea (COPPA) de EE. UU. Algunos contenidos, como el juego "Mi día de EEG con Pip", están pensados para que un niño los use junto con un adulto. Si cree que un niño nos envió información personal, escriba a ${mail} y la eliminaremos.</p>

<h2>Sus opciones</h2>
<ul>
<li>Usted decide qué escribir. Puede usar todas las tarjetas sin escribir ningún dato personal.</li>
<li>Puede dejar de usar la App en cualquier momento, quitarla de ChatGPT o Claude en la configuración de esa app y borrar allí sus conversaciones.</li>
<li>Puede borrar el idioma guardado borrando los datos del sitio en su navegador.</li>
<li>Puede preguntarnos por la información que tengamos sobre usted, como un correo de soporte, o pedirnos que la eliminemos. Escriba a ${mail} con "Privacidad" en el asunto. Es posible que necesitemos suficientes detalles para encontrar el registro. Como no tenemos cuentas ni bases de datos, normalmente no podemos relacionar los registros del alojamiento con una persona. Eliminar nuestra copia no elimina las copias que guarden OpenAI, Anthropic u otros servicios independientes.</li>
</ul>

<h2>Residentes de Florida</h2>
<p>La App se ofrece para una práctica médica de Tampa, Florida. No vendemos datos personales ni los usamos para publicidad dirigida, y solo guardamos los datos técnicos limitados descritos arriba. Si vive en Florida o en cualquier otro lugar, puede hacer las solicitudes descritas en esta política escribiendo a ${mail}.</p>

<h2>Seguridad</h2>
<p>Usamos conexiones HTTPS cifradas, revisiones estrictas de lo que se envía, eliminación automática de datos personales, tarjetas que funcionan aisladas y sin conexiones externas, y no guardamos datos de usuarios. Ningún sistema es perfectamente seguro. Nuestros proveedores pueden procesar información en Estados Unidos o en otros países donde operan.</p>

<h2>Cambios a esta política</h2>
<p>Podemos actualizar esta política cuando cambie la App. La fecha de vigencia al inicio indica la versión actual, y los cambios importantes se indicarán en esta página.</p>

<h2>Contacto</h2>
<p>Preguntas sobre la App y la privacidad: ${OPERATOR} · ${mail}</p>
<p>Las preguntas sobre la atención de su hijo van a PENS:</p>
${contactBlock("es")}
</section>`;
}

export function privacyPage(): string {
  return page(
    "Privacy Policy · PENS",
    `${privacyEn()}
${privacyEs()}`,
    { active: "/privacy" },
  );
}

/*
 * Content and trademarks: the PENS name and logo are described as "used on behalf of PENS".
 * NOTE FOR PENS: confirm the exact permission wording (license or written permission to use the
 * PENS name and logo) with PENS before directory submission, then update both languages below.
 */
function termsEn(): string {
  return `<section id="en" class="legal">
${legalHeader("en", "Terms of Use")}
<p>These terms apply to the PENS Family Guide (the "App"): the PENS app for ChatGPT, the PENS connector for Claude, the phone web guide, the /try page, the waiting-room QR page and the PENS splash site. By using the App you agree to these terms. If you do not agree, please do not use it.</p>

<h2>Who provides the App</h2>
<p>The App is provided by ${OPERATOR} ("we", "us") on behalf of ${FULL} ("PENS"), ${esc(CLINIC_CONTACT.address)}. The App is free to use.</p>

<h2>General information, not medical advice</h2>
<p>The App provides general educational information about PENS services, visits, EEGs, school seizure plans and seizure first aid. It is not medical advice. It does not diagnose, interpret test results, or give treatment, medication or dosing advice, and it is not a substitute for your child's own care plan or for advice from PENS clinicians or your child's doctors. Some content may be labeled as pending PENS clinical review, and details such as hours or links can change; confirm with the PENS office before relying on them.</p>

<h2>Emergencies: call 911</h2>
<p>Do not use the App for emergencies. Call 911 right away for a seizure lasting 5 minutes or longer, seizures one after another, trouble breathing, blue or gray lips, a child who will not wake up, a serious injury, or any other emergency. If someone may hurt themselves, call or text 988 or call 911.</p>

<h2>No doctor–patient relationship</h2>
<p>Using the App does not create a doctor–patient or provider–patient relationship with PENS, its clinicians or ${OPERATOR}, and does not make your child a PENS patient. The App does not book appointments; it links to PENS's own request form and phone line.</p>

<h2>Acceptable use</h2>
<p>When you use the App, please:</p>
<ul>
<li>do not enter a child's or anyone else's name, date of birth, record number, contact details or health details;</li>
<li>do not use the App to harm, harass or impersonate anyone, or to give medical instructions to others as if they came from PENS;</li>
<li>do not try to break, overload, scrape at scale, probe for weaknesses in, or get around the safety features of the App or its hosting;</li>
<li>do not use the App in a way that breaks the law or the terms of ChatGPT, Claude or another service you use with it.</li>
</ul>
<p>We may limit or stop access to the App for anyone who misuses it.</p>

<h2>Host apps and other services</h2>
<p>ChatGPT is provided by OpenAI and Claude by Anthropic under their own terms and privacy policies. Their AI assistants decide when to use the App and may write their own text around its cards; we are not responsible for that text. Links to the PENS website, maps and other sites are provided for convenience and are governed by those sites' terms.</p>

<h2>Availability; provided "as is"</h2>
<p>We aim to keep the App available and accurate, but it is provided "as is" and "as available", without warranties of any kind, express or implied, including warranties of accuracy, fitness for a particular purpose and non-infringement, to the extent the law allows. We may change, pause or stop the App, or any part of it, at any time without notice.</p>

<h2>Content and trademarks</h2>
<p>The PENS name, logo and clinic information are used on behalf of PENS and remain the property of PENS. The App's text, cards, the Pip character, artwork and software are owned by ${OPERATOR} or PENS, as applicable. You may view, print and share the App's cards for personal, school or caregiving use. You may not copy, sell or reuse the PENS name or logo, or present the App's content as your own, without permission. ChatGPT, OpenAI, Claude and Anthropic are trademarks of their owners and are named only to describe where the App works.</p>

<h2>Limitation of liability</h2>
<p>To the fullest extent the law allows, ${OPERATOR} and PENS will not be liable for any indirect, incidental, special, consequential or punitive damages, or for any loss arising from your use of, or reliance on, the App. Because the App is free, our total liability for any claim related to the App is limited to one hundred U.S. dollars (US$100). Some places do not allow these limits, so they may not fully apply to you. Nothing in these terms limits liability that cannot be limited by law.</p>

<h2>Governing law</h2>
<p>These terms are governed by the laws of the State of Florida, without regard to its conflict-of-law rules. Any dispute will be handled in the state or federal courts located in Hillsborough County, Florida, unless the law requires otherwise.</p>

<h2>Changes to these terms</h2>
<p>We may update these terms when the App changes. The effective date at the top shows the current version. If you keep using the App after a change, the updated terms apply. If any part of these terms cannot be enforced, the rest still applies.</p>

<h2>Contact</h2>
<p>Questions about these terms: ${OPERATOR} · ${mail}. Questions about your child's care: PENS at ${clinicPhone}. See also the <a href="/privacy">Privacy Policy</a> and <a href="/support">Support</a>.</p>
</section>`;
}

function termsEs(): string {
  return `<section id="es" lang="es" class="legal">
${legalHeader("es", "Términos de uso")}
<p>Estos términos se aplican a la Guía Familiar de PENS (la "App"): la app de PENS para ChatGPT, el conector de PENS para Claude, la guía web para el teléfono, la página /try, la página con código QR para la sala de espera y el sitio de presentación de PENS. Al usar la App, usted acepta estos términos. Si no está de acuerdo, por favor no la use.</p>

<h2>Quién ofrece la App</h2>
<p>La App la ofrece ${OPERATOR} ("nosotros") en nombre de ${FULL} ("PENS"), ${esc(CLINIC_CONTACT.address)}. El uso de la App es gratuito.</p>

<h2>Información general, no es consejo médico</h2>
<p>La App ofrece información educativa general sobre los servicios de PENS, las visitas, los EEG, los planes escolares para convulsiones y los primeros auxilios en caso de convulsiones. No es consejo médico. No diagnostica, no interpreta resultados de pruebas ni da consejos de tratamiento, medicamentos o dosis, y no reemplaza el plan de atención de su hijo ni los consejos de los profesionales de PENS o de los médicos de su hijo. Parte del contenido puede indicar que está pendiente de revisión clínica de PENS, y datos como el horario o los enlaces pueden cambiar; confírmelos con la oficina de PENS antes de depender de ellos.</p>

<h2>Emergencias: llame al 911</h2>
<p>No use la App en emergencias. Llame al 911 de inmediato si una convulsión dura 5 minutos o más, si hay una convulsión tras otra, dificultad para respirar, labios azules o grises, un niño que no despierta, una lesión grave o cualquier otra emergencia. Si alguien podría hacerse daño, llame o envíe un texto al 988 o llame al 911.</p>

<h2>No se crea una relación médico–paciente</h2>
<p>Usar la App no crea una relación médico–paciente ni proveedor–paciente con PENS, sus profesionales o ${OPERATOR}, y no convierte a su hijo en paciente de PENS. La App no programa citas; enlaza al formulario de solicitud y al teléfono de PENS.</p>

<h2>Uso aceptable</h2>
<p>Cuando use la App, por favor:</p>
<ul>
<li>no escriba el nombre, la fecha de nacimiento, el número de expediente, los datos de contacto ni detalles de salud de su hijo o de otra persona;</li>
<li>no use la App para dañar, acosar o hacerse pasar por otra persona, ni para dar instrucciones médicas a otros como si vinieran de PENS;</li>
<li>no intente dañar, sobrecargar, extraer contenido de forma masiva, buscar vulnerabilidades ni evadir las funciones de seguridad de la App o de su alojamiento;</li>
<li>no use la App de una manera que viole la ley o los términos de ChatGPT, Claude u otro servicio que use con ella.</li>
</ul>
<p>Podemos limitar o suspender el acceso a la App a quien la use indebidamente.</p>

<h2>Apps anfitrionas y otros servicios</h2>
<p>ChatGPT lo ofrece OpenAI y Claude lo ofrece Anthropic, según sus propios términos y políticas de privacidad. Sus asistentes de IA deciden cuándo usar la App y pueden escribir su propio texto alrededor de las tarjetas; no somos responsables de ese texto. Los enlaces al sitio web de PENS, a mapas y a otros sitios se ofrecen por comodidad y se rigen por los términos de esos sitios.</p>

<h2>Disponibilidad; se ofrece "tal cual"</h2>
<p>Procuramos que la App esté disponible y sea correcta, pero se ofrece "tal cual" y "según disponibilidad", sin garantías de ningún tipo, expresas o implícitas, incluidas las de exactitud, idoneidad para un fin determinado y no infracción, en la medida en que la ley lo permita. Podemos cambiar, pausar o suspender la App, o cualquier parte de ella, en cualquier momento y sin aviso.</p>

<h2>Contenido y marcas</h2>
<p>El nombre, el logotipo y la información de la clínica de PENS se usan en nombre de PENS y siguen siendo propiedad de PENS. Los textos, las tarjetas, el personaje Pip, las ilustraciones y el software de la App pertenecen a ${OPERATOR} o a PENS, según corresponda. Puede ver, imprimir y compartir las tarjetas de la App para uso personal, escolar o de cuidado. No puede copiar, vender ni reutilizar el nombre o el logotipo de PENS, ni presentar el contenido de la App como propio, sin permiso. ChatGPT, OpenAI, Claude y Anthropic son marcas de sus propietarios y se mencionan solo para describir dónde funciona la App.</p>

<h2>Limitación de responsabilidad</h2>
<p>En la máxima medida que permita la ley, ni ${OPERATOR} ni PENS serán responsables por daños indirectos, incidentales, especiales, consecuentes o punitivos, ni por pérdidas derivadas del uso de la App o de confiar en ella. Como la App es gratuita, nuestra responsabilidad total por cualquier reclamo relacionado con la App se limita a cien dólares estadounidenses (US$100). Algunos lugares no permiten estos límites, por lo que es posible que no se apliquen por completo a usted. Nada en estos términos limita la responsabilidad que la ley no permite limitar.</p>

<h2>Ley aplicable</h2>
<p>Estos términos se rigen por las leyes del Estado de Florida, sin tener en cuenta sus normas sobre conflicto de leyes. Cualquier disputa se resolverá en los tribunales estatales o federales del condado de Hillsborough, Florida, salvo que la ley disponga otra cosa.</p>

<h2>Cambios a estos términos</h2>
<p>Podemos actualizar estos términos cuando cambie la App. La fecha de vigencia al inicio indica la versión actual. Si sigue usando la App después de un cambio, se aplican los términos actualizados. Si alguna parte de estos términos no se puede hacer cumplir, el resto sigue vigente.</p>

<h2>Contacto</h2>
<p>Preguntas sobre estos términos: ${OPERATOR} · ${mail}. Preguntas sobre la atención de su hijo: PENS al ${clinicPhone}. Vea también la <a href="/privacy#es">Política de privacidad</a> y <a href="/support#es">Soporte</a>.</p>
</section>`;
}

export function termsPage(): string {
  return page(
    "Terms of Use · PENS",
    `${termsEn()}
${termsEs()}`,
    { active: "/terms" },
  );
}

/** Shows this deployment's connector URL. The page has no request, so a tiny script fills in the origin. */
function connectorUrl(path: string): string {
  return `<code class="mcp-url" data-path="${path}">${path}</code>`;
}

function supportEn(): string {
  return `<section id="en" class="legal">
<div class="hero">${pipSvg({ mood: "happy", size: 110, label: "Pip, the PENS helper" })}<div>
${legalHeader("en", "Support")}
<p>Need help with the PENS Family Guide in ChatGPT, Claude or on the web? Email ${mail}.</p></div></div>
<div class="card urgent"><strong>Emergency?</strong> Call 911 now. If someone may hurt themselves, call or text 988. Do not wait for an email or chat reply.</div>

<h2>Questions about your child's care</h2>
<p>The App gives general information, not medical advice. Appointments, prescriptions, test results, records and any question about your child's health go to the PENS office, not to app support. Please call PENS:</p>
${contactBlock("en")}

<h2>How to get help with the App</h2>
<p>Email ${mail}. To help us fix the problem, please include:</p>
<ul>
<li>where you used it (ChatGPT, Claude, the web guide or the splash site) and on what device or browser;</li>
<li>the language you used (English or Spanish);</li>
<li>which card or feature, and what you asked, in general words;</li>
<li>the approximate date and time, and any error message you saw.</li>
</ul>
<p><strong>Please do not include</strong> your child's name, date of birth, record number or health details. We do not need them to fix the App.</p>
<p>We review every message and reply as soon as we can, usually by email. We cannot promise a specific response time, and app support cannot answer medical questions.</p>

<h2>Before you write</h2>
<ul>
<li>Start a new chat after adding, updating or reconnecting the App.</li>
<li>Ask in plain words, for example "What are PENS's office hours?" or "Show my 6-year-old what happens during an EEG." See the <a href="/reviewer-demo">demo prompts</a>.</li>
<li>To get Spanish, ask in Spanish; every card answers in Spanish.</li>
<li>If a card says it removed personal details, rephrase without names, dates or numbers.</li>
</ul>

<h2>Add the App to ChatGPT or Claude</h2>
<p>Connector URL: ${connectorUrl(MCP_PATH)} (no sign-in needed).</p>
<p><strong>ChatGPT (developer mode):</strong> open Settings, then Apps &amp; Connectors, then Advanced, and turn on developer mode. Create a new connector, paste the connector URL, choose no authentication and save. Then start a new chat and ask about PENS.</p>
<p><strong>Claude (custom connector):</strong> open Settings, then Connectors, choose Add custom connector, paste the connector URL and save. Then start a new chat and ask about PENS.</p>
<p>Menu names can change as ChatGPT and Claude update. You can also try the cards without an AI assistant in the <a href="/guide">phone guide</a>.</p>

<h2>Privacy requests</h2>
<p>The App does not store what you type and has no accounts. To ask a privacy question or request deletion of a support email, write to ${mail} with "Privacy" in the subject. Read the <a href="/privacy">Privacy Policy</a> and the <a href="/terms">Terms of Use</a>.</p>
</section>`;
}

function supportEs(): string {
  return `<section id="es" lang="es" class="legal">
${legalHeader("es", "Soporte")}
<p>¿Necesita ayuda con la Guía Familiar de PENS en ChatGPT, Claude o en la web? Escriba a ${mail}.</p>
<div class="card urgent"><strong>¿Emergencia?</strong> Llame al 911 ahora. Si alguien podría hacerse daño, llame o envíe un texto al 988. No espere una respuesta por correo o chat.</div>

<h2>Preguntas sobre la atención de su hijo</h2>
<p>La App ofrece información general, no es consejo médico. Las citas, recetas, resultados de pruebas, expedientes y cualquier pregunta sobre la salud de su hijo van a la oficina de PENS, no al soporte de la App. Llame a PENS:</p>
${contactBlock("es")}

<h2>Cómo obtener ayuda con la App</h2>
<p>Escriba a ${mail}. Para ayudarnos a resolver el problema, incluya:</p>
<ul>
<li>dónde la usó (ChatGPT, Claude, la guía web o el sitio de presentación) y en qué dispositivo o navegador;</li>
<li>el idioma que usó (inglés o español);</li>
<li>qué tarjeta o función, y qué preguntó, en palabras generales;</li>
<li>la fecha y hora aproximadas, y cualquier mensaje de error que haya visto.</li>
</ul>
<p><strong>Por favor no incluya</strong> el nombre, la fecha de nacimiento, el número de expediente ni detalles de salud de su hijo. No los necesitamos para arreglar la App.</p>
<p>Revisamos todos los mensajes y respondemos lo antes posible, normalmente por correo. No podemos prometer un tiempo de respuesta específico, y el soporte de la App no puede responder preguntas médicas.</p>

<h2>Antes de escribir</h2>
<ul>
<li>Empiece un chat nuevo después de agregar, actualizar o volver a conectar la App.</li>
<li>Pregunte con palabras sencillas, por ejemplo "¿Cuál es el horario de PENS?" o "Muéstrele a mi hijo de 6 años qué pasa en un EEG". Vea los <a href="/reviewer-demo">ejemplos</a>.</li>
<li>Para recibir respuestas en español, pregunte en español; todas las tarjetas responden en español.</li>
<li>Si una tarjeta dice que eliminó datos personales, vuelva a preguntar sin nombres, fechas ni números.</li>
</ul>

<h2>Agregar la App a ChatGPT o Claude</h2>
<p>URL del conector: ${connectorUrl(MCP_PATH)} (no necesita iniciar sesión).</p>
<p><strong>ChatGPT (modo de desarrollador):</strong> abra Configuración, luego Apps y conectores, luego Avanzado, y active el modo de desarrollador. Cree un conector nuevo, pegue la URL del conector, elija sin autenticación y guarde. Luego empiece un chat nuevo y pregunte sobre PENS.</p>
<p><strong>Claude (conector personalizado):</strong> abra Configuración, luego Conectores, elija Agregar conector personalizado, pegue la URL del conector y guarde. Luego empiece un chat nuevo y pregunte sobre PENS.</p>
<p>Los nombres de los menús pueden cambiar cuando ChatGPT y Claude se actualizan. También puede probar las tarjetas sin un asistente de IA en la <a href="/guide?lang=es">guía para el teléfono</a>.</p>

<h2>Solicitudes de privacidad</h2>
<p>La App no guarda lo que usted escribe y no tiene cuentas. Para hacer una pregunta de privacidad o pedir que eliminemos un correo de soporte, escriba a ${mail} con "Privacidad" en el asunto. Lea la <a href="/privacy#es">Política de privacidad</a> y los <a href="/terms#es">Términos de uso</a>.</p>
</section>`;
}

export function supportPage(): string {
  return page(
    "Support · PENS",
    `${supportEn()}
${supportEs()}
<script>document.querySelectorAll(".mcp-url").forEach(function (el) { el.textContent = location.origin + el.getAttribute("data-path"); });</script>`,
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
