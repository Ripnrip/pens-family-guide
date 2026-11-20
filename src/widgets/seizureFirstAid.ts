import type { WidgetSource } from "./types.js";

export const seizureFirstAidWidget: WidgetSource = {
  id: "seizure-first-aid",
  title: "Seizure first aid",
  description: "Large seizure timer (warns at 4 minutes, call-911 at 5) plus Stay/Safe/Side first-aid steps.",
  css: /* css */ `
.timer { text-align: center; }
.clock { font-size: 50px; font-weight: 900; font-variant-numeric: tabular-nums; letter-spacing: 1px; line-height: 1; }
.sfa-ring { margin: 6px auto 4px; display: grid; }
.sfa-ring .pm-ring { margin: 0 auto; }
.sfa-mark { display: block; font-size: 12px; font-weight: 800; color: var(--pens-muted); margin-top: 4px; letter-spacing: .5px; }
/* Calm by design: no sparkles or confetti here. The ring sweeps steadily toward 5:00. */
@media (prefers-reduced-motion: no-preference) {
  .timer .pm-ring-bar, .timer .pm-ring-trk { transition: stroke-dashoffset .3s linear, stroke-dasharray .3s linear, opacity .3s ease, stroke .8s ease; }
  .timer.call { animation: pens-pulse 2.8s ease-in-out infinite; }
  .timer { transition: background-color .8s ease, border-color .8s ease; }
}
.timer.warn { background: #FFF1D0; border-color: var(--pens-accent); color: #1D2B36; }
.timer.call { background: var(--pens-urgent-bg); border-color: var(--pens-urgent); border-width: 3px; }
[data-theme="midnight"] .timer.warn { background: #3D3012; color: #FBEFD6; }
.timer .btn { min-width: 120px; font-size: 18px; }
.timer .row { justify-content: center; }
.steps { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); }
.step .kw { font-size: 22px; font-weight: 900; color: var(--pens-primary); letter-spacing: 1px; }
.dont li::marker { content: "✕  "; color: var(--pens-urgent); font-weight: 900; }
`,
  script: /* js */ `
PENS.mount(function (root, d, api) {
  var h = PENS.h, L = d.labels, T = d.timer;
  var startAt = null, iv = null, announced = { warn: false, call: false };
  var clock = h('div', { class: 'clock', 'aria-hidden': 'true', text: '0:00' });
  var srClock = h('span', { class: 'sr-only', role: 'timer', 'aria-live': 'off', text: '0:00' });
  var live = h('div', { class: 'big', role: 'status', 'aria-live': 'assertive', style: 'font-weight:800;min-height:24px' });
  var startBtn = h('button', { class: 'btn', type: 'button' }, ['▶ ', L.start]);
  var resetBtn = h('button', { class: 'btn ghost', type: 'button' }, L.reset);
  var call = PENS.linkButton(L.call911, 'tel:911', 'urgent', { icon: '📞' });
  call.hidden = true;
  var dial = PENS.ring({ size: 210, stroke: 14, max: T.callAt, decorative: true,
    center: h('div', null, [clock, h('span', { class: 'sfa-mark', 'aria-hidden': 'true', text: '/ ' + fmt(T.callAt) })]) });
  var card = h('section', { class: 'card timer', 'aria-label': L.heading }, [
    h('p', { class: 'small muted', text: L.timerHint }), h('div', { class: 'sfa-ring' }, [dial.el]), srClock, live,
    h('div', { class: 'row' }, [startBtn, resetBtn, call])
  ]);

  function fmt(sec) { var m = Math.floor(sec / 60), s = sec % 60; return m + ':' + (s < 10 ? '0' : '') + s; }
  function tick() {
    var ms = Date.now() - startAt, sec = Math.floor(ms / 1000);
    clock.textContent = fmt(sec); srClock.textContent = fmt(sec);
    dial.set(ms / 1000, { now: true });
    if (sec >= T.callAt) {
      dial.tone('urgent');
      card.className = 'card timer call';
      if (call.hidden) { call.hidden = false; PENS.springPop(call, { enter: true }); }
      if (!announced.call) { announced.call = true; live.textContent = L.callNow; }
    } else if (sec >= T.warnAt) {
      dial.tone('warn');
      card.className = 'card timer warn';
      if (!announced.warn) { announced.warn = true; live.textContent = L.warn; }
    }
  }
  startBtn.addEventListener('click', function () {
    if (iv) { clearInterval(iv); iv = null; startBtn.replaceChildren('▶ ', L.start); return; }
    if (!startAt) startAt = Date.now();
    iv = setInterval(tick, 250); tick();
    startBtn.replaceChildren('■ ', L.stop);
  });
  resetBtn.addEventListener('click', function () {
    clearInterval(iv); iv = null; startAt = null; announced = { warn: false, call: false };
    clock.textContent = '0:00'; srClock.textContent = '0:00'; live.textContent = '';
    card.className = 'card timer'; call.hidden = true; startBtn.replaceChildren('▶ ', L.start);
    dial.tone(null); dial.set(0);
  });

  root.appendChild(h('h1', { text: L.heading, style: 'margin-bottom:10px' }));
  root.appendChild(card);
  root.appendChild(h('div', { class: 'steps' }, d.steps.map(function (s) {
    return h('article', { class: 'card step' }, [
      h('div', { class: 'kw' }, [h('span', { 'aria-hidden': 'true', text: s.icon + ' ' }), s.keyword]),
      h('h3', { text: s.title }), PENS.list(s.points)
    ]);
  })));
  root.appendChild(h('section', { class: 'card' }, [h('h2', { text: L.donts }), h('ul', { class: 'dont' }, d.donts.map(function (t) { return h('li', { text: t }); }))]));
  root.appendChild(h('section', { class: 'card', style: 'border-color: var(--pens-urgent)' }, [
    h('h2', { text: L.when911 }), PENS.list(d.call911When),
    h('div', { class: 'row', style: 'margin-top:8px' }, [PENS.linkButton(L.call911, 'tel:911', 'urgent', { icon: '📞' })])
  ]));
  root.appendChild(h('div', { class: 'notice', role: 'note', text: d.actionPlanNote }));
  // Motion: gentle fade-ups only for the guidance so the page stays calm.
  PENS.fadeUp(root.querySelectorAll('.step, .card:not(.timer), .notice'), { step: 90 });
});
`,
};
