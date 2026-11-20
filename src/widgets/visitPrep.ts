import type { WidgetSource } from "./types.js";

export const visitPrepWidget: WidgetSource = {
  id: "visit-prep",
  title: "PENS visit checklist",
  description: "Visit-prep checklist with checkboxes (saved in widget state), what to bring, what to expect, and a kid-friendly version.",
  css: /* css */ `
.progress { height: 10px; background: var(--pens-chip); border-radius: 999px; overflow: hidden; margin: 6px 0 4px; }
.progress > div { height: 100%; background: var(--pens-primary); transition: width .3s ease; }
.toggle { display:flex; gap:6px; margin-bottom: 10px; }
.kid { font-size: 17px; line-height: 1.6; background: #FFF6E0; color: #1D2B36; border-radius: var(--pens-radius); padding: 16px; border: 2px dashed var(--pens-accent); }
`,
  script: /* js */ `
PENS.mount(function (root, d, api) {
  var h = PENS.h, L = d.labels;
  var meta = api.toolMeta();
  var all = (meta && meta.allVisits) || {};
  var current = d.visit;
  var kidMode = false;

  function getChecked(type) {
    var s = api.widgetState() || {};
    return (s.checked && s.checked[type]) || [];
  }
  function setChecked(type, ids) {
    var s = api.widgetState() || {};
    var checked = Object.assign({}, s.checked || {});
    checked[type] = ids;
    api.setWidgetState(Object.assign({}, s, { checked: checked, visit: type }));
  }

  var tabs = h('div', { class: 'tabs', role: 'tablist', 'aria-label': L.checklist });
  var panel = h('div', { role: 'tabpanel' });
  root.appendChild(tabs);
  root.appendChild(panel);

  function drawTabs() {
    tabs.replaceChildren.apply(tabs, d.visitTypes.map(function (t) {
      var sel = t.type === current.type;
      return h('button', {
        class: 'btn tab', role: 'tab', type: 'button', 'aria-selected': sel ? 'true' : 'false',
        onclick: function () { selectVisit(t.type); }
      }, [h('span', { 'aria-hidden': 'true', text: t.icon }), t.title]);
    }));
  }

  function selectVisit(type) {
    if (type === current.type) return;
    if (all[type]) { current = all[type]; drawTabs(); drawPanel(); return; }
    api.callTool('prepare_for_visit', { visit_type: type, lang: d.lang }).then(function (res) {
      var sc = res && (res.structuredContent || res.structured_content);
      if (sc && sc.visit) { current = sc.visit; drawTabs(); drawPanel(); }
    }).catch(function () { api.toast(type); });
  }

  function drawPanel() {
    var v = current;
    var checked = getChecked(v.type);
    var total = v.checklist.length;
    var bar = h('div', { style: 'width:' + Math.round(100 * checked.length / total) + '%' });
    var count = h('span', { class: 'small muted', text: checked.length + '/' + total + ' ' + L.done });

    var items = v.checklist.map(function (c) {
      var isOn = checked.indexOf(c.id) !== -1;
      var input = h('input', { type: 'checkbox', id: 'chk-' + c.id, checked: isOn });
      var label = h('label', { class: 'check' + (isOn ? ' done' : ''), for: 'chk-' + c.id }, [input, h('span', { text: c.text })]);
      input.addEventListener('change', function () {
        var cur = getChecked(v.type).filter(function (x) { return x !== c.id; });
        if (input.checked) cur.push(c.id);
        setChecked(v.type, cur);
        label.className = 'check' + (input.checked ? ' done' : '');
        bar.style.width = Math.round(100 * cur.length / total) + '%';
        count.textContent = cur.length + '/' + total + ' ' + L.done;
      });
      return label;
    });

    var toggle = h('div', { class: 'toggle', role: 'group' }, [
      h('button', { class: 'btn ' + (kidMode ? 'ghost' : ''), type: 'button', 'aria-pressed': kidMode ? 'false' : 'true', onclick: function () { kidMode = false; drawPanel(); } }, L.grownUp),
      h('button', { class: 'btn ' + (kidMode ? 'accent' : 'ghost'), type: 'button', 'aria-pressed': kidMode ? 'true' : 'false', onclick: function () { kidMode = true; drawPanel(); } }, ['🧒 ', L.kid])
    ]);

    var content = kidMode
      ? [h('div', { class: 'kid' }, [h('div', { class: 'icon', 'aria-hidden': 'true', text: v.icon + ' ✨' }), h('p', { text: v.kidVersion })]),
         h('button', { class: 'btn secondary', type: 'button', style: 'margin-top:10px', onclick: function () { api.sendFollowUp(L.storyPrompt); } }, L.storyPrompt)]
      : [
          h('section', { class: 'card' }, [
            h('h2', null, [h('span', { 'aria-hidden': 'true', text: v.icon + ' ' }), v.title]),
            h('h3', { text: L.checklist }),
            h('div', { class: 'progress', role: 'presentation' }, [bar]), count,
            h('div', null, items)
          ]),
          h('section', { class: 'card' }, [h('details', { open: true }, [h('summary', { text: L.bring }), PENS.list(v.bring)])]),
          h('section', { class: 'card' }, [h('details', null, [h('summary', { text: L.expect }), PENS.list(v.expect)])])
        ];
    panel.replaceChildren.apply(panel, [toggle].concat(content));
  }

  var saved = api.widgetState() || {};
  if (saved.visit && saved.visit !== current.type && all[saved.visit]) current = all[saved.visit];
  drawTabs();
  drawPanel();
});
`,
};
