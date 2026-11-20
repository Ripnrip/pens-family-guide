import { BLOCKS, FONT_WORDMARK, TOKENS } from "../brand/index.js";
import type { WidgetSource } from "./types.js";

/**
 * "Our questions" card. The family picks a visit type, taps up to 5 curated questions and shows a
 * clean bilingual card ("pass the phone"). Nothing leaves the widget except an optional custom
 * question, which goes through the tool's safety layer and is never stored.
 */
export const questionCardWidget: WidgetSource = {
  id: "question-card",
  title: "Our questions",
  description:
    "Question picker and bilingual 'Our questions' card for a PENS visit: visit-type tabs, tappable suggested questions (up to 5), pass-the-phone language flip, save as image.",
  css: /* css */ `
.qpick h1 { font-size: 22px; }
.qlist { display: grid; gap: 8px; margin: 8px 0 4px; }
.qopt { display: flex; gap: 12px; align-items: center; width: 100%; min-height: 56px; padding: 10px 12px; text-align: left;
  font: inherit; font-size: 16px; font-weight: 700; line-height: 1.35; color: var(--pens-ink); cursor: pointer;
  background: var(--pens-surface); border: 2px solid var(--pens-border); border-radius: 14px; }
.qopt .box { width: 26px; height: 26px; border-radius: 8px; border: 2px solid var(--pens-muted); flex: none; display: grid; place-items: center; font-size: 15px; font-weight: 900; color: transparent; }
.qopt[aria-pressed="true"] { border-color: var(--pens-primary); background: var(--pens-chip); }
.qopt[aria-pressed="true"] .box { background: var(--pens-primary); border-color: var(--pens-primary); color: var(--pens-primary-ink); }
.qopt[disabled] { opacity: .5; cursor: not-allowed; }
.qcount { font-weight: 800; }
.qcustom { display: flex; gap: 8px; margin-top: 6px; }
.qcustom input { flex: 1; min-width: 0; min-height: 44px; padding: 8px 12px; font: inherit; color: var(--pens-ink); background: var(--pens-surface); border: 2px solid var(--pens-border); border-radius: 12px; }
.qactions { position: sticky; bottom: 0; padding: 10px 0 2px; background: linear-gradient(180deg, transparent, var(--pens-bg) 35%); }
.qactions .btn { width: 100%; font-size: 18px; min-height: 52px; }
.qflipwrap { perspective: 1400px; }
.qcard { background: ${BLOCKS.cream}; color: ${TOKENS.ink}; border-radius: 22px; padding: 22px 18px 18px; border: 1px solid #EADFC8; box-shadow: var(--pens-shadow); margin-bottom: var(--pens-gap); transform-style: preserve-3d; backface-visibility: hidden; }
[data-theme="midnight"] .qcard { border-color: #3A4677; }
.qcard .qhead { text-align: center; margin-bottom: 14px; }
.qcard .qhead img { width: 104px; height: 104px; display: block; margin: 0 auto 4px; }
.qcard .qword { font-family: ${FONT_WORDMARK}; font-size: 15px; letter-spacing: .04em; text-transform: uppercase; color: ${TOKENS.ink}; line-height: 1.25; }
.qcard h1 { font-size: 28px; color: ${TOKENS.teal}; margin: 10px 0 0; }
.qcard .qsub { font-size: 17px; font-weight: 700; color: #4A5B68; }
.qcard .qvisit { display: inline-block; margin-top: 8px; padding: 3px 12px; border-radius: 999px; background: #FFFFFF; border: 1px solid #EADFC8; font-size: 14px; font-weight: 800; color: ${TOKENS.ink}; }
.qcard ol { list-style: none; padding: 0; margin: 0; display: grid; gap: 12px; }
.qcard li { display: flex; gap: 12px; align-items: flex-start; margin: 0; padding: 12px; background: #FFFFFF; border-radius: 16px; border: 1px solid #EADFC8; }
.qcard .q1 { font-size: 22px; font-weight: 800; line-height: 1.3; color: ${TOKENS.ink}; }
.qcard .q2 { font-size: 17px; line-height: 1.35; color: #4A5B68; margin-top: 4px; }
.qcard .dot { width: 34px; height: 34px; font-size: 17px; border-radius: 10px; margin-top: 1px; }
.qcard .qfoot { text-align: center; font-size: 12px; color: #4A5B68; margin-top: 14px; }
.qtools { display: grid; gap: 8px; grid-template-columns: 1fr 1fr; }
.qtools .wide { grid-column: 1 / -1; }
.shot { position: fixed; inset: 0; z-index: 20; background: ${BLOCKS.cream}; color: ${TOKENS.ink}; overflow: auto; padding: 12px; text-align: center; }
.shot img { max-width: 100%; height: auto; display: block; margin: 0 auto 10px; border-radius: 12px; }
.shot .btn { background: ${TOKENS.teal}; color: #FFFFFF; }
@media (prefers-reduced-motion: no-preference) {
  .qopt { transition: background-color .18s ease, border-color .18s ease, transform .12s ease; }
  .qopt:active:not([disabled]) { transform: scale(.985); }
  .qopt .box { transition: background-color .18s ease, border-color .18s ease, color .18s ease, transform .2s cubic-bezier(.2,.9,.3,1.4); }
  .qopt[aria-pressed="true"] .box { transform: scale(1.08); }
  .qcard.flip-out { animation: q-flip-out .22s ease-in both; }
  .qcard.flip-in { animation: q-flip-in .3s cubic-bezier(.2,.7,.2,1) both; }
  .shot { animation: pens-rise .3s ease both; }
}
@keyframes q-flip-out { from { transform: rotateY(0); opacity: 1; } to { transform: rotateY(88deg); opacity: .2; } }
@keyframes q-flip-in { from { transform: rotateY(-88deg); opacity: .2; } to { transform: rotateY(0); opacity: 1; } }
`,
  script: /* js */ `
PENS.mount(function (root, d, api) {
  var h = PENS.h, L = d.labels, MAX = d.limits.max;
  var saved = api.widgetState() || {};
  var type = saved.qType || d.visitType;
  if (!d.sets[type]) type = d.visitType;
  var sel = (saved.qSel && saved.qSel.length ? saved.qSel : d.selected || []).slice(0, MAX);
  var custom = saved.qCustom || d.custom || '';
  var first = saved.qFirst === 'en' || saved.qFirst === 'es' ? saved.qFirst : d.lang;
  var view = saved.qView || (sel.length || custom ? 'card' : 'pick');
  var box = h('div');
  root.appendChild(box);

  function persist() {
    var s = api.widgetState() || {};
    var next = {};
    for (var k in s) if (Object.prototype.hasOwnProperty.call(s, k)) next[k] = s[k];
    next.qType = type; next.qSel = sel; next.qCustom = custom; next.qFirst = first; next.qView = view;
    api.setWidgetState(next);
  }
  function total() { return sel.length + (custom ? 1 : 0); }
  function findQ(id) {
    for (var t in d.sets) for (var i = 0; i < d.sets[t].length; i++) if (d.sets[t][i].id === id) return d.sets[t][i];
    return null;
  }
  function visitTitle(lang) {
    for (var i = 0; i < d.visitTypes.length; i++) if (d.visitTypes[i].type === type) return d.visitTypes[i].title[lang];
    return '';
  }
  function chosen() { return sel.map(findQ).filter(Boolean); }

  // ---------- Step 1: pick ----------
  function drawPick() {
    view = 'pick'; persist();
    var count = h('span', { class: 'qcount', role: 'status' });
    var show = h('button', { class: 'btn accent', type: 'button', onclick: function () { if (total()) drawCard(true); else api.toast(L.empty); } }, L.show);
    var msg = h('p', { class: 'small', role: 'status', 'aria-live': 'polite' });
    var listEl = h('div', { class: 'qlist' });

    function sync() {
      count.textContent = total() + ' ' + L.of + ' ' + MAX + ' ' + L.picked;
      show.disabled = total() === 0;
      var opts = listEl.querySelectorAll('.qopt');
      for (var i = 0; i < opts.length; i++) {
        var on = opts[i].getAttribute('aria-pressed') === 'true';
        opts[i].disabled = !on && total() >= MAX;
      }
    }
    function drawList() {
      var items = d.sets[type].map(function (q) {
        var on = sel.indexOf(q.id) !== -1;
        var b = h('button', { class: 'qopt', type: 'button', 'aria-pressed': on ? 'true' : 'false' }, [
          h('span', { class: 'box', 'aria-hidden': 'true', text: '✓' }), h('span', { text: q[d.lang] })
        ]);
        b.addEventListener('click', function () {
          var i = sel.indexOf(q.id);
          if (i !== -1) sel.splice(i, 1);
          else if (total() < MAX) sel.push(q.id);
          else { api.toast(L.maxReached); return; }
          b.setAttribute('aria-pressed', sel.indexOf(q.id) !== -1 ? 'true' : 'false');
          persist(); sync();
        });
        return b;
      });
      PENS.swap(listEl, items);
      sync();
    }
    var tabs = h('div', { class: 'tabs', role: 'tablist', 'aria-label': L.visitType });
    function drawTabs() {
      tabs.replaceChildren.apply(tabs, d.visitTypes.map(function (t) {
        return h('button', { class: 'btn tab', role: 'tab', type: 'button', 'aria-selected': t.type === type ? 'true' : 'false', onclick: function () {
          if (t.type === type) return;
          type = t.type; sel = []; persist(); drawTabs(); drawList();
        } }, [t.title[d.lang]]);
      }));
    }

    var input = h('input', { type: 'text', id: 'q-custom', maxlength: String(d.limits.customMax), autocomplete: 'off', 'aria-describedby': 'q-custom-hint' });
    var customRow = h('div');
    function drawCustom() {
      if (custom) {
        customRow.replaceChildren(h('div', { class: 'qopt', style: 'cursor:default' }, [
          h('span', { class: 'dot b4', 'aria-hidden': 'true', text: '+' }),
          h('span', { style: 'flex:1' }, [h('span', { class: 'small muted', text: L.yours }), h('br'), custom]),
          h('button', { class: 'btn ghost', type: 'button', onclick: function () { custom = ''; persist(); drawCustom(); sync(); } }, L.customRemove)
        ]));
        return;
      }
      var add = h('button', { class: 'btn secondary', type: 'button' }, L.customAdd);
      add.addEventListener('click', function () {
        var text = String(input.value || '').trim();
        if (!text) return;
        if (total() >= MAX) { api.toast(L.maxReached); return; }
        add.disabled = true; msg.textContent = '';
        api.callTool('visit_questions', { visit_type: type, custom_question: text, lang: d.lang }).then(function (res) {
          var sc = res && (res.structuredContent || res.structured_content);
          add.disabled = false;
          if (sc && sc.customStatus === 'ok' && sc.custom) { custom = sc.custom; input.value = ''; persist(); drawCustom(); sync(); }
          else { msg.textContent = L.customRemoved; input.value = ''; }
        }).catch(function () { add.disabled = false; msg.textContent = L.customUnavailable; });
      });
      customRow.replaceChildren(
        h('label', { class: 'small', for: 'q-custom', style: 'font-weight:800;display:block;margin-top:10px', text: L.customLabel }),
        h('div', { class: 'qcustom' }, [input, add]),
        h('p', { class: 'small muted', id: 'q-custom-hint', style: 'margin-top:4px', text: L.customHint })
      );
    }

    PENS.swap(box, [
      h('section', { class: 'card qpick' }, [
        h('h1', { text: L.heading }),
        h('p', { class: 'muted', text: L.intro }),
        tabs,
        h('div', { class: 'row', style: 'justify-content:space-between' }, [h('h2', { text: L.suggested, style: 'margin:0' }), count]),
        listEl, customRow, msg
      ]),
      h('div', { class: 'qactions' }, [show])
    ]);
    drawTabs(); drawList(); drawCustom(); sync();
  }

  // ---------- Step 2: the card ----------
  function cardBody() {
    var a = first, b = first === 'en' ? 'es' : 'en';
    var A = d.cardLabels[a], B = d.cardLabels[b];
    var n = 0;
    var items = chosen().map(function (q) {
      var k = n++ % 5;
      return h('li', null, [h('span', { class: 'dot b' + k, 'aria-hidden': 'true', text: String(n) }), h('div', null, [
        h('div', { class: 'q1', lang: a, text: q[a] }), h('div', { class: 'q2', lang: b, text: q[b] })
      ])]);
    });
    if (custom) {
      var k2 = n++ % 5;
      items.push(h('li', null, [h('span', { class: 'dot b' + k2, 'aria-hidden': 'true', text: String(n) }), h('div', null, [
        h('div', { class: 'q1', text: custom }), h('div', { class: 'q2', text: A.ownWords + ' · ' + B.ownWords })
      ])]));
    }
    return [
      h('div', { class: 'qhead' }, [
        PENS.brand.logo ? h('img', { src: PENS.brand.logo, alt: 'PENS', width: '104', height: '104' }) : null,
        h('div', { class: 'qword', text: d.clinic.name }),
        h('h1', { lang: a, text: A.cardTitle }),
        h('div', { class: 'qsub', lang: b, text: B.cardTitle }),
        h('div', { class: 'qvisit' }, [h('span', { lang: a, text: visitTitle(a) }), visitTitle(a) !== visitTitle(b) ? ' · ' : null, visitTitle(a) !== visitTitle(b) ? h('span', { lang: b, text: visitTitle(b) }) : null])
      ]),
      h('ol', null, items),
      h('div', { class: 'qfoot' }, [h('div', { lang: a, text: A.footer }), h('div', { lang: b, text: B.footer }), h('div', { text: 'PENS · ' + d.clinic.phone })])
    ];
  }

  function wrapText(ctx, text, maxW) {
    var words = String(text).split(' '), lines = [], line = '';
    for (var i = 0; i < words.length; i++) {
      var t = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = words[i]; } else line = t;
    }
    if (line) lines.push(line);
    return lines;
  }
  /** Draw the card to a canvas and hand back a PNG data URL (logo is optional: it is skipped if it cannot be drawn). */
  function renderImage(done) {
    var a = first, b = first === 'en' ? 'es' : 'en';
    var A = d.cardLabels[a], B = d.cardLabels[b];
    var Wd = 1080, pad = 72, inner = Wd - pad * 2;
    var FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
    var SERIF = 'Georgia, "Times New Roman", serif';
    var COLORS = [['${BLOCKS.redDeep}', '#FFFFFF'], ['${BLOCKS.blueDeep}', '#FFFFFF'], ['${BLOCKS.yellow}', '${TOKENS.ink}'], ['${BLOCKS.green}', '${TOKENS.ink}'], ['${BLOCKS.orange}', '${TOKENS.ink}']];
    var rows = chosen().map(function (q) { return [q[a], q[b]]; });
    if (custom) rows.push([custom, A.ownWords + ' · ' + B.ownWords]);
    function paint(logo) {
      var c = document.createElement('canvas');
      var ctx = c.getContext('2d');
      if (!ctx) { done(null); return; }
      var textW = inner - 150;
      var laid = rows.map(function (r) {
        ctx.font = '800 46px ' + FONT; var l1 = wrapText(ctx, r[0], textW);
        ctx.font = '400 34px ' + FONT; var l2 = wrapText(ctx, r[1], textW);
        return { l1: l1, l2: l2, hgt: 56 + l1.length * 58 + 10 + l2.length * 44 };
      });
      var H = 560, i;
      for (i = 0; i < laid.length; i++) H += laid[i].hgt + 28;
      H += 190;
      c.width = Wd; c.height = H;
      ctx.fillStyle = '${BLOCKS.cream}'; ctx.fillRect(0, 0, Wd, H);
      if (logo) { try { ctx.drawImage(logo, (Wd - 240) / 2, 48, 240, 240); } catch (e) {} }
      ctx.textAlign = 'center'; ctx.fillStyle = '${TOKENS.ink}';
      ctx.font = '400 34px ' + SERIF; ctx.fillText(String(d.clinic.name).toUpperCase(), Wd / 2, 340);
      ctx.fillStyle = '${TOKENS.teal}'; ctx.font = '800 68px ' + FONT; ctx.fillText(A.cardTitle, Wd / 2, 430);
      ctx.fillStyle = '#4A5B68'; ctx.font = '700 40px ' + FONT; ctx.fillText(B.cardTitle, Wd / 2, 486);
      var vt = visitTitle(a) === visitTitle(b) ? visitTitle(a) : visitTitle(a) + ' · ' + visitTitle(b);
      ctx.font = '700 30px ' + FONT; ctx.fillStyle = '${TOKENS.ink}'; ctx.fillText(vt, Wd / 2, 534);
      var y = 570;
      ctx.textAlign = 'left';
      for (i = 0; i < laid.length; i++) {
        var r = laid[i];
        ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#EADFC8'; ctx.lineWidth = 2;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(pad, y, inner, r.hgt, 28); else ctx.rect(pad, y, inner, r.hgt);
        ctx.fill(); ctx.stroke();
        var col = COLORS[i % 5];
        ctx.fillStyle = col[0]; ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(pad + 28, y + 30, 72, 72, 18); else ctx.rect(pad + 28, y + 30, 72, 72);
        ctx.fill();
        ctx.fillStyle = col[1]; ctx.font = '900 40px ' + FONT; ctx.textAlign = 'center'; ctx.fillText(String(i + 1), pad + 64, y + 80); ctx.textAlign = 'left';
        var ty = y + 74, j;
        ctx.fillStyle = '${TOKENS.ink}'; ctx.font = '800 46px ' + FONT;
        for (j = 0; j < r.l1.length; j++) { ctx.fillText(r.l1[j], pad + 128, ty); ty += 58; }
        ty += 0; ctx.fillStyle = '#4A5B68'; ctx.font = '400 34px ' + FONT;
        for (j = 0; j < r.l2.length; j++) { ctx.fillText(r.l2[j], pad + 128, ty); ty += 44; }
        y += r.hgt + 28;
      }
      ctx.textAlign = 'center'; ctx.fillStyle = '#4A5B68'; ctx.font = '400 26px ' + FONT;
      ctx.fillText(A.footer, Wd / 2, y + 40); ctx.fillText(B.footer, Wd / 2, y + 78);
      ctx.font = '700 30px ' + FONT; ctx.fillStyle = '${TOKENS.teal}'; ctx.fillText('PENS · ' + d.clinic.phone, Wd / 2, y + 130);
      var url = null;
      try { url = c.toDataURL('image/png'); } catch (e) { url = null; }
      done(url);
    }
    if (!PENS.brand.logo) { paint(null); return; }
    var img = new Image();
    var settled = false;
    function once(v) { if (!settled) { settled = true; paint(v); } }
    img.onload = function () { once(img); };
    img.onerror = function () { once(null); };
    setTimeout(function () { once(null); }, 2500);
    img.src = PENS.brand.logo;
  }

  var overlay = null;
  function closeShot() { if (overlay) { overlay.remove(); overlay = null; } }
  /** Full-screen view for hosts where a download is not possible: the family takes a screenshot. */
  function showShot(url) {
    closeShot();
    overlay = h('div', { class: 'shot', role: 'dialog', 'aria-modal': 'true', 'aria-label': L.full }, [
      h('p', { style: 'font-weight:800', text: L.screenshotHint }),
      url ? h('img', { src: url, alt: d.cardLabels[first].cardTitle }) : null,
      h('button', { class: 'btn', type: 'button', onclick: closeShot }, L.close)
    ]);
    document.body.appendChild(overlay);
    var btn = overlay.querySelector('button'); if (btn) btn.focus();
    if (api.canRequestDisplayMode() && api.displayMode() !== 'fullscreen') { try { api.requestDisplayMode('fullscreen'); } catch (e) {} }
  }
  function saveImage() {
    renderImage(function (url) {
      if (!url) { showShot(null); return; }
      if (api.canDownload()) {
        try {
          var a = h('a', { href: url, download: 'pens-our-questions.png' });
          document.body.appendChild(a); a.click(); a.remove();
          api.toast(L.saved);
          return;
        } catch (e) {}
      }
      showShot(url);
    });
  }

  function drawCard(enter) {
    view = 'card'; persist();
    var card = h('section', { class: 'qcard', 'aria-live': 'polite' }, cardBody());
    var flipBtn = h('button', { class: 'btn wide', type: 'button' }, [h('span', { 'aria-hidden': 'true', text: '🔄 ' }), h('span')]);
    function flipLabel() { flipBtn.lastChild.textContent = first === d.lang ? L.flip : L.flipBack; }
    flipLabel();
    flipBtn.addEventListener('click', function () {
      first = first === 'en' ? 'es' : 'en';
      persist(); flipLabel();
      function fill() { card.replaceChildren.apply(card, cardBody()); }
      if (api.reducedMotion()) { fill(); return; }
      card.classList.remove('flip-in'); card.classList.add('flip-out');
      setTimeout(function () {
        fill(); card.classList.remove('flip-out'); card.classList.add('flip-in');
      }, 220);
    });
    var content = [
      h('div', { class: 'qflipwrap' }, [card]),
      h('div', { class: 'qtools' }, [
        flipBtn,
        h('button', { class: 'btn secondary', type: 'button', onclick: saveImage }, [h('span', { 'aria-hidden': 'true', text: '⬇ ' }), L.save]),
        h('button', { class: 'btn ghost', type: 'button', onclick: function () { drawPick(); } }, [h('span', { 'aria-hidden': 'true', text: '✎ ' }), L.edit])
      ])
    ];
    if (enter) PENS.swap(box, content); else box.replaceChildren.apply(box, content);
  }

  if (view === 'card' && total()) drawCard(false); else drawPick();
});
`,
};
