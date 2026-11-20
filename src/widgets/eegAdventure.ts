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
.breath { width: 140px; height: 140px; border-radius: 50%; background: radial-gradient(circle, #FFE7A8 0%, #F6B93B 60%, rgba(246,185,59,.2) 100%); transform: scale(.6); transition: transform 4s ease-in-out; display: grid; place-items: center; font-weight: 900; color: #1D2B36; font-size: 20px; }
.breath.in { transform: scale(1); }
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
  function clearTimers() { timers.forEach(function (t) { clearTimeout(t); clearInterval(t); }); timers = []; }

  function pip(mood) {
    var holder = h('div', { class: 'pip-stage' });
    // Trusted, server-generated brand markup (src/brand/pipSvg), never tool data.
    holder.innerHTML = PENS.brand.pip[mood] || PENS.brand.pip.happy;
    var svg = holder.querySelector('svg');
    if (svg) svg.setAttribute('aria-label', d.character);
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
      play.appendChild(h('div', { class: 'confetti', 'aria-hidden': 'true', text: '✨🎉✨' }));
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
    var orb = h('div', { class: 'breath', 'aria-hidden': 'true' });
    var msg = h('div', { class: 'big', role: 'status', 'aria-live': 'polite' });
    var btn = h('button', { class: 'btn accent', type: 'button' }, L.startBreathing);
    btn.addEventListener('click', function () {
      btn.disabled = true;
      var step = 0;
      function phase() {
        if (step >= rounds * 2) { orb.classList.remove('in'); orb.textContent = '😊'; msg.textContent = L.breathingDone; btn.disabled = false; return; }
        var inhale = step % 2 === 0;
        var n = 4;
        if (!reduced) orb.classList.toggle('in', inhale);
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
    kids.push(h('div', { class: 'dots', 'aria-hidden': 'true' }, scenes.map(function (_, i) { return h('span', { class: i <= idx ? 'on' : '' }); })));
    var stage = h('div', { class: 'stage', tabindex: sc.kind === 'story' ? '0' : null, 'aria-label': sc.kind === 'story' ? L.next : null }, [pip(sc.mood)]);
    if (sc.kind === 'story') {
      stage.addEventListener('click', function () { go(idx + 1); });
      stage.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(idx + 1); } });
    }
    kids.push(stage);
    kids.push(h('h2', { tabindex: '-1', text: sc.title }));
    kids.push(h('p', { class: 'say', text: sc.text }));
    if (sc.kind === 'holdStill') kids.push(holdGame());
    if (sc.kind === 'breathe') kids.push(breatheGame());
    if (sc.kind === 'finish') kids.push(h('div', { class: 'confetti', 'aria-hidden': 'true', text: '⭐🌟⭐' }));
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
  }

  draw();
});
`,
};
