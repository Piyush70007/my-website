/* Presentation adapter only. The real mailbox UI and its sample transport stay intact. */
(() => {
  'use strict';
  const allowedScenes = new Set(['inbox', 'representative', 'training', 'trust']);
  const cursor = document.createElement('span');
  cursor.className = 'portfolio-tour-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.textContent = '↖';
  document.body.append(cursor);
  // Keyboard events inside a sandboxed frame do not reach the outer dialog.
  // Leave Escape to a child dialog/menu first; otherwise request dismissal.
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || event.defaultPrevented || window.parent === window) return;
    if (document.querySelector('dialog[open], .mobile-workspace-menu[open], .mail-folder-menu[open]')) return;
    event.preventDefault();
    window.parent.postMessage({ type: 'portfolio:close' }, '*');
  }, { capture: true });
  let ready = false, pending = null, timer = null, previousScene = null;
  function applyScene(data) {
    clearTimeout(timer);
    const animate = data.animated && data.running;
    document.documentElement.dataset.tourRunning = String(Boolean(data.running));
    if (!data.running) document.querySelector('.mail-main')?.classList.remove('portfolio-scene-enter');
    if (previousScene === data.scene) { if (!data.running) cursor.classList.remove('is-visible'); return; }
    const target = document.querySelector(`.mail-sidebar [data-workspace-view="${data.scene}"]`) || document.querySelector(`[data-workspace-view="${data.scene}"]`);
    if (!target) return;
    const rect = target.getBoundingClientRect();
    cursor.style.left = `${rect.left + rect.width * .65}px`;
    cursor.style.top = `${rect.top + rect.height * .65}px`;
    cursor.classList.toggle('is-visible', Boolean(animate));
    const go = () => {
      previousScene = data.scene;
      target.click();
      const main = document.querySelector('.mail-main');
      main.classList.remove('portfolio-scene-enter');
      void main.offsetWidth;
      if (animate) main.classList.add('portfolio-scene-enter');
      document.body.dataset.portfolioScene = data.scene;
      cursor.classList.remove('is-visible');
    };
    if (animate) timer = setTimeout(go, 850); else go();
  }
  window.addEventListener('message', event => {
    if (event.source !== window.parent || window.parent === window || event.data?.type !== 'portfolio:scene' || !allowedScenes.has(event.data.scene)) return;
    pending = { scene: event.data.scene, animated: event.data.animated === true && !matchMedia('(prefers-reduced-motion: reduce)').matches, running: event.data.running === true };
    if (ready) applyScene(pending);
  });
  const observer = new MutationObserver(() => {
    const mailView = document.querySelector('#mailView');
    if (!mailView || mailView.hidden) return;
    ready = true;
    observer.disconnect();
    window.parent.postMessage({ type: 'portfolio:ready' }, '*');
    if (pending) applyScene(pending);
  });
  observer.observe(document.querySelector('#mailView'), { attributes: true, attributeFilter: ['hidden'] });
  // app-ui.js can finish its in-memory session before this deferred script runs.
  if (!document.querySelector('#mailView').hidden) {
    ready = true; observer.disconnect(); window.parent.postMessage({ type: 'portfolio:ready' }, '*');
  }
})();
