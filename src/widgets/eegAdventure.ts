import type { WidgetSource } from "./types.js";

/** "My EEG Day" kids' story game starring Pip, the PENS helper (original character, drawn in src/brand). */
export const eegAdventureWidget: WidgetSource = {
  id: "eeg-adventure",
  title: "My EEG Day",
  description: "Interactive kids' story about getting an EEG with Pip, the PENS helper: scenes, a hold-still game and a breathing exercise.",
  css: /* css */ `
.game { background: linear-gradient(180deg, #DDF1F4 0%, #FFF6E0 100%); color: #1D2B36; border-radius: 20px; padding: 16px; position: relative; overflow: hidden; }
[data-theme="midnight"] .game { background: linear-gradient(180deg, #1D2647 0%, #2A3560 100%); color: #EEF0FF; }
.game h2 { font-size: 22px; text-align: center; margin: 4px 0 6px; }
.game p.say { font-size: 18px; line-height: 1.55; text-align: center; max-width: 560px; margin: 0 auto 10px; }
.stage { display: grid; place-items: center; min-height: 170px; cursor: pointer; border-radius: 16px; }
.stage:focus-visible { outline: 3px solid var(--pens-focus); }
.pip-stage { width: 150px; height: 150px; display: grid; place-items: center; }
.pip-stage svg { width: 150px; height: 150px; display: block; }
.dots { display: flex; justify-content: center; gap: 6px; margin: 4px 0 10px; }
.dots span { width: 10px; height: 10px; border-radius: 50%; background: rgba(15,110,116,.25); }
.dots span.on { background: #0F6E74; }
[data-theme="midnight"] .dots span { background: rgba(255,255,255,.25); } [data-theme="midnight"] .dots span.on { background: #F4C76B; }
.nav { display: flex; justify-content: space-between; gap: 8px; margin-top: 10px; }
.nav .btn { min-width: 120px; font-size: 17px; }
.play { display: grid; place-items: center; gap: 10px; margin: 6px 0; }
.star { width: 120px; height: 120px; border-radius: 50%; border: 4px solid #F6B93B; background: #FFF; display: grid; place-items: center; font-size: 56px; cursor: pointer; touch-action: none; user-select: none; -webkit-user-select: none; position: relative; color: #1D2B36; }
.star.holding { background: #FFE7A8; }
.meter { width: min(320px, 90%); height: 18px; background: rgba(0,0,0,.08); border-radius: 999px; overflow: hidden; }
[data-theme="midnight"] .meter { background: rgba(255,255,255,.15); }
.meter > div { height: 100%; width: 0; background: linear-gradient(90deg, #F6B93B, #0F6E74); }
.breath { width: 140px; height: 140px; border-radius: 50%; background: radial-gradient(circle, #FFE7A8 0%, #F6B93B 60%, rgba(246,185,59,.2) 100%); transform: scale(.6); display: grid; place-items: center; font-weight: 900; color: #1D2B36; font-size: 20px; will-change: transform; }
.pip-stage { transform-origin: 50% 92%; }
.pip-sticker { transform-box: fill-box; transform-origin: center; }
.star { transition: background-color .2s ease; }
/* Motion (eeg-*): Pip bounces in, stickers pop on with a squash, breathing orb loops smoothly. Off under reduced motion. */
@media (prefers-reduced-motion: no-preference) {
  .pip-stage.eeg-bounce { animation: eeg-bounce-in .75s cubic-bezier(.3,.7,.3,1) backwards; }
  .pip-sticker.eeg-pop { animation: eeg-squash .5s cubic-bezier(.3,.8,.3,1.2) backwards; animation-delay: var(--pm-delay, 0ms); }
  .breath.idle { animation: eeg-breathe-idle 3.2s ease-in-out infinite; }
  .breath.go { animation: eeg-breathe 8s ease-in-out infinite; }
  .star.holding { animation: eeg-hold 1.6s ease-in-out infinite; }
  .dots span { transition: background-color .3s ease, transform .3s ease; }
  .dots span.now { transform: scale(1.35); }
}
@keyframes eeg-bounce-in {
  0% { opacity: 0; transform: translateY(-46px) scale(.82, 1.12); }
  42% { opacity: 1; transform: translateY(0) scale(1.14, .84); }
  62% { transform: translateY(-12px) scale(.95, 1.06); }
  80% { transform: translateY(0) scale(1.05, .95); }
  100% { opacity: 1; transform: none; }
}
@keyframes eeg-squash {
  0% { transform: scale(0); }
  50% { transform: scale(1.4, .62); }
  75% { transform: scale(.86, 1.14); }
  100% { transform: scale(1); }
}
@keyframes eeg-breathe { 0%, 100% { transform: scale(.6); } 50% { transform: scale(1); } }
@keyframes eeg-breathe-idle { 0%, 100% { transform: scale(.6); } 50% { transform: scale(.66); } }
@keyframes eeg-hold { 0%, 100% { box-shadow: 0 0 0 0 rgba(246,185,59,.55); } 50% { box-shadow: 0 0 0 12px rgba(246,185,59,0); } }
.big { font-size: 20px; font-weight: 800; text-align: center; min-height: 30px; }
.grown { font-size: 12px; opacity: .85; text-align: center; margin-top: 10px; }
.fs { position: absolute; top: 10px; right: 10px; min-height: 44px; }
.confetti { font-size: 34px; text-align: center; letter-spacing: 6px; }
`,
  script: /* js */ `
PENS.mount(function (root, d, api) {
  var h = PENS.h, L = d.labels, scenes = d.scenes;
  var saved = api.widgetState() || {};
  var idx = Math.min(saved.scene || 0, scenes.length - 1);
  var timers = [];
  var shownIdx = -1;
  // EEG stickers (electrodes) sit on Pip's head from the "sticker hat" scene until the last scene.
  var stickerFrom = -1, finishAt = scenes.length - 1;
  scenes.forEach(function (s, k) { if (s.id === 'eeg-stickers') stickerFrom = k; if (s.kind === 'finish') finishAt = k; });
  var STICKERS = [[46, 64, '#D9412B'], [60, 50, '#2F6DB5'], [77, 44, '#F6B93B'], [99, 50, '#5FB36A'], [113, 64, '#F08A24']];
  function addStickers(holder, animate) {
    var g = holder.querySelector('.pip-bob');
    if (!g) return;
    STICKERS.forEach(function (s, k) {
      g.appendChild(PENS.motion.svg('circle', { class: 'pip-sticker' + (animate ? ' eeg-pop' : ''), cx: s[0], cy: s[1], r: 6.5, fill: s[2], stroke: '#FFFFFF', 'stroke-width': 2.5,
        style: '--pm-delay:' + (450 + k * 140) + 'ms' }));
    });
  }
  function clearTimers() { timers.forEach(function (t) { clearTimeout(t); clearInterval(t); }); timers = []; }

  function pip(mood) {
    var holder = h('div', { class: 'pip-stage' });
    // Trusted, server-generated brand markup (src/brand/pipSvg), never tool data.
    holder.innerHTML = PENS.brand.pip[mood] || PENS.brand.pip.happy;
    var svg = holder.querySelector('svg');
    if (svg) svg.setAttribute('aria-label', d.character);
    if (stickerFrom !== -1 && idx >= stickerFrom && idx < finishAt) addStickers(holder, idx === stickerFrom && shownIdx !== idx);
    return holder;
  }

  var wrap = h('section', { class: 'game', 'aria-roledescription': 'story', 'aria-label': d.character });
  root.appendChild(wrap);

  function go(n) {
    idx = Math.max(0, Math.min(scenes.length - 1, n));
    var st = api.widgetState() || {};
    api.setWidgetState(Object.assign({}, st, { scene: idx }));
    draw();
    var t = wrap.querySelector('h2'); if (t) t.focus();
  }

  function holdGame() {
    var secs = d.holdSeconds || 10;
    var meter = h('div');
    var msg = h('div', { class: 'big', role: 'status', 'aria-live': 'polite', text: L.holdStar });
    var star = h('button', { class: 'star', type: 'button', 'aria-label': L.holdStar + ' (' + secs + ' ' + L.seconds + ')' }, '⭐');
    var start = 0, raf = null, done = false;
    function tick() {
      var p = Math.min(1, (Date.now() - start) / (secs * 1000));
      meter.style.width = Math.round(p * 100) + '%';
      var left = Math.ceil(secs - p * secs);
      msg.textContent = L.keepHolding + ' ' + left;
      if (p >= 1) { finish(); return; }
      raf = setTimeout(tick, 100); timers.push(raf);
    }
    function begin(e) { if (done) return; if (e) e.preventDefault(); start = Date.now(); star.classList.add('holding'); tick(); }
    function end() {
      if (done || !start) return;
      clearTimeout(raf); start = 0; star.classList.remove('holding');
      meter.style.width = '0%'; msg.textContent = L.oops;
    }
    function finish() {
      done = true; clearTimeout(raf); star.classList.remove('holding');
      star.textContent = '🌟'; msg.textContent = L.heldIt;
      var cf = h('div', { class: 'confetti', 'aria-hidden': 'true', text: '✨🎉✨' });
      play.appendChild(cf);
      PENS.springPop(star); PENS.sparkle(star, { count: 8 }); PENS.springPop(cf, { enter: true });
    }
    star.addEventListener('pointerdown', begin);
    star.addEventListener('pointerup', end);
    star.addEventListener('pointerleave', end);
    star.addEventListener('pointercancel', end);
    star.addEventListener('keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && !start && !e.repeat) begin(e); });
    star.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') end(); });
    star.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    var play = h('div', { class: 'play' }, [star, h('div', { class: 'meter', role: 'presentation' }, [meter]), msg]);
    return play;
  }

  function breatheGame() {
    var rounds = d.breathRounds || 3;
    var reduced = api.reducedMotion();
    var orb = h('div', { class: 'breath idle', 'aria-hidden': 'true' });
    var msg = h('div', { class: 'big', role: 'status', 'aria-live': 'polite' });
    var btn = h('button', { class: 'btn accent', type: 'button' }, L.startBreathing);
    btn.addEventListener('click', function () {
      btn.disabled = true;
      var step = 0;
      // One smooth 8 s CSS scale loop (in 4 s, out 4 s) runs across all rounds instead of per-phase jumps.
      orb.classList.remove('idle');
      if (!reduced) { orb.classList.remove('go'); void orb.offsetWidth; orb.classList.add('go'); }
      function phase() {
        if (step >= rounds * 2) {
          orb.classList.remove('go'); orb.classList.add('idle'); orb.textContent = '😊'; msg.textContent = L.breathingDone; btn.disabled = false;
          PENS.sparkle(orb, { count: 6 });
          return;
        }
        var inhale = step % 2 === 0;
        var n = 4;
        msg.textContent = (inhale ? L.breatheIn : L.breatheOut);
        orb.textContent = String(n);
        var iv = setInterval(function () { n--; if (n > 0) orb.textContent = String(n); }, 1000);
        timers.push(iv);
        var t = setTimeout(function () { clearInterval(iv); step++; phase(); }, 4000);
        timers.push(t);
      }
      phase();
    });
    return h('div', { class: 'play' }, [orb, msg, btn]);
  }

  function draw() {
    clearTimers();
    var sc = scenes[idx];
    var kids = [];
    if (api.canRequestDisplayMode() && api.displayMode() !== 'fullscreen') {
      kids.push(h('button', { class: 'btn ghost fs', type: 'button', onclick: function () { api.requestDisplayMode('fullscreen'); } }, ['⤢ ', L.fullscreen]));
    }
    kids.push(h('div', { class: 'dots', 'aria-hidden': 'true' }, scenes.map(function (_, i) { return h('span', { class: (i <= idx ? 'on' : '') + (i === idx ? ' now' : '') }); })));
    var pipEl = pip(sc.mood);
    if (shownIdx !== idx) pipEl.classList.add('eeg-bounce');
    var stage = h('div', { class: 'stage', tabindex: sc.kind === 'story' ? '0' : null, 'aria-label': sc.kind === 'story' ? L.next : null }, [pipEl]);
    if (sc.kind === 'story') {
      stage.addEventListener('click', function () { go(idx + 1); });
      stage.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(idx + 1); } });
    }
    kids.push(stage);
    var title = h('h2', { tabindex: '-1', text: sc.title });
    var say = h('p', { class: 'say', text: sc.text });
    kids.push(title);
    kids.push(say);
    if (sc.kind === 'holdStill') kids.push(holdGame());
    if (sc.kind === 'breathe') kids.push(breatheGame());
    var stars = sc.kind === 'finish' ? h('div', { class: 'confetti', 'aria-hidden': 'true', text: '⭐🌟⭐' }) : null;
    if (stars) kids.push(stars);
    var nav = h('div', { class: 'nav' }, [
      h('button', { class: 'btn ghost', type: 'button', disabled: idx === 0, onclick: function () { go(idx - 1); } }, ['← ', L.back]),
      h('span', { class: 'sr-only', text: (idx + 1) + ' / ' + scenes.length }),
      idx === scenes.length - 1
        ? h('button', { class: 'btn accent', type: 'button', onclick: function () { go(0); } }, ['↺ ', L.restart])
        : h('button', { class: 'btn', type: 'button', onclick: function () { go(idx + 1); } }, [L.next, ' →'])
    ]);
    kids.push(nav);
    kids.push(h('p', { class: 'grown', text: L.forGrownUps }));
    wrap.replaceChildren.apply(wrap, kids);
    var fresh = shownIdx !== idx;
    shownIdx = idx;
    if (fresh) {
      // Scene text types in (screen readers get it once); the last scene throws a confetti party.
      PENS.typewriter(title, sc.title, 30);
      PENS.typewriter(say, sc.text);
      if (stars) {
        PENS.springPop(stars, { enter: true, delay: 300 });
        setTimeout(function () { PENS.confetti(wrap, { count: 36 }); PENS.sparkle(pipEl, { count: 8 }); }, 350);
      }
    }
  }

  draw();
});
`,
};
