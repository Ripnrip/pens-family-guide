import type { WidgetSource } from "./types.js";

export const schoolPlanWidget: WidgetSource = {
  id: "school-plan",
  title: "School seizure plan (FL HB 1201)",
  description: "Florida HB 1201 summary, how to request an ISAP from PENS, and a caregiver-circle checklist with training links.",
  css: /* css */ `
.circle { display: grid; gap: 8px; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); }
.member { border: 2px solid var(--pens-border); border-radius: 14px; padding: 6px 10px; }
.member.done { border-color: var(--pens-primary); background: var(--pens-chip); }
.member .tip { font-size: 13px; color: var(--pens-muted); }
.law li { margin: 6px 0; }
.member .check { align-items: flex-start; }
.ready-num { display: inline-block; font-variant-numeric: tabular-nums; }
`,
  script: /* js */ `
PENS.mount(function (root, d, api) {
  var h = PENS.h, L = d.labels;
  var title = h('h1', { text: d.title, style: 'margin-bottom:10px' });
  root.appendChild(title);
  root.appendChild(h('section', { class: 'card law' }, [h('h2', { text: L.law }), PENS.list(d.summary)]));
  root.appendChild(h('section', { class: 'card' }, [h('h2', { text: L.isap }), h('p', { text: d.isapWhat }), d.staffNote ? h('p', { class: 'notice', text: d.staffNote }) : null]));
  root.appendChild(h('section', { class: 'card' }, [
    h('details', { open: true }, [h('summary', { text: L.request }), PENS.list(d.requestSteps, true)]),
    h('div', { class: 'row', style: 'margin-top:10px' }, [
      PENS.linkButton(L.call + ' ' + d.phone, d.phoneHref, '', { icon: '📞' })
    ])
  ]));

  var state = api.widgetState() || {};
  var ready = (state.circle || []).slice();
  var num = h('span', { class: 'ready-num' });
  var count = h('span', { class: 'chip' }, [num, h('span', { text: '/' + d.circle.length + ' ' + L.ready })]);
  var first = true;
  function upd() {
    // Counts up from 0 on first show, then steps with a little pop on each change.
    PENS.countUp(num, ready.length, { from: first ? 0 : undefined, dur: first ? 700 : 300 });
    if (!first) PENS.springPop(count);
    first = false;
  }
  upd();
  root.appendChild(h('section', { class: 'card' }, [
    h('div', { class: 'row', style: 'justify-content:space-between' }, [h('h2', { text: L.circle }), count]),
    h('p', { class: 'small muted', text: L.circleHint }),
    h('div', { class: 'circle' }, d.circle.map(function (m) {
      var on = ready.indexOf(m.id) !== -1;
      var input = h('input', { type: 'checkbox', id: 'c-' + m.id, class: 'pm-check-input', checked: on });
      var tick = PENS.tickBox();
      var box = h('div', { class: 'member' + (on ? ' done' : '') }, [
        h('label', { class: 'check', for: 'c-' + m.id }, [input, tick, h('div', null, [h('strong', null, [h('span', { 'aria-hidden': 'true', text: m.icon + ' ' }), m.role]), h('div', { class: 'tip', text: m.tip })])])
      ]);
      input.addEventListener('change', function () {
        ready = ready.filter(function (x) { return x !== m.id; });
        if (input.checked) ready.push(m.id);
        box.className = 'member' + (input.checked ? ' done' : '');
        if (input.checked) PENS.springPop(tick);
        api.setWidgetState(Object.assign({}, api.widgetState() || {}, { circle: ready }));
        upd();
      });
      return box;
    })),
    h('div', { class: 'row', style: 'margin-top:10px' }, [PENS.linkButton(L.training, d.trainingUrl, 'accent', { icon: '🎓' })])
  ]));
  root.appendChild(h('p', { class: 'small muted', text: d.sourceNote }));
  // Motion: title types in, cards and caregiver-circle members fade up staggered.
  PENS.typewriter(title, d.title);
  PENS.fadeUp(root.querySelectorAll('.card'), { step: 80 });
  PENS.fadeUp(root.querySelectorAll('.member'), { step: 50 });
});
`,
};
