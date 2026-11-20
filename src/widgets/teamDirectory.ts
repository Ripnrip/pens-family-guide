import { TEAM_PHOTOS } from "../content/teamPhotos.js";
import type { WidgetSource } from "./types.js";

/**
 * "Meet the team" directory: round faces that pop in as they scroll (spring + halo), filter chips,
 * search, a bottom-sheet profile with a few sparkles, and "Which suite?". Photos are inlined
 * (empty CSP). All motion lives in `team-*` classes/keyframes below and is off under reduced motion.
 * Neutral by design: no ratings, no review quotes, no ranking; scheduling goes through the office.
 */
export const teamDirectoryWidget: WidgetSource = {
  id: "team-directory",
  title: "Meet the PENS team",
  description:
    "PENS team directory: photo grid of physicians, nurse practitioners and counselors with search, role and Spanish filters, a profile sheet (title, focus, languages, suite, year joined) and a 'Which suite?' guide to Suites 340, 240 and 140. Neutral: no ratings or rankings.",
  css: /* css */ `
.team-head h1 { font-size: 26px; margin-bottom: 2px; }
.team-sub { min-height: 1.5em; margin-bottom: 10px; }
.team-caret { display: inline-block; width: 2px; height: 1em; margin-left: 2px; vertical-align: -2px; background: var(--pens-primary); }
.team-search { position: relative; margin-bottom: 10px; }
.team-search input { width: 100%; min-height: 48px; padding: 10px 14px 10px 40px; font: inherit; font-size: 16px; color: var(--pens-ink);
  background: var(--pens-surface); border: 2px solid var(--pens-border); border-radius: 14px; }
.team-search input:focus-visible { outline: 3px solid var(--pens-focus); outline-offset: 2px; }
.team-search svg { position: absolute; left: 13px; top: 15px; width: 18px; height: 18px; color: var(--pens-muted); pointer-events: none; }
.team-chips { display: flex; gap: 8px; overflow-x: auto; padding: 2px 2px 6px; margin-bottom: 4px; }
.team-chip { flex: none; min-height: 44px; padding: 0 16px; border-radius: 999px; font: inherit; font-size: 14px; font-weight: 800; cursor: pointer;
  background: var(--pens-surface); color: var(--pens-ink); border: 1.5px solid var(--pens-border); }
.team-chip[aria-pressed="true"] { background: var(--pens-primary); color: var(--pens-primary-ink); border-color: var(--pens-primary); }
.team-count { font-size: 13px; font-weight: 700; color: var(--pens-muted); margin: 4px 0 10px; }
.team-count b { color: var(--pens-ink); font-variant-numeric: tabular-nums; }
.team-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px 10px; }
@media (min-width: 520px) { .team-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
@media (min-width: 700px) { .team-grid { grid-template-columns: repeat(6, minmax(0, 1fr)); } }
.team-face { position: relative; display: flex; flex-direction: column; align-items: center; gap: 6px; width: 100%; min-height: 44px; padding: 4px 2px;
  background: transparent; border: 0; border-radius: 16px; font: inherit; color: var(--pens-ink); cursor: pointer; text-align: center; }
.team-ph { position: relative; display: block; width: 100%; max-width: 120px; aspect-ratio: 1; }
.team-ph img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top; border-radius: 50%;
  border: 3px solid var(--pens-surface); box-shadow: var(--pens-shadow); background: var(--pens-chip); }
.team-ring { position: absolute; inset: -6px; border-radius: 50%; border: 3px solid var(--pens-accent); opacity: 0; pointer-events: none; }
.team-es { position: absolute; right: -2px; bottom: 2px; padding: 1px 6px; border-radius: 999px; font-size: 10.5px; font-weight: 900;
  background: var(--pens-accent); color: var(--pens-accent-ink); border: 2px solid var(--pens-surface); }
.team-name { font-size: 13px; font-weight: 800; line-height: 1.25; }
.team-role { font-size: 11.5px; color: var(--pens-muted); line-height: 1.25; margin-top: -4px; }
.team-empty { text-align: center; padding: 16px 0; }
.team-links { display: grid; gap: 8px; margin-top: 16px; }
.team-links .btn { width: 100%; }
.team-suites { margin-top: 18px; }
.team-suites h2 { font-size: 20px; }
.team-suite { background: var(--pens-surface); border: 1px solid var(--pens-border); border-radius: var(--pens-radius); padding: 14px 16px; margin-bottom: 10px; }
.team-suite .kick { font-size: 13px; font-weight: 800; color: var(--pens-primary); }
.team-suite h3 { font-size: 24px; margin: 0 0 4px; }
.team-suite ul { margin-bottom: 6px; }
.team-who { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.team-mini { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 4px 12px 4px 4px; border-radius: 999px; cursor: pointer;
  background: var(--pens-chip); color: var(--pens-ink); border: 0; font: inherit; font-size: 13px; font-weight: 800; }
.team-mini img { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; object-position: top; }
.team-face:focus-visible, .team-mini:focus-visible, .team-chip:focus-visible { outline: 3px solid var(--pens-focus); outline-offset: 2px; }
.team-backdrop { position: fixed; inset: 0; z-index: 30; display: flex; align-items: flex-end; justify-content: center; padding: 12px;
  background: rgba(13, 20, 28, .5); }
.team-sheet { position: relative; width: 100%; max-width: 420px; max-height: calc(100vh - 24px); overflow-y: auto; padding: 22px 18px 16px;
  background: var(--pens-surface); color: var(--pens-ink); border: 1px solid var(--pens-border); border-radius: 24px; box-shadow: 0 18px 50px rgba(0,0,0,.3); }
.team-sheet .team-big { position: relative; width: 132px; height: 132px; margin: 0 auto 10px; }
.team-sheet .team-big img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; object-position: top; border: 4px solid var(--pens-accent); }
.team-sheet h2 { text-align: center; font-size: 22px; margin: 0; }
.team-sheet .cred { text-align: center; font-weight: 800; color: var(--pens-primary); margin: 2px 0 10px; }
.team-facts { display: grid; gap: 6px; margin: 10px 0 14px; padding: 10px 12px; border-radius: 14px; background: var(--pens-chip); }
.team-facts div { display: flex; gap: 8px; font-size: 14px; }
.team-facts dt { font-weight: 800; min-width: 92px; }
.team-facts dd { margin: 0; }
.team-sheet .btn { width: 100%; }
.team-spark { position: absolute; width: 14px; height: 14px; pointer-events: none; color: var(--pens-accent); opacity: 0; }
.team-spark svg { width: 100%; height: 100%; display: block; }
@media (min-width: 560px) { .team-backdrop { align-items: center; } }

/* Motion (team-*): spring pop + halo, typewriter caret, sheet rise, sparkles, fade-up. Off under reduced motion. */
@media (prefers-reduced-motion: no-preference) {
  .team-peek { opacity: 0; }
  .team-peek.is-in { animation: team-face-pop .72s cubic-bezier(.2,.9,.2,1) both; animation-delay: var(--team-delay, 0ms); }
  .team-peek.is-in .team-ring { animation: team-face-halo .9s ease-out both; animation-delay: calc(var(--team-delay, 0ms) + 120ms); }
  .team-face:active .team-ph { transform: scale(.95); }
  .team-ph { transition: transform .15s ease; }
  .team-chip { transition: background-color .2s ease, color .2s ease, border-color .2s ease, transform .12s ease; }
  .team-chip:active { transform: scale(.95); }
  .team-caret { animation: team-blink .9s steps(1) infinite; }
  .team-backdrop { animation: team-fade .25s ease both; }
  .team-sheet { animation: team-sheet-rise .42s cubic-bezier(.2,.9,.2,1) both; }
  .team-spark.on { animation: team-sparkle .9s ease-out both; animation-delay: var(--team-delay, 0ms); }
  .team-fadeup { opacity: 0; transform: translateY(18px); transition: opacity .6s ease, transform .6s cubic-bezier(.2,.7,.2,1); transition-delay: var(--team-delay, 0ms); }
  .team-fadeup.is-in { opacity: 1; transform: none; }
}
@keyframes team-face-pop {
  0% { opacity: 0; transform: translateY(22px) scale(.62) rotate(-8deg); }
  55% { opacity: 1; transform: translateY(-6px) scale(1.08) rotate(3deg); }
  100% { opacity: 1; transform: none; }
}
@keyframes team-face-halo { 0% { opacity: 0; transform: scale(.7); } 35% { opacity: .85; } 100% { opacity: 0; transform: scale(1.45); } }
@keyframes team-sheet-rise { from { opacity: 0; transform: translateY(28px) scale(.9); } to { opacity: 1; transform: none; } }
@keyframes team-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes team-blink { 50% { opacity: 0; } }
@keyframes team-sparkle {
  0% { opacity: 0; transform: scale(.2) rotate(0deg); }
  40% { opacity: 1; transform: scale(1.15) rotate(70deg); }
  100% { opacity: 0; transform: scale(.4) rotate(140deg) translateY(-6px); }
}
`,
  script: /* js */ `
var TEAM_PHOTOS = ${JSON.stringify(TEAM_PHOTOS)};
PENS.mount(function (root, d, api) {
  var h = PENS.h, L = d.labels;
  var RM = api.reducedMotion();
  var filter = d.filter || 'all';
  var query = '';
  var onlyIds = d.matchIds ? d.matchIds.slice() : null;
  var byId = {};
  d.team.forEach(function (m) { byId[m.id] = m; });
  var shownCount = null;

  function photo(m) { return TEAM_PHOTOS[m.photo] || ''; }
  function fold(s) { return String(s).normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase(); }
  function matches(m) {
    if (onlyIds && onlyIds.indexOf(m.id) === -1) return false;
    if (filter === 'spanish' && m.spanish === 'no') return false;
    if (filter !== 'all' && filter !== 'spanish' && m.role !== filter) return false;
    var words = fold(query).split(/[^a-z0-9]+/).filter(function (w) { return w.length >= 2; });
    if (!words.length) return true;
    var blob = fold([m.name, m.credential, m.focus].join(' '));
    return words.every(function (w) { return blob.indexOf(w) !== -1; });
  }

  // ---------- reveal on scroll ----------
  var io = null;
  if (!RM && W_IO()) {
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.35 });
  }
  function W_IO() { return typeof window.IntersectionObserver === 'function'; }
  function reveal(el) { if (io) io.observe(el); else el.classList.add('is-in'); }

  // ---------- header: typewriter subtitle ----------
  var subVis = h('span', { 'aria-hidden': 'true' });
  var sub = h('p', { class: 'muted team-sub' }, [h('span', { class: 'sr-only', text: L.sub }), subVis]);
  if (RM) subVis.textContent = L.sub;
  else {
    var caret = h('span', { class: 'team-caret' });
    sub.appendChild(caret);
    var i = 0;
    (function type() {
      i++; subVis.textContent = L.sub.slice(0, i);
      if (i < L.sub.length) setTimeout(type, 25); else setTimeout(function () { caret.remove(); }, 1200);
    })();
  }

  // ---------- search + filters ----------
  var input = h('input', { type: 'search', id: 'team-q', placeholder: L.search, 'aria-label': L.search, autocomplete: 'off', maxlength: '60', enterkeyhint: 'search' });
  input.addEventListener('input', function () { query = input.value; onlyIds = null; draw(); });
  var searchIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  searchIcon.setAttribute('viewBox', '0 0 24 24'); searchIcon.setAttribute('aria-hidden', 'true');
  searchIcon.innerHTML = '<circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>';
  var chips = h('div', { class: 'team-chips', role: 'group', 'aria-label': L.filterGroup });
  ['all', 'md', 'np', 'counsel', 'spanish'].forEach(function (k) {
    chips.appendChild(h('button', { class: 'team-chip', type: 'button', 'data-filter': k, 'aria-pressed': k === filter ? 'true' : 'false', onclick: function () {
      if (filter === k && !onlyIds) return;
      filter = k; onlyIds = null;
      var all = chips.querySelectorAll('.team-chip');
      for (var j = 0; j < all.length; j++) all[j].setAttribute('aria-pressed', all[j].getAttribute('data-filter') === k ? 'true' : 'false');
      draw();
    } }, L.filters[k]));
  });

  // ---------- count-up ----------
  var countNum = h('b', { 'aria-hidden': 'true', text: '0' });
  var countLive = h('span', { class: 'sr-only', role: 'status', 'aria-live': 'polite' });
  var count = h('p', { class: 'team-count' }, [h('span', { 'aria-hidden': 'true', text: L.showing + ' ' }), countNum, countLive]);
  function setCount(n) {
    countLive.textContent = L.showing + ' ' + n;
    var from = shownCount === null ? 0 : shownCount;
    shownCount = n;
    if (RM || from === n || !window.requestAnimationFrame) { countNum.textContent = String(n); return; }
    var t0 = null, dur = 450;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      countNum.textContent = String(Math.round(from + (n - from) * e));
      if (p < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  // ---------- grid ----------
  var grid = h('div', { class: 'team-grid' });
  var empty = h('div', { class: 'team-empty', hidden: true }, [
    h('p', { class: 'muted', text: L.empty }),
    h('button', { class: 'btn secondary', type: 'button', onclick: function () { query = ''; input.value = ''; onlyIds = null; filter = 'all';
      var all = chips.querySelectorAll('.team-chip');
      for (var j = 0; j < all.length; j++) all[j].setAttribute('aria-pressed', all[j].getAttribute('data-filter') === 'all' ? 'true' : 'false');
      draw(); } }, L.showAll)
  ]);
  function face(m, idx) {
    var b = h('button', { class: 'team-face', type: 'button', 'aria-haspopup': 'dialog', 'aria-label': m.name + ', ' + m.credential + '. ' + L.openProfile, onclick: function () { openSheet(m, b); } }, [
      h('span', { class: 'team-ph' }, [
        h('span', { class: 'team-ring', 'aria-hidden': 'true' }),
        h('img', { src: photo(m), alt: '', width: '120', height: '120', loading: 'lazy', decoding: 'async' }),
        m.spanish !== 'no' ? h('span', { class: 'team-es', 'aria-hidden': 'true', text: 'ES' }) : null
      ]),
      h('span', { class: 'team-name', text: m.shortName }),
      h('span', { class: 'team-role', text: m.credential })
    ]);
    var wrap = h('div', { class: 'team-peek', style: '--team-delay:' + ((idx % 6) * 70) + 'ms' }, [b]);
    return wrap;
  }
  function draw() {
    var list = d.team.filter(matches);
    grid.replaceChildren.apply(grid, list.map(face));
    var peeks = grid.querySelectorAll('.team-peek');
    for (var j = 0; j < peeks.length; j++) reveal(peeks[j]);
    empty.hidden = list.length !== 0;
    setCount(list.length);
  }

  // ---------- profile sheet ----------
  var sheetEl = null, opener = null;
  var STAR = '<svg viewBox="0 0 24 24"><path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" fill="currentColor"/></svg>';
  function closeSheet() {
    if (!sheetEl) return;
    sheetEl.remove(); sheetEl = null;
    document.removeEventListener('keydown', onKey, true);
    if (opener && opener.focus) opener.focus();
  }
  function onKey(ev) {
    if (!sheetEl) return;
    if (ev.key === 'Escape') { ev.preventDefault(); closeSheet(); return; }
    if (ev.key === 'Tab') {
      var f = sheetEl.querySelectorAll('button, a[href]');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
      else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
    }
  }
  function openSheet(m, from) {
    closeSheet();
    opener = from || null;
    var big = h('div', { class: 'team-big' }, [h('img', { src: photo(m), alt: '', width: '132', height: '132' })]);
    if (!RM) {
      var spots = [[-6, 8], [118, 2], [126, 92], [-12, 96], [56, -14], [100, 124]];
      spots.forEach(function (p, k) {
        var s = h('span', { class: 'team-spark', 'aria-hidden': 'true', style: 'left:' + p[0] + 'px;top:' + p[1] + 'px;--team-delay:' + (120 + k * 90) + 'ms' });
        s.innerHTML = STAR;
        big.appendChild(s);
        setTimeout(function () { s.classList.add('on'); }, 0);
      });
    }
    var facts = h('dl', { class: 'team-facts' }, [
      h('div', null, [h('dt', { text: L.languages }), h('dd', { text: m.languages.join(', ') })]),
      h('div', null, [h('dt', { text: L.suite }), h('dd', { text: m.suite ? 'Suite ' + m.suite : L.suiteUnknown })]),
      h('div', null, [h('dt', { text: L.since }), h('dd', { text: String(m.joined) })])
    ]);
    var closeBtn = h('button', { class: 'btn', type: 'button', onclick: closeSheet }, L.close);
    var sheet = h('article', { class: 'team-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'team-sheet-title' }, [
      big,
      h('h2', { id: 'team-sheet-title', text: m.name }),
      h('p', { class: 'cred', text: m.credential }),
      h('p', { text: m.focus }),
      facts,
      closeBtn
    ]);
    sheet.addEventListener('click', function (ev) { ev.stopPropagation(); });
    sheetEl = h('div', { class: 'team-backdrop', onclick: closeSheet }, [sheet]);
    document.body.appendChild(sheetEl);
    document.addEventListener('keydown', onKey, true);
    closeBtn.focus();
  }

  // ---------- which suite ----------
  var suites = h('section', { class: 'team-suites', 'aria-labelledby': 'team-suites-title' }, [
    h('h2', { id: 'team-suites-title', text: L.whichSuite }),
    h('p', { class: 'muted', text: d.notes.lead })
  ]);
  d.suites.forEach(function (s, k) {
    var who = s.who.map(function (id) { return byId[id]; }).filter(Boolean);
    var card = h('article', { class: 'team-suite team-fadeup', style: '--team-delay:' + (k * 90) + 'ms' }, [
      h('div', { class: 'kick', text: s.kicker }),
      h('h3', { text: s.title }),
      PENS.list(s.what),
      who.length ? h('div', { class: 'small', style: 'font-weight:800;margin-top:8px', text: L.whoHere }) : null,
      who.length ? h('div', { class: 'team-who' }, who.map(function (m) {
        var b = h('button', { class: 'team-mini', type: 'button', 'aria-haspopup': 'dialog', 'aria-label': m.name + '. ' + L.openProfile, onclick: function () { openSheet(m, b); } }, [
          h('img', { src: photo(m), alt: '', width: '34', height: '34', loading: 'lazy' }), m.shortName
        ]);
        return b;
      })) : null
    ]);
    suites.appendChild(card);
  });
  var notes = h('div', { class: 'team-fadeup' }, [
    h('p', { class: 'small muted', text: d.notes.otherDoors }),
    h('p', { class: 'small muted', text: d.notes.confirm })
  ]);
  suites.appendChild(notes);

  var links = h('div', { class: 'team-links' }, [
    h('p', { class: 'small muted', style: 'margin:0', text: L.schedule }),
    PENS.linkButton(L.call, d.links.phoneHref, ''),
    PENS.linkButton(L.reviews, d.links.reviews, 'ghost'),
    PENS.linkButton(L.providers, d.links.providers, 'ghost')
  ]);

  root.appendChild(h('section', { class: 'team-head' }, [
    h('h1', { text: L.heading }), sub,
    h('div', { class: 'team-search' }, [searchIcon, input]),
    chips, count, grid, empty
  ]));
  root.appendChild(suites);
  root.appendChild(links);
  draw();
  var fades = root.querySelectorAll('.team-fadeup');
  for (var j = 0; j < fades.length; j++) reveal(fades[j]);
});
`,
};
