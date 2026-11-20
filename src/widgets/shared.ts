/**
 * Shared widget design system (CSS) and client runtime (JS), inlined into every widget.
 *
 * Client code rules: plain ES2019 in strings, no template literals inside client code, build DOM with
 * `h()` and textContent (never innerHTML with data), and guard every host access.
 *
 * Host bridges, in order:
 *   1. MCP Apps (`ui/*` JSON-RPC over postMessage), used by Claude, ChatGPT and other MCP Apps hosts.
 *   2. `window.openai` (ChatGPT Apps SDK globals) as a compatibility fallback.
 *   3. `window.__PENS_PREVIEW__` mock data injected by /preview/<widget> in a plain browser.
 */
import { BLOCKS, FONT_BODY, FONT_HEADING, MIDNIGHT, PIP_MOTION_CSS, TOKENS, widgetBrand } from "../brand/index.js";
import { FREDOKA_600_WOFF2_BASE64 } from "../brand/fonts/fredoka.js";
import { INTRO_ASSETS, PUBLIC_ORIGIN } from "../config.js";

/** MCP Apps protocol version this runtime speaks (ext-apps LATEST_PROTOCOL_VERSION). */
export const MCP_APPS_PROTOCOL_VERSION = "2026-01-26";

/**
 * Fredoka 600 (Latin + Latin-1 subset, OFL) embedded as a data: URI so headings render in the brand
 * font inside ChatGPT and Claude, whose widget CSP blocks font fetches. Declared for 600-700 so
 * 700-weight headings use it without synthetic bold.
 */
export const FONT_FACE_CSS = `@font-face { font-family: "Fredoka"; font-style: normal; font-weight: 600 700; font-display: swap; src: url(data:font/woff2;base64,${FREDOKA_600_WOFF2_BASE64}) format("woff2"); }`;

export const BASE_CSS = /* css */ `
${FONT_FACE_CSS}
:root {
  --pens-primary: ${TOKENS.teal};
  --pens-primary-ink: #FFFFFF;
  --pens-accent: ${TOKENS.sunshine};
  --pens-accent-ink: ${TOKENS.ink};
  --pens-coral: ${TOKENS.coral};
  --pens-urgent: ${TOKENS.brick};
  --pens-urgent-ink: #FFFFFF;
  --pens-urgent-bg: #FBE9E5;
  --pens-bg: ${TOKENS.page};
  --pens-sky: ${TOKENS.sky};
  --pens-surface: #FFFFFF;
  --pens-ink: ${TOKENS.ink};
  --pens-muted: #4A5B68;
  --pens-border: #C9DFE3;
  --pens-chip: ${TOKENS.sky};
  --pens-success: #1E7B4A;
  --pens-focus: ${TOKENS.sunshine};
  --pens-radius: 16px;
  --pens-gap: 12px;
  --pens-font: ${FONT_BODY};
  --pens-font-heading: ${FONT_HEADING};
  --pens-raised: #FFFFFF;
  --pens-urgent-text: ${TOKENS.brick};
  --pens-cream: ${BLOCKS.cream};
  --pens-b-red: ${BLOCKS.redDeep};
  --pens-b-blue: ${BLOCKS.blueDeep};
  --pens-b-yellow: ${BLOCKS.yellow};
  --pens-b-green: ${BLOCKS.green};
  --pens-b-orange: ${BLOCKS.orange};
  --pens-shadow: 0 1px 2px rgba(29,43,54,.06), 0 6px 18px rgba(29,43,54,.06);
  color-scheme: light;
}
/* Midnight: deep blue surfaces, lavender controls, warm gold accents. "dark" is kept as an alias. */
[data-theme="midnight"], [data-theme="dark"] {
  --pens-primary: ${MIDNIGHT.lavender};
  --pens-primary-ink: ${MIDNIGHT.bg};
  --pens-accent: ${MIDNIGHT.gold};
  --pens-accent-ink: ${MIDNIGHT.bg};
  --pens-urgent: ${TOKENS.brick};
  --pens-urgent-ink: #FFFFFF;
  --pens-urgent-bg: ${MIDNIGHT.urgentBg};
  --pens-urgent-text: ${MIDNIGHT.urgentText};
  --pens-bg: ${MIDNIGHT.bg};
  --pens-sky: ${MIDNIGHT.chip};
  --pens-surface: ${MIDNIGHT.surface};
  --pens-raised: ${MIDNIGHT.raised};
  --pens-ink: ${MIDNIGHT.ink};
  --pens-muted: ${MIDNIGHT.muted};
  --pens-border: ${MIDNIGHT.border};
  --pens-chip: ${MIDNIGHT.chip};
  --pens-success: ${MIDNIGHT.success};
  --pens-focus: ${MIDNIGHT.gold};
  --pens-shadow: 0 1px 2px rgba(0,0,0,.25), 0 8px 22px rgba(0,0,0,.28);
  color-scheme: dark;
}
* { box-sizing: border-box; }
[hidden] { display: none !important; }
html, body { margin: 0; padding: 0; }
body {
  font-family: var(--pens-font);
  background: var(--pens-bg);
  color: var(--pens-ink);
  font-size: 15px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
#root { padding: 14px; max-width: 760px; margin: 0 auto; }
#root.inline { max-height: 600px; overflow-y: auto; }
h1, h2, h3 { margin: 0 0 6px; line-height: 1.25; font-family: var(--pens-font-heading); font-weight: 700; }
h1 { font-size: 20px; } h2 { font-size: 17px; } h3 { font-size: 15px; }
p { margin: 0 0 8px; }
ul, ol { margin: 0; padding-left: 20px; }
li { margin: 3px 0; }
a { color: var(--pens-primary); }
.card {
  background: var(--pens-surface);
  border: 1px solid var(--pens-border);
  border-radius: var(--pens-radius);
  padding: 16px;
  margin-bottom: var(--pens-gap);
}
.row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.stack > * + * { margin-top: 8px; }
.grid { display: grid; gap: var(--pens-gap); grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
.muted { color: var(--pens-muted); }
.small { font-size: 13px; }
.chip {
  display: inline-flex; align-items: center; gap: 4px;
  background: var(--pens-chip); color: var(--pens-ink);
  border-radius: 999px; padding: 2px 10px; font-size: 12px; font-weight: 700;
}
.chip.todo { background: transparent; border: 1px dashed var(--pens-muted); color: var(--pens-muted); font-weight: 600; }
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  min-height: 44px; min-width: 44px; padding: 10px 16px;
  border-radius: 12px; border: 2px solid transparent;
  font: inherit; font-weight: 800; text-decoration: none; cursor: pointer;
  background: var(--pens-primary); color: var(--pens-primary-ink);
}
.btn.secondary { background: transparent; color: var(--pens-primary); border-color: var(--pens-primary); }
.btn.accent { background: var(--pens-accent); color: var(--pens-accent-ink); }
.btn.urgent { background: var(--pens-urgent); color: var(--pens-urgent-ink); }
.btn.ghost { background: transparent; color: var(--pens-ink); border-color: var(--pens-border); }
.btn[disabled] { opacity: .55; cursor: not-allowed; }
.btn:focus-visible, button:focus-visible, a:focus-visible, input:focus-visible, summary:focus-visible {
  outline: 3px solid var(--pens-focus); outline-offset: 2px;
}
.icon { font-size: 22px; line-height: 1; }
.urgent-card {
  background: var(--pens-urgent-bg); border: 2px solid var(--pens-urgent);
  border-radius: var(--pens-radius); padding: 16px; margin-bottom: var(--pens-gap);
}
.urgent-card h2 { font-size: 18px; color: var(--pens-urgent-text); }
.notice {
  background: var(--pens-chip); border-radius: 12px; padding: 10px 12px; margin-bottom: var(--pens-gap);
  font-size: 13px;
}
.footer { font-size: 12px; color: var(--pens-muted); padding: 4px 2px 0; }
.brandline { display: flex; align-items: center; gap: 6px; margin-top: 8px; font-weight: 700; color: var(--pens-muted); }
.brandline img { width: 18px; height: 18px; border-radius: 5px; display: block; }
.footer .chip { margin-top: 6px; }
.check {
  display: flex; gap: 10px; align-items: flex-start; min-height: 44px; padding: 8px 4px;
  border-radius: 10px; cursor: pointer;
}
.check input { width: 22px; height: 22px; margin-top: 1px; accent-color: var(--pens-primary); flex: none; }
.check.done span { text-decoration: line-through; color: var(--pens-muted); }
details > summary { cursor: pointer; font-weight: 800; min-height: 44px; display: flex; align-items: center; }
.tabs { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; margin-bottom: var(--pens-gap); }
.tab { white-space: nowrap; flex: 0 0 auto; }
.tab[aria-selected="true"] { background: var(--pens-primary); color: var(--pens-primary-ink); }
.tab[aria-selected="false"] { background: var(--pens-surface); color: var(--pens-ink); border-color: var(--pens-border); }
.pens-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
.pens-mark { display: inline-flex; align-items: center; gap: 8px; font-family: var(--pens-font-heading); font-weight: 700; font-size: 15px; color: var(--pens-ink); }
.pens-mark img { width: 30px; height: 30px; display: block; }
.pens-mark small { font-family: var(--pens-font); font-weight: 700; font-size: 12px; color: var(--pens-muted); }
.theme-toggle {
  display: inline-flex; align-items: center; gap: 8px; min-height: 44px; min-width: 44px; padding: 6px 12px 6px 10px;
  border-radius: 999px; border: 1px solid var(--pens-border); background: var(--pens-surface); color: var(--pens-ink);
  font: inherit; font-size: 13px; font-weight: 800; cursor: pointer;
}
.theme-toggle .ico { width: 18px; height: 18px; border-radius: 50%; flex: none; background: ${TOKENS.sunshine}; box-shadow: 0 0 0 3px rgba(246,185,59,.3); }
[data-theme="midnight"] .theme-toggle .ico, [data-theme="dark"] .theme-toggle .ico { background: transparent; box-shadow: inset -6px -2px 0 0 ${MIDNIGHT.gold}; }
.dot { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 9px; font-weight: 900; font-size: 14px; flex: none; }
.dot.b0 { background: var(--pens-b-red); color: #FFFFFF; } .dot.b1 { background: var(--pens-b-blue); color: #FFFFFF; }
.dot.b2 { background: var(--pens-b-yellow); color: ${TOKENS.ink}; } .dot.b3 { background: var(--pens-b-green); color: ${TOKENS.ink}; }
.dot.b4 { background: var(--pens-b-orange); color: ${TOKENS.ink}; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; }
.loading { padding: 24px; text-align: center; color: var(--pens-muted); }
/* Motion: gentle entrances, press feedback, Pip bob/blink, first-aid pulse. All off under reduced motion. */
@media (prefers-reduced-motion: no-preference) {
  #root > * { animation: pens-rise .42s cubic-bezier(.2,.7,.2,1) both; }
  #root > *:nth-child(2) { animation-delay: .06s; }
  #root > *:nth-child(3) { animation-delay: .12s; }
  #root > *:nth-child(n+4) { animation-delay: .18s; }
  .btn, .tile { transition: transform .12s ease, box-shadow .12s ease, filter .12s ease, background-color .2s ease, color .2s ease, border-color .2s ease; }
  body, .card, .chip, .notice, .theme-toggle { transition: background-color .28s ease, color .28s ease, border-color .28s ease; }
  .theme-toggle .ico { transition: box-shadow .28s ease, background-color .28s ease; }
  .pens-in { animation: pens-rise .34s cubic-bezier(.2,.7,.2,1) both; }
  .pens-in > *:nth-child(2) { animation: pens-rise .34s cubic-bezier(.2,.7,.2,1) .04s both; }
  .pens-in > *:nth-child(n+3) { animation: pens-rise .34s cubic-bezier(.2,.7,.2,1) .08s both; }
  .check span { transition: color .2s ease; }
  .check input { transition: transform .15s ease; }
  .check input:checked { transform: scale(1.08); }
  details[open] > summary ~ * { animation: pens-rise .28s ease both; }
  .btn:active:not([disabled]) { transform: scale(.97); }
  .tile:hover:not([disabled]) { filter: brightness(1.06); }
  .tile:active:not([disabled]) { transform: scale(.95); }
  .tile.right { animation: pens-pop .38s cubic-bezier(.2,.9,.3,1.4) both; }
  .timer.call { animation: pens-pulse 1.3s ease-in-out infinite; }
}
/* Motion kit (pm-*): final states live outside the media query so reduced motion shows them at once. */
.pm-tw-rest { visibility: hidden; }
.pm-caret { display: inline-block; width: 2px; height: 1em; margin-right: -2px; vertical-align: -2px; background: currentColor; opacity: .75; }
.pm-sparks, .pm-confetti { position: absolute; inset: 0; pointer-events: none; z-index: 3; }
.pm-confetti { overflow: hidden; border-radius: inherit; }
.pm-spark { position: absolute; width: 14px; height: 14px; margin: -7px 0 0 -7px; color: var(--pens-accent); opacity: 0; }
.pm-spark.c1 { color: var(--pens-coral); } .pm-spark.c2 { color: var(--pens-primary); }
.pm-spark svg { display: block; width: 100%; height: 100%; }
.pm-confetti i { position: absolute; top: -14px; width: 8px; height: 12px; border-radius: 2px; opacity: 0; }
.pm-confetti i.r { border-radius: 50%; width: 9px; height: 9px; }
.pm-ring { position: relative; display: inline-grid; place-items: center; flex: none; }
.pm-ring > svg { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); overflow: visible; }
.pm-ring circle { fill: none; stroke-width: var(--pm-sw, 10px); stroke-linecap: round; }
.pm-ring-trk { stroke: var(--pens-chip); }
.pm-ring-bar { stroke: var(--pens-primary); }
.pm-ring.tone-warn .pm-ring-bar { stroke: var(--pens-accent); }
.pm-ring.tone-urgent .pm-ring-bar { stroke: var(--pens-urgent); }
.pm-ring.tone-success .pm-ring-bar { stroke: var(--pens-success); }
.pm-ring-lab { position: relative; font-family: var(--pens-font-heading); font-weight: 600; font-variant-numeric: tabular-nums; line-height: 1; text-align: center; }
.pm-box { position: relative; width: 26px; height: 26px; flex: none; display: grid; place-items: center; border-radius: 8px;
  border: 2px solid var(--pens-muted); background: var(--pens-surface); color: var(--pens-primary-ink); }
.pm-box { pointer-events: none; }
.pm-box svg { width: 16px; height: 16px; display: block; overflow: visible; }
.pm-box path { fill: none; stroke: currentColor; stroke-width: 3.2; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 20; stroke-dashoffset: 20; }
input:checked + .pm-box, [aria-pressed="true"] > .pm-box, .is-on > .pm-box { background: var(--pens-primary); border-color: var(--pens-primary); }
input:checked + .pm-box path, [aria-pressed="true"] > .pm-box path, .is-on > .pm-box path { stroke-dashoffset: 0; }
.check { position: relative; }
.check input.pm-check-input { position: absolute; left: 4px; top: 8px; width: 26px; height: 26px; margin: 0; opacity: 0; cursor: pointer; }
.check input.pm-check-input:focus-visible + .pm-box { outline: 3px solid var(--pens-focus); outline-offset: 2px; }
@media (prefers-reduced-motion: no-preference) {
  .pm-caret { animation: pm-blink .8s steps(1) infinite; }
  .pm-fade { opacity: 0; transform: translateY(14px); transition: opacity .5s ease, transform .55s cubic-bezier(.2,.7,.2,1); transition-delay: var(--pm-delay, 0ms); }
  .pm-fade.is-in { opacity: 1; transform: none; }
  .pm-fade.is-in .btn, .pm-fade.is-in .pm-popin { animation: pm-pop-in .5s cubic-bezier(.2,.9,.3,1.25) backwards; animation-delay: calc(var(--pm-delay, 0ms) + 160ms); }
  .pm-pop-in { animation: pm-pop-in .55s cubic-bezier(.2,.9,.3,1.25) backwards; animation-delay: var(--pm-delay, 0ms); }
  .pm-boing { animation: pm-boing .45s cubic-bezier(.3,.7,.3,1) both; }
  .pm-shake { animation: pm-shake .42s ease both; }
  .pm-spark { animation: pm-sparkle .6s ease-out both; animation-delay: var(--pm-delay, 0ms); }
  .pm-confetti i { animation: pm-fall var(--pm-dur, 1.2s) cubic-bezier(.25,.6,.4,1) both; animation-delay: var(--pm-delay, 0ms); }
  .pm-ring-bar, .pm-ring-trk { transition: stroke-dashoffset .9s cubic-bezier(.2,.8,.2,1), stroke-dasharray .9s cubic-bezier(.2,.8,.2,1), opacity .3s ease, stroke .35s ease; }
  .pm-box { transition: background-color .18s ease, border-color .18s ease; }
  .pm-box path { transition: stroke-dashoffset .32s cubic-bezier(.6,0,.2,1) .05s; }
}
@keyframes pm-blink { 50% { opacity: 0; } }
@keyframes pm-pop-in { 0% { opacity: 0; transform: scale(.6); } 55% { opacity: 1; transform: scale(1.08); } 80% { transform: scale(.98); } 100% { opacity: 1; transform: none; } }
@keyframes pm-boing { 0% { transform: scale(1); } 35% { transform: scale(1.22); } 65% { transform: scale(.93); } 100% { transform: scale(1); } }
@keyframes pm-shake { 0%, 100% { transform: none; } 20% { transform: translateX(-6px); } 40% { transform: translateX(5px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(2px); } }
@keyframes pm-sparkle { 0% { opacity: 0; transform: scale(.2) rotate(0deg); } 40% { opacity: 1; transform: scale(1.15) rotate(70deg); } 100% { opacity: 0; transform: scale(.4) rotate(140deg) translateY(-6px); } }
@keyframes pm-fall { 0% { opacity: 1; transform: translate3d(0, 0, 0) rotate(0deg); } 85% { opacity: 1; } 100% { opacity: 0; transform: translate3d(var(--pm-dx, 0px), var(--pm-dy, 260px), 0) rotate(var(--pm-rot, 360deg)); } }
@keyframes pens-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes pens-pop { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
@keyframes pens-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(184,58,38,.45); } 50% { box-shadow: 0 0 0 10px rgba(184,58,38,0); } }
${PIP_MOTION_CSS}
/* First-run intro splash (once per user; never on seizure first aid, emergencies or reduced motion). */
#root.pens-splashing { display: none; }
.pens-splash { position: relative; width: calc(100% - 28px); max-width: 420px; margin: 14px auto; aspect-ratio: 540 / 592; border-radius: 22px; overflow: hidden;
  background: #F6EEE2; box-shadow: var(--pens-shadow); }
.pens-splash video, .pens-splash img { display: block; width: 100%; height: 100%; object-fit: cover; }
.pens-skip { position: absolute; top: 10px; right: 10px; z-index: 2; min-height: 44px; min-width: 44px; padding: 8px 16px; border-radius: 999px;
  border: 0; background: rgba(255,255,255,.92); color: ${TOKENS.ink}; font: inherit; font-size: 15px; font-weight: 800; cursor: pointer;
  box-shadow: 0 2px 10px rgba(0,0,0,.18); }
.pens-skip:focus-visible { outline: 3px solid var(--pens-focus); outline-offset: 2px; }
.pens-replay { background: none; border: 0; padding: 10px 0; min-height: 44px; font: inherit; font-size: 12px; font-weight: 800; color: var(--pens-primary);
  text-decoration: underline; cursor: pointer; }
@media (prefers-reduced-motion: no-preference) {
  .pens-splash { animation: pens-splash-in .3s ease both; }
  .pens-splash.out { animation: pens-splash-out .26s ease both; }
  #root.pens-revealed { animation: pens-reveal .55s cubic-bezier(.2,.9,.3,1.2) both; transform-origin: 50% 0; }
}
@keyframes pens-splash-in { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: none; } }
@keyframes pens-splash-out { to { opacity: 0; transform: scale(.94); } }
@keyframes pens-reveal { 0% { opacity: 0; transform: scale(.9) translateY(10px); } 60% { opacity: 1; transform: scale(1.02); } 100% { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
}
`;

/** Client runtime. Exposes window.PENS = { h, api, mount }. */
export const RUNTIME_JS = (/* js */ `
(function () {
  'use strict';
  var W = window;
  var PREVIEW = W.__PENS_PREVIEW__ || null;
  var BRAND = W.__PENS_BRAND__ || { logo: '', pip: {}, name: 'PENS', descriptor: 'Tampa Bay' };
  var memState = null;
  var introFlag = false;
  var rerender = function () {};

  // ---------- MCP Apps bridge (ui/* JSON-RPC over postMessage) ----------
  var bridge = { connected: false, ctx: {}, caps: {}, toolOutput: null, toolMeta: null, toolInput: null, seq: 1, pending: {} };
  function inFrame() { try { return !!W.parent && W.parent !== W; } catch (e) { return true; } }
  function post(msg) { try { W.parent.postMessage(msg, '*'); } catch (e) {} }
  function rpc(method, params, timeoutMs) {
    return new Promise(function (resolve, reject) {
      var id = 'pens-' + (bridge.seq++);
      bridge.pending[id] = { resolve: resolve, reject: reject };
      post({ jsonrpc: '2.0', id: id, method: method, params: params || {} });
      if (timeoutMs) setTimeout(function () {
        if (bridge.pending[id]) { delete bridge.pending[id]; reject(new Error('MCP Apps host did not answer ' + method)); }
      }, timeoutMs);
    });
  }
  function notify(method, params) { post({ jsonrpc: '2.0', method: method, params: params || {} }); }
  function respond(id, result) { post({ jsonrpc: '2.0', id: id, result: result || {} }); }
  function onHostMessage(m) {
    var p = m.params || {};
    if (m.method === 'ui/notifications/tool-result') {
      bridge.toolOutput = p.structuredContent || null;
      bridge.toolMeta = p._meta || {};
      rerender();
    } else if (m.method === 'ui/notifications/tool-input') {
      bridge.toolInput = p.arguments || {};
    } else if (m.method === 'ui/notifications/host-context-changed') {
      for (var k in p) if (Object.prototype.hasOwnProperty.call(p, k)) bridge.ctx[k] = p[k];
      if (p.theme) userTheme = null;
      rerender(true);
    } else if (m.method === 'ui/resource-teardown' || m.method === 'ping') {
      if (m.id !== undefined) respond(m.id, {});
    } else if (m.id !== undefined) {
      post({ jsonrpc: '2.0', id: m.id, error: { code: -32601, message: 'Method not found' } });
    }
  }
  W.addEventListener('message', function (ev) {
    if (!inFrame() || ev.source !== W.parent) return;
    var m = ev.data;
    if (!m || m.jsonrpc !== '2.0') return;
    if (m.id !== undefined && !m.method && bridge.pending[m.id]) {
      var pend = bridge.pending[m.id];
      delete bridge.pending[m.id];
      if (m.error) pend.reject(new Error(m.error.message || 'MCP Apps error')); else pend.resolve(m.result);
      return;
    }
    if (m.method) onHostMessage(m);
  });
  function reportSize() {
    if (!bridge.connected) return;
    var el = document.documentElement;
    notify('ui/notifications/size-changed', { width: Math.ceil(el.scrollWidth), height: Math.ceil(el.scrollHeight) });
  }
  function startBridge() {
    if (!inFrame()) return;
    rpc('ui/initialize', {
      appInfo: { name: 'pens-widget', version: '1.0.0' },
      appCapabilities: { availableDisplayModes: ['inline', 'fullscreen'] },
      protocolVersion: '__MCP_APPS_PROTOCOL_VERSION__'
    }, 0).then(function (res) {
      bridge.connected = true;
      bridge.ctx = (res && res.hostContext) || {};
      bridge.caps = (res && res.hostCapabilities) || {};
      notify('ui/notifications/initialized', {});
      rerender(true);
      try {
        if (W.ResizeObserver) new W.ResizeObserver(function () { reportSize(); }).observe(document.documentElement);
      } catch (e) {}
      reportSize();
    }, function () {});
  }

  // ---------- ChatGPT Apps SDK globals (fallback) and /preview mock data ----------
  function oa() { return W.openai || null; }
  var CTX_KEYS = { theme: 'theme', locale: 'locale', displayMode: 'displayMode' };
  function getGlobal(key) {
    if (key === 'toolOutput' && bridge.toolOutput) return bridge.toolOutput;
    if (key === 'toolResponseMetadata' && bridge.toolOutput && bridge.toolMeta) return bridge.toolMeta;
    if (CTX_KEYS[key] && bridge.ctx[CTX_KEYS[key]]) return bridge.ctx[CTX_KEYS[key]];
    var o = oa();
    try { if (o && o[key] !== undefined && o[key] !== null) return o[key]; } catch (e) {}
    if (PREVIEW && PREVIEW[key] !== undefined) return PREVIEW[key];
    return null;
  }
  // Themes: 'light' (default) or 'midnight'. Order: the family's own choice (toggle, kept in widget
  // state) > the host's theme ('dark' maps to midnight) > light.
  var userTheme = null;
  function normTheme(t) { return (t === 'dark' || t === 'midnight') ? 'midnight' : (t === 'light' ? 'light' : null); }
  function savedTheme() {
    var s = getGlobal('widgetState');
    return normTheme((s && s.pensTheme) || (memState && memState.pensTheme));
  }
  function reducedMotion() {
    try { return !!(W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
  }

  var api = {
    hasHost: function () { return !!oa() || bridge.connected; },
    bridge: function () { return bridge.connected ? 'mcp-apps' : (oa() ? 'openai' : (PREVIEW ? 'preview' : 'none')); },
    toolOutput: function () { return getGlobal('toolOutput'); },
    toolMeta: function () { return getGlobal('toolResponseMetadata') || {}; },
    toolInput: function () { return bridge.toolInput || getGlobal('toolInput') || {}; },
    theme: function () { return userTheme || savedTheme() || normTheme(getGlobal('theme')) || 'light'; },
    setTheme: function (t) {
      userTheme = normTheme(t) || 'light';
      api.setWidgetState(api.widgetState());
      applyTheme();
    },
    /** True inside the PENS standalone guide, which supplies its own header, language and theme controls. */
    inGuide: function () { return !!(bridge.connected && bridge.ctx && bridge.ctx.pensGuide); },
    canDownload: function () { return !oa() && (!bridge.connected || api.inGuide()); },
    locale: function () { return getGlobal('locale') || (navigator.language || 'en'); },
    displayMode: function () { return getGlobal('displayMode') || 'inline'; },
    reducedMotion: reducedMotion,
    widgetState: function () {
      var s = getGlobal('widgetState');
      return s || memState || {};
    },
    setWidgetState: function (state) {
      var next = {};
      for (var k in (state || {})) if (Object.prototype.hasOwnProperty.call(state, k)) next[k] = state[k];
      var keep = userTheme || savedTheme();
      if (keep) next.pensTheme = keep;
      var prev = getGlobal('widgetState');
      if (introFlag || (prev && prev.pensIntro) || (memState && memState.pensIntro)) next.pensIntro = 1;
      memState = next;
      var o = oa();
      try { if (o && typeof o.setWidgetState === 'function') { o.setWidgetState(next); } } catch (e) {}
    },
    openExternal: function (href) {
      var o = oa();
      try { if (o && typeof o.openExternal === 'function') { o.openExternal({ href: href }); return true; } } catch (e) {}
      if (bridge.connected) { rpc('ui/open-link', { url: href }, 10000).catch(function () {}); return true; }
      return false;
    },
    sendFollowUp: function (prompt) {
      var o = oa();
      try { if (o && typeof o.sendFollowUpMessage === 'function') { o.sendFollowUpMessage({ prompt: prompt }); return true; } } catch (e) {}
      if (bridge.connected) {
        rpc('ui/message', { role: 'user', content: [{ type: 'text', text: prompt }] }, 10000).catch(function () { api.toast(prompt); });
        return true;
      }
      api.toast(prompt);
      return false;
    },
    callTool: function (name, args) {
      var o = oa();
      try { if (o && typeof o.callTool === 'function') { return o.callTool(name, args); } } catch (e) {}
      if (bridge.connected) return rpc('tools/call', { name: name, arguments: args || {} }, 20000);
      return Promise.reject(new Error('callTool unavailable'));
    },
    canRequestDisplayMode: function () {
      var o = oa();
      if (o && typeof o.requestDisplayMode === 'function') return true;
      var modes = bridge.ctx.availableDisplayModes;
      return !!(bridge.connected && modes && modes.indexOf('fullscreen') !== -1);
    },
    requestDisplayMode: function (mode) {
      var o = oa();
      try { if (o && typeof o.requestDisplayMode === 'function') { return o.requestDisplayMode({ mode: mode }); } } catch (e) {}
      if (bridge.connected) return rpc('ui/request-display-mode', { mode: mode }, 10000).catch(function () { return { mode: 'inline' }; });
      return Promise.resolve({ mode: 'inline' });
    },
    toast: function (msg) {
      var t = document.getElementById('pens-toast');
      if (!t) return;
      t.textContent = msg;
      t.hidden = false;
      clearTimeout(api._toastTimer);
      api._toastTimer = setTimeout(function () { t.hidden = true; }, 2600);
    }
  };

  function h(tag, props, children) {
    var el = document.createElement(tag);
    props = props || {};
    for (var k in props) {
      if (!Object.prototype.hasOwnProperty.call(props, k)) continue;
      var v = props[k];
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'style') el.setAttribute('style', v);
      else if (k.indexOf('on') === 0 && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, String(v));
    }
    var list = children === undefined ? [] : (Array.isArray(children) ? children : [children]);
    for (var i = 0; i < list.length; i++) {
      var c = list[i];
      if (c === null || c === undefined || c === false) continue;
      el.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
    }
    return el;
  }

  /** Link-styled button that prefers window.openai.openExternal and falls back to a normal link. */
  function linkButton(label, href, cls, extra) {
    var isTel = href.indexOf('tel:') === 0 || href.indexOf('mailto:') === 0;
    var a = h('a', {
      class: 'btn ' + (cls || ''),
      href: href,
      target: isTel ? null : '_blank',
      rel: isTel ? null : 'noopener noreferrer',
      'aria-label': extra && extra.aria ? extra.aria : null
    }, [extra && extra.icon ? h('span', { 'aria-hidden': 'true', text: extra.icon }) : null, label]);
    a.addEventListener('click', function (ev) {
      if (!isTel && api.openExternal(href)) ev.preventDefault();
    });
    return a;
  }

  function list(items, ordered) {
    return h(ordered ? 'ol' : 'ul', null, (items || []).map(function (t) { return h('li', { text: t }); }));
  }

  function emergencyCard(em) {
    return h('section', { class: 'urgent-card', role: 'alert', 'aria-live': 'assertive' }, [
      h('h2', null, [h('span', { 'aria-hidden': 'true', text: '⚠️ ' }), em.title]),
      h('p', { text: em.lead }),
      list(em.reasons),
      h('div', { class: 'row', style: 'margin-top:10px' }, em.actions.map(function (a) {
        return linkButton(a.label, a.href, a.kind === 'urgent' ? 'urgent' : 'secondary');
      })),
      h('p', { class: 'small', style: 'margin-top:10px', text: em.nonEmergency })
    ]);
  }

  function footer(data) {
    var review = data.contentReview && data.contentReview.label;
    return h('footer', { class: 'footer' }, [
      h('div', { text: data.disclaimer || '' }),
      review ? h('span', { class: 'chip todo', text: review }) : null,
      h('div', { class: 'brandline' }, [
        BRAND.logo ? h('img', { src: BRAND.logo, alt: '', width: '18', height: '18' }) : null,
        h('span', { text: BRAND.name + ' · ' + BRAND.descriptor })
      ]),
      W.__PENS_WIDGET__ === 'clinic-card' ? h('button', { class: 'pens-replay', type: 'button', onclick: function () { splash(true); } },
        document.documentElement.getAttribute('lang') === 'es' ? 'Ver la presentación otra vez' : 'Replay intro') : null
    ]);
  }

  var lastKey = null;
  var renderFn = null;
  var root = null;

  var THEME_LABELS = {
    en: { light: 'Light', midnight: 'Midnight', toMidnight: 'Switch to the midnight theme', toLight: 'Switch to the light theme' },
    es: { light: 'Claro', midnight: 'Noche', toMidnight: 'Cambiar al tema de noche', toLight: 'Cambiar al tema claro' }
  };
  function syncToggle() {
    var b = document.getElementById('pens-theme-toggle');
    if (!b) return;
    var night = api.theme() === 'midnight';
    var T = THEME_LABELS[document.documentElement.getAttribute('lang') === 'es' ? 'es' : 'en'];
    b.setAttribute('aria-pressed', night ? 'true' : 'false');
    b.setAttribute('aria-label', night ? T.toLight : T.toMidnight);
    var lab = b.querySelector('.lab');
    if (lab) lab.textContent = night ? T.midnight : T.light;
  }
  function topBar() {
    return h('div', { class: 'pens-top' }, [
      h('span', { class: 'pens-mark' }, [
        BRAND.logo ? h('img', { src: BRAND.logo, alt: '', width: '30', height: '30' }) : null,
        h('span', null, [BRAND.name + ' ', h('small', { text: BRAND.descriptor })])
      ]),
      h('button', { class: 'theme-toggle', id: 'pens-theme-toggle', type: 'button', 'aria-pressed': 'false', onclick: function () {
        api.setTheme(api.theme() === 'midnight' ? 'light' : 'midnight');
      } }, [h('span', { class: 'ico', 'aria-hidden': 'true' }), h('span', { class: 'lab' })])
    ]);
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', api.theme());
    var data = api.toolOutput();
    var lang = (data && data.lang) || (String(api.locale()).toLowerCase().indexOf('es') === 0 ? 'es' : 'en');
    document.documentElement.setAttribute('lang', lang);
    if (root) root.className = api.displayMode() === 'fullscreen' ? 'fullscreen' : 'inline';
    var top = document.querySelector('.pens-top');
    if (top) top.hidden = api.inGuide();
    syncToggle();
  }

  function render() {
    applyTheme();
    var data = api.toolOutput();
    if (!data) {
      if (lastKey !== '__loading') {
        lastKey = '__loading';
        root.replaceChildren(h('div', { class: 'loading', role: 'status' }, 'Loading… / Cargando…'));
      }
      return;
    }
    var key;
    try { key = JSON.stringify(data); } catch (e) { key = String(Math.random()); }
    if (key === lastKey) return;
    lastKey = key;
    var body = h('div');
    root.replaceChildren();
    root.appendChild(topBar());
    applyTheme();
    if (data.emergency) root.appendChild(emergencyCard(data.emergency));
    if (data.privacyNotice) root.appendChild(h('div', { class: 'notice', role: 'note', text: data.privacyNotice }));
    root.appendChild(body);
    try {
      renderFn(body, data, api);
    } catch (err) {
      body.appendChild(h('div', { class: 'card', role: 'alert', text: 'Something went wrong showing this card. / Algo salió mal.' }));
      if (W.console) console.error(err);
    }
    root.appendChild(footer(data));
  }

  // ---------- First-run intro splash ----------
  // Shown once per user before the card: a muted, inline, sped-up logo clip with Skip. "Once" is kept
  // in widget state and (when allowed) localStorage, else once per page load. Never on seizure first
  // aid, never with an emergency card, never under reduced motion; content shows after ~4 s if the
  // clip cannot play.
  var INTRO = W.__PENS_INTRO__ || null;
  var NO_SPLASH = { 'seizure-first-aid': true };
  var splashShownThisLoad = false;
  var splashEl = null;
  var SEEN_KEY = 'pens-intro-seen';
  function introSeen() {
    var s = getGlobal('widgetState');
    if ((s && s.pensIntro) || (memState && memState.pensIntro)) return true;
    try { if (W.localStorage && W.localStorage.getItem(SEEN_KEY) === '1') return true; } catch (e) {}
    return false;
  }
  function markIntroSeen() {
    introFlag = true;
    try { if (W.localStorage) W.localStorage.setItem(SEEN_KEY, '1'); } catch (e) {}
    var cur = api.widgetState() || {};
    if (!cur.pensIntro) {
      var next = {};
      for (var k in cur) if (Object.prototype.hasOwnProperty.call(cur, k)) next[k] = cur[k];
      next.pensIntro = 1;
      api.setWidgetState(next);
    }
  }
  function introUrl(path) {
    var base = PREVIEW && typeof PREVIEW.introOrigin === 'string' ? PREVIEW.introOrigin : (INTRO ? INTRO.origin : '');
    return base + path;
  }
  function endSplash(reveal) {
    if (!splashEl) return;
    var el = splashEl;
    splashEl = null;
    clearTimeout(el._pmFail); clearTimeout(el._pmCap);
    document.removeEventListener('keydown', el._pmKey, true);
    function finish() {
      el.remove();
      if (!root) return;
      root.classList.remove('pens-splashing');
      if (reveal && !still()) {
        root.classList.remove('pens-revealed'); void root.offsetWidth; root.classList.add('pens-revealed');
        setTimeout(function () { root.classList.remove('pens-revealed'); }, 700);
      }
      reportSize();
    }
    if (still()) finish();
    else { el.classList.add('out'); setTimeout(finish, 260); }
  }
  /** Show the intro. force = replay from the clinic card (still never under an emergency). */
  function splash(force) {
    if (!INTRO || splashEl || !root) return false;
    var data = api.toolOutput();
    if (NO_SPLASH[W.__PENS_WIDGET__] || (data && data.emergency) || (PREVIEW && PREVIEW.noIntro && !force)) return false;
    var reduced = still();
    if (!force && (reduced || splashShownThisLoad || introSeen())) return false;
    splashShownThisLoad = true;
    markIntroSeen();
    var es = String(document.documentElement.getAttribute('lang') || '').indexOf('es') === 0;
    var skip = h('button', { class: 'pens-skip', type: 'button', text: es ? 'Saltar' : 'Skip' });
    var media;
    if (reduced) media = h('img', { src: introUrl(INTRO.poster), alt: '' });
    else {
      media = h('video', { muted: true, autoplay: true, playsinline: true, 'webkit-playsinline': true, preload: 'auto', poster: introUrl(INTRO.poster), 'aria-hidden': 'true', disablepictureinpicture: true }, [
        h('source', { src: introUrl(INTRO.webm), type: 'video/webm' }),
        h('source', { src: introUrl(INTRO.mp4), type: 'video/mp4' })
      ]);
      media.muted = true;
    }
    var el = h('div', { class: 'pens-splash', role: 'region', 'aria-label': es ? 'Presentación de PENS' : 'PENS intro' }, [media, skip]);
    splashEl = el;
    skip.addEventListener('click', function () { endSplash(true); });
    el._pmKey = function (ev) { if (ev.key === 'Escape') endSplash(true); };
    document.addEventListener('keydown', el._pmKey, true);
    if (reduced) el._pmCap = setTimeout(function () { endSplash(false); }, 600);
    else {
      var playing = false;
      media.addEventListener('playing', function () { playing = true; });
      media.addEventListener('ended', function () { endSplash(true); });
      media.addEventListener('error', function () { endSplash(true); }, true);
      el._pmFail = setTimeout(function () { if (!playing) endSplash(true); }, 4000);
      el._pmCap = setTimeout(function () { endSplash(true); }, 7000);
    }
    root.classList.add('pens-splashing');
    root.parentNode.insertBefore(el, root);
    reportSize();
    return true;
  }

  function mount(fn) {
    renderFn = fn;
    root = document.getElementById('root');
    rerender = function (contextOnly) { if (contextOnly) { applyTheme(); } render(); };
    W.addEventListener('openai:set_globals', function () { render(); }, { passive: true });
    render();
    if (api.toolOutput()) splash(false);
    else {
      // Host data arrives later (MCP Apps tool-result): decide once the first card is on screen.
      var wait = rerender;
      rerender = function (contextOnly) { wait(contextOnly); if (api.toolOutput()) { rerender = wait; splash(false); } };
    }
    startBridge();
  }

  /** Replace an element's children and replay the gentle entrance (no-op under reduced motion). */
  function swap(el, children) {
    el.replaceChildren.apply(el, Array.isArray(children) ? children.filter(Boolean) : [children]);
    el.classList.remove('pens-in');
    void el.offsetWidth;
    el.classList.add('pens-in');
  }

  // ---------- Motion kit ----------
  // Every helper renders the final state at once under prefers-reduced-motion, never blocks input,
  // and keeps entrances under ~600 ms. Decorative layers are aria-hidden and removed when done.
  var SVGNS = 'http://www.w3.org/2000/svg';
  var STAR = '<svg viewBox="0 0 24 24"><path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" fill="currentColor"/></svg>';
  function still() { return reducedMotion(); }
  function toList(x) {
    if (!x) return [];
    if (x.nodeType) return [x];
    return Array.prototype.slice.call(x).filter(Boolean);
  }
  function svgEl(tag, attrs) {
    var el = document.createElementNS(SVGNS, tag);
    for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) el.setAttribute(k, String(attrs[k]));
    return el;
  }
  function nextFrame(fn) {
    if (W.requestAnimationFrame) W.requestAnimationFrame(function () { W.requestAnimationFrame(fn); });
    else setTimeout(fn, 32);
  }
  function relative(el) {
    try { if (W.getComputedStyle && W.getComputedStyle(el).position === 'static') el.style.position = 'relative'; } catch (e) {}
  }
  function later(fn, ms) { setTimeout(fn, ms); }

  /** Restart a one-shot animation class (removed again on animationend). */
  function replay(el, cls, delay) {
    if (!el || still()) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    if (delay) el.style.setProperty('--pm-delay', delay + 'ms');
    el.classList.add(cls);
    function off(ev) {
      if (ev.target !== el) return;
      el.classList.remove(cls);
      el.removeEventListener('animationend', off);
    }
    el.addEventListener('animationend', off);
  }

  var fadeIO = null;
  function fadeObserver() {
    if (fadeIO !== null) return fadeIO;
    fadeIO = false;
    try {
      if (typeof W.IntersectionObserver === 'function') {
        fadeIO = new W.IntersectionObserver(function (entries) {
          var k = 0;
          entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            var el = e.target;
            el.style.setProperty('--pm-delay', Math.min(k * (el._pmStep || 60), 300) + 'ms');
            k++;
            el.classList.add('is-in');
            fadeIO.unobserve(el);
          });
        }, { threshold: 0.01 });
      }
    } catch (e) { fadeIO = false; }
    return fadeIO;
  }
  /** Fade elements up as they scroll into view, staggered within each batch (max 300 ms of stagger). */
  function fadeUp(els, opts) {
    var list = toList(els);
    if (!list.length || still()) return;
    var step = (opts && opts.step) || 60;
    list.forEach(function (el) { el._pmStep = step; el.classList.add('pm-fade'); });
    var io = fadeObserver();
    if (io) { list.forEach(function (el) { io.observe(el); }); return; }
    nextFrame(function () {
      list.forEach(function (el, i) { el.style.setProperty('--pm-delay', Math.min(i * step, 300) + 'ms'); el.classList.add('is-in'); });
    });
  }
  /** Spring pop: { enter: true } scales in from nothing, otherwise a quick boing on a visible element. */
  function springPop(el, opts) {
    toList(el).forEach(function (x, i) {
      replay(x, opts && opts.enter ? 'pm-pop-in' : 'pm-boing', opts && opts.enter ? ((opts.delay || 0) + i * (opts.step || 70)) : 0);
    });
  }
  function shake(el) { replay(el, 'pm-shake'); }
  /** A few star glints around an element (~600 ms), then the layer is removed. */
  function sparkle(el, opts) {
    if (!el || still()) return;
    relative(el);
    var spots = [[-2, 14], [102, 10], [98, 88], [2, 90], [46, -4], [60, 104], [24, -2], [80, 100]];
    var n = Math.min((opts && opts.count) || 6, spots.length);
    var tall = (el.offsetHeight || 0) > 260;
    var layer = h('span', { class: 'pm-sparks', 'aria-hidden': 'true' });
    for (var k = 0; k < n; k++) {
      // Tall elements: keep the glints around the top band that is on screen, not spread down the page.
      var top = tall ? Math.round(spots[k][1] * 1.8) + 'px' : spots[k][1] + '%';
      var s = h('span', { class: 'pm-spark c' + (k % 3), style: 'left:' + spots[k][0] + '%;top:' + top + ';--pm-delay:' + (k * 35) + 'ms' });
      s.innerHTML = STAR;
      layer.appendChild(s);
    }
    el.appendChild(layer);
    later(function () { layer.remove(); }, 900);
  }
  /** Brand-colored confetti falling through an element (~1.4 s, decorative). */
  function confetti(el, opts) {
    if (!el || still()) return;
    relative(el);
    var colors = ['var(--pens-b-red)', 'var(--pens-b-blue)', 'var(--pens-b-yellow)', 'var(--pens-b-green)', 'var(--pens-b-orange)', 'var(--pens-accent)'];
    var n = (opts && opts.count) || 30;
    var layer = h('span', { class: 'pm-confetti', 'aria-hidden': 'true' });
    for (var i = 0; i < n; i++) {
      var x = (i * 37 + 11) % 100;
      var dx = ((i * 53) % 80) - 40;
      var dy = 220 + (i * 41) % 200;
      var rot = (i % 2 ? 1 : -1) * (220 + (i * 47) % 320);
      layer.appendChild(h('i', { class: i % 3 === 0 ? 'r' : null, style: 'left:' + x + '%;background:' + colors[i % colors.length] +
        ';--pm-dx:' + dx + 'px;--pm-dy:' + dy + 'px;--pm-rot:' + rot + 'deg;--pm-delay:' + ((i % 8) * 55) + 'ms;--pm-dur:' + (1000 + (i % 5) * 110) + 'ms' }));
    }
    el.appendChild(layer);
    later(function () { layer.remove(); }, 2000);
  }
  /**
   * Type text into an element. Screen readers get the full text once (sr-only copy); the typed copy is
   * aria-hidden and the untyped rest keeps its space (no layout shift). Total time is capped at ~600 ms.
   */
  function typewriter(el, text, msPerChar) {
    if (!el) return;
    text = String(text === undefined || text === null ? el.textContent : text);
    if (still() || !text) { el.textContent = text; return; }
    var per = Math.min(msPerChar || 22, 600 / text.length);
    var typed = h('span');
    var caret = h('span', { class: 'pm-caret' });
    var rest = h('span', { class: 'pm-tw-rest', text: text });
    el.replaceChildren(h('span', { class: 'sr-only', text: text }), h('span', { 'aria-hidden': 'true' }, [typed, caret, rest]));
    var ticks = 0;
    function step() {
      ticks++;
      var n = Math.min(text.length, Math.ceil(ticks * 16 / per));
      typed.textContent = text.slice(0, n);
      rest.textContent = text.slice(n);
      if (n < text.length && el.isConnected !== false) later(step, 16);
      else { typed.textContent = text; rest.remove(); later(function () { caret.remove(); }, 700); }
    }
    later(step, 16);
  }
  /** Count a number up (or down) to a value; fmt(n) formats each frame. */
  function countUp(el, to, opts) {
    if (!el) return;
    opts = opts || {};
    var fmt = opts.fmt || function (n) { return String(n); };
    var from = opts.from !== undefined ? opts.from : (el._pmVal !== undefined ? el._pmVal : 0);
    el._pmVal = to;
    var token = {};
    el._pmTok = token;
    if (still() || from === to || !W.requestAnimationFrame) { el.textContent = fmt(to); return; }
    var dur = opts.dur || 600, t0 = null;
    el.textContent = fmt(from);
    function frame(ts) {
      if (el._pmTok !== token) return;
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(from + (to - from) * e));
      if (p < 1) W.requestAnimationFrame(frame);
    }
    W.requestAnimationFrame(frame);
  }
  /**
   * Animated circular progress ring (gauge arc + secondary track arc with gaps, after Magic UI's
   * "animated circular progress bar"). Returns { el, set(value), tone(name) }.
   * opts: size, stroke, max, value, label(v) -> center text (counts), center (element instead of label),
   * ariaLabel, valueText(v), decorative (aria-hidden), className.
   */
  function ring(opts) {
    var o = opts || {};
    var size = o.size || 96, sw = o.stroke || 10, max = o.max || 100;
    var r = (size - sw) / 2, C = 2 * Math.PI * r, mid = size / 2, gap = sw + 4;
    var svg = svgEl('svg', { viewBox: '0 0 ' + size + ' ' + size, width: size, height: size, 'aria-hidden': 'true', focusable: 'false' });
    var trk = svgEl('circle', { class: 'pm-ring-trk', cx: mid, cy: mid, r: r });
    var bar = svgEl('circle', { class: 'pm-ring-bar', cx: mid, cy: mid, r: r });
    svg.appendChild(trk); svg.appendChild(bar);
    var lab = o.center || h('span', { class: 'pm-ring-lab', 'aria-hidden': 'true', style: 'font-size:' + Math.round(size * 0.26) + 'px' });
    var el = h('div', { class: 'pm-ring' + (o.className ? ' ' + o.className : ''), style: 'width:' + size + 'px;height:' + size + 'px;--pm-sw:' + sw + 'px' }, [svg, lab]);
    if (o.decorative) el.setAttribute('aria-hidden', 'true');
    else {
      el.setAttribute('role', 'progressbar');
      el.setAttribute('aria-valuemin', '0');
      el.setAttribute('aria-valuemax', String(max));
      if (o.ariaLabel) el.setAttribute('aria-label', o.ariaLabel);
    }
    var cur = 0;
    function paint(v) {
      var p = Math.max(0, Math.min(1, v / max)), len = p * C;
      var g = p > 0 && p < 1 ? gap : 0;
      var sec = p >= 1 ? 0 : Math.max(0, C - len - 2 * g);
      bar.style.strokeDasharray = C + ' ' + C;
      bar.style.strokeDashoffset = String(C - len);
      bar.style.opacity = p > 0 ? '1' : '0';
      trk.style.strokeDasharray = sec + ' ' + C;
      trk.style.strokeDashoffset = String(-(len + g));
      trk.style.opacity = sec > 0.5 ? '1' : '0';
    }
    function set(v, how) {
      cur = Math.max(0, Math.min(max, v));
      if (!o.decorative) {
        el.setAttribute('aria-valuenow', String(cur));
        if (o.valueText) el.setAttribute('aria-valuetext', o.valueText(cur));
      }
      if (!o.center && o.label) countUp(lab, cur, { fmt: o.label, dur: (how && how.dur) || 800 });
      if (still() || (how && how.now)) paint(cur);
      else nextFrame(function () { paint(cur); });
    }
    function tone(name) {
      el.className = el.className.replace(/\\s*tone-\\S+/g, '') + (name ? ' tone-' + name : '');
    }
    paint(0);
    if (!o.center && o.label) { lab.textContent = o.label(0); lab._pmVal = 0; }
    set(o.value || 0);
    return { el: el, set: set, tone: tone, value: function () { return cur; } };
  }
  /** Checkbox face with a tick that draws itself; pair with input.pm-check-input placed just before it. */
  function tickBox() {
    var box = h('span', { class: 'pm-box', 'aria-hidden': 'true' });
    var svg = svgEl('svg', { viewBox: '0 0 16 16', focusable: 'false' });
    svg.appendChild(svgEl('path', { d: 'M3 8.5l3.5 3.4L13 4.5' }));
    box.appendChild(svg);
    return box;
  }

  var motion = {
    still: still, fadeUp: fadeUp, springPop: springPop, shake: shake, sparkle: sparkle, confetti: confetti,
    typewriter: typewriter, countUp: countUp, ring: ring, tickBox: tickBox, svg: svgEl
  };

  W.PENS = {
    h: h, api: api, mount: mount, linkButton: linkButton, list: list, swap: swap, brand: BRAND, motion: motion,
    fadeUp: fadeUp, springPop: springPop, shake: shake, sparkle: sparkle, confetti: confetti,
    typewriter: typewriter, countUp: countUp, ring: ring, tickBox: tickBox,
    replayIntro: function () { return splash(true); }
  };
})();
`).replace("__MCP_APPS_PROTOCOL_VERSION__", MCP_APPS_PROTOCOL_VERSION);

function jsonForScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c").replaceAll("\u2028", "\\u2028").replaceAll("\u2029", "\\u2029");
}

/** Absolute URLs of the intro clip on the app's own origin (the only thing widgets load). */
export function introAssets(): { origin: string; mp4: string; webm: string; poster: string } {
  return { origin: PUBLIC_ORIGIN, ...INTRO_ASSETS };
}

export function buildWidgetHtml(opts: { title: string; css?: string; script: string; id?: string }): string {
  return `<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${opts.title}</title>
<style>${BASE_CSS}${opts.css ?? ""}</style>
</head>
<body>
<main id="root" class="inline"></main>
<div id="pens-toast" class="notice" role="status" hidden style="position:fixed;left:12px;right:12px;bottom:12px;z-index:10"></div>
<script>window.__PENS_BRAND__ = ${jsonForScript(widgetBrand())}; window.__PENS_INTRO__ = ${jsonForScript(introAssets())}; window.__PENS_WIDGET__ = ${jsonForScript(opts.id ?? "")};</script>
<script>${RUNTIME_JS}</script>
<script>${opts.script}</script>
</body>
</html>`;
}
