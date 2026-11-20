import type { WidgetSource } from "./types.js";

export const clinicCard: WidgetSource = {
  id: "clinic-card",
  title: "PENS clinic card",
  description: "PENS office hours with open-now status, address, phone and arrival tips.",
  css: /* css */ `
.status { display:inline-flex; align-items:center; gap:8px; font-weight:800; border-radius:999px; padding:6px 12px; }
.status.open { background: #D6F2E3; color: #0E4D2C; }
.status.lunch, .status.closed { background: #FCEBD0; color: #5A3B00; }
[data-theme="midnight"] .status.open { background: #17402B; color: #CFF5DF; }
[data-theme="midnight"] .status.lunch, [data-theme="midnight"] .status.closed { background: #4A3410; color: #FBE3B8; }
.dot { width:10px; height:10px; border-radius:50%; background: currentColor; }
.hours { width:100%; border-collapse: collapse; }
.hours th, .hours td { text-align:left; padding:6px 4px; border-bottom:1px solid var(--pens-border); font-size:14px; }
.hours th { font-weight:700; }
.brand { display:flex; gap:12px; align-items:center; margin-bottom:10px; }
.logo { width:48px; height:48px; border-radius:12px; flex:none; display:block; }
`,
  script: /* js */ `
PENS.mount(function (root, d, api) {
  var h = PENS.h, L = d.labels, c = d.clinic;
  root.appendChild(h('section', { class: 'card', 'aria-labelledby': 'pens-name' }, [
    h('div', { class: 'brand' }, [
      h('img', { class: 'logo', src: PENS.brand.logo, alt: '', width: '48', height: '48' }),
      h('div', null, [h('h1', { id: 'pens-name', text: c.name }), h('div', { class: 'muted small', text: c.tagline })])
    ]),
    h('div', { class: 'status ' + d.status.state, role: 'status' }, [h('span', { class: 'dot', 'aria-hidden': 'true' }), d.status.label]),
    h('p', { class: 'small', style: 'margin-top:6px', text: d.status.detail + ' · ' + L.timeNote })
  ]));

  root.appendChild(h('section', { class: 'card' }, [
    h('h2', { text: L.hours }),
    h('table', { class: 'hours' }, [h('tbody', null, d.hours.map(function (r) {
      return h('tr', null, [h('th', { scope: 'row', text: r.days }), h('td', { text: r.hours })]);
    }))])
  ]));

  root.appendChild(h('section', { class: 'card stack' }, [
    h('h2', { text: L.address }),
    h('p', { text: c.address }),
    h('p', { class: 'small muted', text: 'Fax ' + c.fax + ' · ' + c.email }),
    h('div', { class: 'row' }, [
      PENS.linkButton(L.call + ' ' + c.phone, c.phoneHref, '', { icon: '📞' }),
      PENS.linkButton(L.directions, c.mapUrl, 'secondary', { icon: '🗺️' }),
      PENS.linkButton(L.website, c.website, 'ghost')
    ])
  ]));

  root.appendChild(h('section', { class: 'card' }, [
    h('details', null, [
      h('summary', { text: L.arrival }),
      h('ul', null, d.arrivalTips.map(function (t) {
        return h('li', null, [t.text, t.verified ? null : h('span', { class: 'chip todo', style: 'margin-left:6px', text: L.unverified })]);
      }))
    ]),
    h('p', { class: 'small muted', style: 'margin-top:8px', text: L.director + ': ' + c.medicalDirector })
  ]));
});
`,
};
