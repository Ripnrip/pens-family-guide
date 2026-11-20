import type { WidgetSource } from "./types.js";

export const findCareWidget: WidgetSource = {
  id: "find-care",
  title: "PENS care options",
  description: "Cards for the PENS conditions/services matching the parent's concern, with request-appointment and call buttons.",
  css: /* css */ `
.svc { display:flex; flex-direction:column; gap:8px; height:100%; }
.svc header { display:flex; gap:10px; align-items:center; }
.svc .next { background: var(--pens-chip); border-radius: 10px; padding: 8px 10px; font-size: 14px; }
.svc .actions { margin-top:auto; }
.conds { display:flex; flex-wrap:wrap; gap:6px; }
`,
  script: /* js */ `
PENS.mount(function (root, d, api) {
  var h = PENS.h, L = d.labels, A = d.actions;
  var title = h('h1', { text: L.heading, style: 'margin-bottom:10px' });
  root.appendChild(title);
  if (d.items && d.items.length) {
    root.appendChild(h('div', { class: 'grid' }, d.items.map(function (it) {
      return h('article', { class: 'card svc', 'aria-labelledby': 'svc-' + it.id }, [
        h('header', null, [
          h('span', { class: 'icon', 'aria-hidden': 'true', text: it.icon }),
          h('div', null, [
            h('h2', { id: 'svc-' + it.id, text: it.title }),
            h('span', { class: 'chip', text: it.kind === 'condition' ? L.condition : L.service })
          ])
        ]),
        h('p', { text: it.summary }),
        h('div', { class: 'next' }, [h('strong', { text: L.nextStep + ': ' }), it.nextStep]),
        h('div', { class: 'row actions' }, [
          PENS.linkButton(L.requestAppointment, A.requestAppointmentUrl, '', { icon: '📝' }),
          PENS.linkButton(L.call, A.phoneHref, 'secondary', { icon: '📞', aria: L.call + ' ' + A.phone })
        ])
      ]);
    })));
  } else {
    root.appendChild(h('section', { class: 'card stack' }, [
      h('p', { text: d.general }),
      h('div', { class: 'row' }, [
        PENS.linkButton(L.call + ' ' + A.phone, A.phoneHref, '', { icon: '📞' }),
        PENS.linkButton(L.requestAppointment, A.requestAppointmentUrl, 'secondary')
      ])
    ]));
  }
  root.appendChild(h('section', { class: 'card' }, [
    h('h3', { text: L.conditionsHeading }),
    h('div', { class: 'conds' }, d.conditionsWeTreat.map(function (c) {
      return h('span', { class: 'chip' }, [h('span', { 'aria-hidden': 'true', text: c.icon }), c.title]);
    })),
    h('p', { class: 'small muted', style: 'margin-top:8px', text: d.ageNote }),
    h('button', { class: 'btn ghost', type: 'button', style: 'margin-top:6px', onclick: function () { api.sendFollowUp(L.prepPrompt); } }, L.prepPrompt)
  ]));
  // Motion: headline types in, cards fade up staggered (their buttons pop as they land), condition chips follow.
  PENS.typewriter(title, L.heading);
  PENS.fadeUp(root.querySelectorAll('.card'), { step: 80 });
  PENS.springPop(root.querySelectorAll('.conds .chip'), { enter: true, delay: 250, step: 25 });
});
`,
};
