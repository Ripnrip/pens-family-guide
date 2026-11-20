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

/** MCP Apps protocol version this runtime speaks (ext-apps LATEST_PROTOCOL_VERSION). */
export const MCP_APPS_PROTOCOL_VERSION = "2026-01-26";

export const BASE_CSS = /* css */ `
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
@keyframes pens-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes pens-pop { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
@keyframes pens-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(184,58,38,.45); } 50% { box-shadow: 0 0 0 10px rgba(184,58,38,0); } }
${PIP_MOTION_CSS}
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
      ])
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

  function mount(fn) {
    renderFn = fn;
    root = document.getElementById('root');
    rerender = function (contextOnly) { if (contextOnly) { applyTheme(); } render(); };
    W.addEventListener('openai:set_globals', function () { render(); }, { passive: true });
    render();
    startBridge();
  }

  /** Replace an element's children and replay the gentle entrance (no-op under reduced motion). */
  function swap(el, children) {
    el.replaceChildren.apply(el, Array.isArray(children) ? children.filter(Boolean) : [children]);
    el.classList.remove('pens-in');
    void el.offsetWidth;
    el.classList.add('pens-in');
  }

  W.PENS = { h: h, api: api, mount: mount, linkButton: linkButton, list: list, swap: swap, brand: BRAND };
})();
`).replace("__MCP_APPS_PROTOCOL_VERSION__", MCP_APPS_PROTOCOL_VERSION);

function jsonForScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c").replaceAll("\u2028", "\\u2028").replaceAll("\u2029", "\\u2029");
}

export function buildWidgetHtml(opts: { title: string; css?: string; script: string }): string {
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
<script>window.__PENS_BRAND__ = ${jsonForScript(widgetBrand())};</script>
<script>${RUNTIME_JS}</script>
<script>${opts.script}</script>
</body>
</html>`;
}
