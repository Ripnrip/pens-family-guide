import type { WidgetSource } from "./types.js";

export const appointmentHandoffWidget: WidgetSource = {
  id: "appointment-handoff",
  title: "Request a PENS appointment",
  description: "Hand-off card with the official request form, phone and patient portal. Collects no data.",
  css: /* css */ `
.opts { display: grid; gap: 10px; }
.opts .btn { justify-content: flex-start; width: 100%; font-size: 16px; }
.hrs { font-size: 14px; }
.hrs div { display: flex; justify-content: space-between; gap: 8px; border-bottom: 1px solid var(--pens-border); padding: 4px 0; }
`,
  script: /* js */ `
PENS.mount(function (root, d, api) {
  var h = PENS.h, L = d.labels;
  root.appendChild(h('section', { class: 'card' }, [
    h('h1', { text: L.heading }),
    h('div', { class: 'opts', style: 'margin-top:10px' }, d.options.map(function (o, k) {
      return h('div', null, [
        PENS.linkButton(o.label, o.href, k === 0 ? '' : 'secondary', { icon: o.icon }),
        o.verified ? null : h('span', { class: 'chip todo', style: 'margin-top:4px', text: L.unverified })
      ]);
    }))
  ]));
  root.appendChild(h('section', { class: 'card' }, [h('h2', { text: L.haveReady }), PENS.list(d.haveReady)]));
  root.appendChild(h('section', { class: 'card' }, [
    h('details', null, [h('summary', { text: L.hours }), h('div', { class: 'hrs' }, d.hours.map(function (r) { return h('div', null, [h('span', { text: r.days }), h('strong', { text: r.hours })]); }))])
  ]));
  root.appendChild(h('div', { class: 'notice', role: 'note' }, [h('span', { 'aria-hidden': 'true', text: '🔒 ' }), d.privacy]));
});
`,
};

export const referralCardWidget: WidgetSource = {
  id: "referral-card",
  title: "Refer to PENS",
  description: "Referral card for providers: fax, phone, what to include, urgent vs routine guidance.",
  css: /* css */ `
.fax { font-size: 28px; font-weight: 900; color: var(--pens-primary); font-variant-numeric: tabular-nums; }
.tri { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
.tri .card { margin: 0; border-left-width: 6px; }
.tri .urg { border-left-color: var(--pens-accent); }
.tri .rou { border-left-color: var(--pens-primary); }
.tri .eme { border-left-color: var(--pens-urgent); }
`,
  script: /* js */ `
PENS.mount(function (root, d, api) {
  var h = PENS.h, L = d.labels;
  root.appendChild(h('section', { class: 'card' }, [
    h('h1', { text: L.heading }),
    h('div', { class: 'small muted', text: L.fax }),
    h('div', { class: 'fax', text: d.fax }),
    h('div', { class: 'row', style: 'margin-top:8px' }, [PENS.linkButton(L.call + ' ' + d.phone, d.phoneHref, '', { icon: '📞' })]),
    h('p', { class: 'small muted', style: 'margin-top:8px', text: d.address })
  ]));
  root.appendChild(h('section', { class: 'card' }, [h('h2', { text: L.include }), PENS.list(d.include)]));
  root.appendChild(h('div', { class: 'tri', style: 'margin-bottom:12px' }, [
    h('section', { class: 'card urg' }, [h('h3', { text: L.urgent }), h('p', { class: 'small', text: d.urgent })]),
    h('section', { class: 'card rou' }, [h('h3', { text: L.routine }), h('p', { class: 'small', text: d.routine })]),
    h('section', { class: 'card eme' }, [h('h3', { text: L.emergency }), h('p', { class: 'small', text: d.emergencyGuidance })])
  ]));
  root.appendChild(h('div', { class: 'notice', role: 'note' }, [h('span', { 'aria-hidden': 'true', text: '🔒 ' }), d.note]));
});
`,
};
