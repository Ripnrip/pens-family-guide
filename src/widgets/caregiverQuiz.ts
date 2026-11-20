import type { WidgetSource } from "./types.js";

export const caregiverQuizWidget: WidgetSource = {
  id: "caregiver-quiz",
  title: "Seizure-Ready quiz",
  description: "5-question seizure first-aid quiz with colorful answer tiles and a final score.",
  css: /* css */ `
.quiz { text-align: center; }
.quiz .q { font-size: 20px; font-weight: 800; margin: 8px 0 14px; }
.tiles { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
@media (max-width: 420px) { .tiles { grid-template-columns: 1fr; } }
.tile { min-height: 72px; border: 3px solid transparent; border-radius: 14px; padding: 10px 12px; font: inherit; font-weight: 800; font-size: 16px; cursor: pointer; display: flex; align-items: center; gap: 10px; text-align: left; color: #FFF; }
.tile .shape { font-size: 22px; flex: none; }
/* Block accents from the PENS logo; each fill/text pair is 4.5:1 or better. */
.t0 { background: var(--pens-b-red); } .t1 { background: var(--pens-b-blue); } .t2 { background: var(--pens-b-yellow); color: #1D2B36; } .t3 { background: var(--pens-b-green); color: #1D2B36; }
.tile[disabled] { cursor: default; }
.tile.dim { opacity: .35; }
.tile.right { border-color: var(--pens-ink); box-shadow: 0 0 0 3px var(--pens-accent); opacity: 1; }
.tile.right.picked { box-shadow: 0 0 0 4px var(--pens-success); }
.tile { position: relative; }
.tile .verdict { margin-left: auto; font-size: 20px; flex: none; }
.quiz-ring { display: flex; justify-content: center; margin: 6px 0 10px; }
.quiz-ring .score { font-size: 34px; font-weight: 600; color: var(--pens-primary); }
@media (prefers-reduced-motion: no-preference) {
  .tile { transition: transform .35s cubic-bezier(.2,.9,.3,1.6), opacity .25s ease, box-shadow .25s ease, filter .12s ease; }
  .tile:active:not([disabled]) { transform: scale(.94); transition-duration: .08s; }
  .tile.dim { transition-delay: .15s; }
  .hero { display: inline-block; animation: pm-pop-in .6s cubic-bezier(.2,.9,.3,1.25) backwards; }
}
.feedback { margin-top: 12px; font-size: 16px; min-height: 48px; }
.bar { height: 8px; border-radius: 999px; background: var(--pens-chip); overflow: hidden; margin-bottom: 8px; }
.bar > div { height: 100%; background: var(--pens-accent); transition: width .3s; }

.hero { font-size: 44px; }
`,
  script: /* js */ `
PENS.mount(function (root, d, api) {
  var h = PENS.h, L = d.labels, Q = d.questions;
  var SHAPES = ['▲', '◆', '●', '■'];
  var i = 0, score = 0;
  var box = h('section', { class: 'card quiz', 'aria-live': 'polite' });
  root.appendChild(box);

  function intro() {
    var title = h('h1', { text: d.title });
    box.replaceChildren(
      h('div', { class: 'hero', 'aria-hidden': 'true', text: '⚡🧠💛' }),
      title,
      h('p', { class: 'muted', text: Q.length + ' ' + L.question.toLowerCase() + (Q.length > 1 ? 's' : '') }),
      h('button', { class: 'btn accent', type: 'button', style: 'font-size:20px;min-width:180px', onclick: function () { i = 0; score = 0; ask(); } }, L.start)
    );
    PENS.typewriter(title, d.title);
    PENS.springPop(box.querySelector('.btn'), { enter: true, delay: 250 });
  }

  function ask() {
    var q = Q[i];
    var fb = h('div', { class: 'feedback', role: 'status' });
    var next = h('button', { class: 'btn', type: 'button', hidden: true, onclick: function () { i++; if (i < Q.length) ask(); else done(); } }, i === Q.length - 1 ? L.finish : L.next);
    var tiles = q.answers.map(function (a, k) {
      return h('button', { class: 'tile t' + k, type: 'button', 'aria-label': SHAPES[k] + ' ' + a }, [h('span', { class: 'shape', 'aria-hidden': 'true', text: SHAPES[k] }), h('span', { text: a })]);
    });
    tiles.forEach(function (t, k) {
      t.addEventListener('click', function () {
        var ok = k === q.correctIndex;
        if (ok) score++;
        tiles.forEach(function (x, j) { x.disabled = true; x.classList.add(j === q.correctIndex ? 'right' : 'dim'); });
        t.classList.add('picked');
        var right = tiles[q.correctIndex];
        right.appendChild(h('span', { class: 'verdict', 'aria-hidden': 'true', text: '✓' }));
        if (ok) { PENS.springPop(t); PENS.sparkle(t, { count: 7 }); }
        else { PENS.shake(t); PENS.springPop(right); }
        var why = h('span');
        fb.replaceChildren(h('strong', { text: (ok ? '✅ ' + L.correct : '💡 ' + L.incorrect) + ' ' }), why);
        PENS.typewriter(why, q.explain);
        next.hidden = false; next.focus();
        api.setWidgetState({ index: i, score: score });
      });
    });
    var prompt = h('div', { class: 'q' });
    PENS.swap(box, [
      h('div', { class: 'bar', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(Q.length), 'aria-valuenow': String(i + 1), 'aria-label': L.question + ' ' + (i + 1) + ' ' + L.of + ' ' + Q.length }, [h('div', { style: 'width:' + Math.round(100 * (i + 1) / Q.length) + '%' })]),
      h('div', { class: 'small muted', text: L.question + ' ' + (i + 1) + ' ' + L.of + ' ' + Q.length }),
      prompt,
      h('div', { class: 'tiles' }, tiles),
      fb,
      next
    ]);
    PENS.typewriter(prompt, q.prompt);
    PENS.springPop(tiles, { enter: true, delay: 120, step: 60 });
    tiles[0].focus();
  }

  function done() {
    api.setWidgetState({ index: Q.length, score: score, finished: true });
    var dial = PENS.ring({
      size: 150, stroke: 14, max: Q.length, value: score, className: 'quiz-score',
      center: h('div', { class: 'score', 'aria-hidden': 'true', text: '0 / ' + Q.length }),
      ariaLabel: L.score, valueText: function (n) { return n + ' / ' + Q.length; }
    });
    if (score === Q.length) dial.tone('success');
    box.replaceChildren(
      h('div', { class: 'hero', 'aria-hidden': 'true', text: score === Q.length ? '🏆' : '🌟' }),
      h('h2', { text: L.score }),
      h('div', { class: 'quiz-ring' }, [dial.el]),
      h('p', { class: 'sr-only', text: score + ' / ' + Q.length }),
      h('p', { text: score === Q.length ? L.perfect : L.good }),
      h('div', { class: 'row', style: 'justify-content:center' }, [
        h('button', { class: 'btn accent', type: 'button', onclick: function () { i = 0; score = 0; ask(); } }, L.again),
        h('button', { class: 'btn secondary', type: 'button', onclick: function () { api.sendFollowUp(L.learnMore); } }, L.learnMore)
      ])
    );
    // Score ring sweeps in while the number counts up; a perfect score gets a sparkle burst.
    var scoreEl = box.querySelector('.score');
    PENS.countUp(scoreEl, score, { from: 0, dur: 900, fmt: function (n) { return n + ' / ' + Q.length; } });
    PENS.springPop(box.querySelectorAll('.row .btn'), { enter: true, delay: 450, step: 80 });
    if (score === Q.length) setTimeout(function () { PENS.sparkle(dial.el, { count: 8 }); }, 700);
  }

  intro();
});
`,
};
