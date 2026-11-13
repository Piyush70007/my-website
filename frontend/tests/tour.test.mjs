import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

test('the tour accepts only parent messages and allowlisted views; pausing cancels pending navigation', () => {
  let receive, pending, clicked = [];
  const classes = { add() {}, remove() {}, toggle() {} };
  const parent = { postMessage() {} };
  const context = vm.createContext({
    window: { parent, addEventListener(type, listener) { if (type === 'message') receive = listener; } },
    document: {
      body: { append() {}, dataset: {} }, documentElement: { dataset: {} },
      createElement: () => ({ classList: classes, style: {}, setAttribute() {} }),
      querySelector(selector) {
        if (selector === '#mailView') return { hidden: false };
        if (selector === '.mail-main') return { classList: classes, offsetWidth: 100 };
        return { getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 40 }), click() { clicked.push(selector); } };
      },
    },
    MutationObserver: class { observe() {} disconnect() {} },
    matchMedia: () => ({ matches: false }),
    setTimeout(callback) { pending = callback; return 1; },
    clearTimeout() { pending = null; },
  });
  vm.runInContext(readFileSync(new URL('../public/openmail/portfolio-tour.js', import.meta.url), 'utf8'), context);
  receive({ source: {}, data: { type: 'portfolio:scene', scene: 'trust' } });
  receive({ source: parent, data: { type: 'portfolio:scene', scene: '/api/messages/send' } });
  assert.equal(clicked.length, 0);
  receive({ source: parent, data: { type: 'portfolio:scene', scene: 'trust', animated: true, running: true } });
  assert.equal(typeof pending, 'function');
  receive({ source: parent, data: { type: 'portfolio:scene', scene: 'inbox', animated: false, running: false } });
  assert.equal(pending, null);
  assert.equal(clicked.length, 1);
  assert.match(clicked[0], /workspace-view="inbox"/);
});
