import { REALISATIONS } from '../data/site.js';
import { asset } from './utils.js';

/** Comparateur avant/après + carrousel des réalisations. */
export function initBeforeAfter(root) {
  if (!root || !REALISATIONS.length) return;

  const compare = root.querySelector('[data-compare]');
  const beforeImg = root.querySelector('[data-before]');
  const afterImg = root.querySelector('[data-after]');
  const handle = root.querySelector('[data-handle]');
  const demoBadge = root.querySelector('[data-demo]');
  const disclaimer = root.querySelector('[data-disclaimer]');
  const thumbs = root.querySelector('[data-thumbs]');
  const els = {
    cat: root.querySelector('[data-cat]'),
    title: root.querySelector('[data-title]'),
    desc: root.querySelector('[data-desc]'),
    count: root.querySelector('[data-count]'),
  };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let index = 0;
  let pos = 50;

  /* ---------- Position du curseur ---------- */
  function setPos(value) {
    pos = Math.max(0, Math.min(100, value));
    compare.style.setProperty('--pos', `${pos}%`);
    handle.setAttribute('aria-valuenow', String(Math.round(pos)));
    handle.setAttribute('aria-valuetext', `${Math.round(pos)} % de la photo avant visible`);
  }

  function posFromEvent(e) {
    const rect = compare.getBoundingClientRect();
    return ((e.clientX - rect.left) / rect.width) * 100;
  }

  let dragging = false;
  let startX = 0;
  let startY = 0;
  let decided = false;

  compare.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    dragging = true;
    decided = e.pointerType === 'mouse';
    startX = e.clientX;
    startY = e.clientY;
    compare.classList.remove('is-intro');
    if (decided) {
      compare.setPointerCapture(e.pointerId);
      compare.classList.add('is-dragging');
      setPos(posFromEvent(e));
    }
  });

  compare.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    if (!decided) {
      // Sur écran tactile : on ne capture que si le geste est horizontal
      const dx = Math.abs(e.clientX - startX);
      const dy = Math.abs(e.clientY - startY);
      if (dx < 6 && dy < 6) return;
      if (dy > dx) { dragging = false; return; }
      decided = true;
      compare.setPointerCapture(e.pointerId);
      compare.classList.add('is-dragging');
    }
    setPos(posFromEvent(e));
  });

  const stop = (e) => {
    if (dragging && !decided && e.type === 'pointerup') setPos(posFromEvent(e)); // simple tap
    dragging = false;
    compare.classList.remove('is-dragging');
  };
  compare.addEventListener('pointerup', stop);
  compare.addEventListener('pointercancel', stop);

  handle.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 10 : 2;
    const map = { ArrowLeft: -step, ArrowDown: -step, ArrowRight: step, ArrowUp: step, PageDown: -10, PageUp: 10 };
    if (e.key in map) { e.preventDefault(); compare.classList.remove('is-intro'); setPos(pos + map[e.key]); }
    else if (e.key === 'Home') { e.preventDefault(); setPos(0); }
    else if (e.key === 'End') { e.preventDefault(); setPos(100); }
  });

  /* ---------- Carrousel ---------- */
  REALISATIONS.forEach((r, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ba-thumb';
    b.setAttribute('aria-pressed', 'false');
    b.setAttribute('aria-label', `${r.title} — ${r.category}`);
    b.innerHTML = `<img src="${asset(r.after)}" alt="" loading="lazy" decoding="async" width="160" height="107" /><span aria-hidden="true">${r.title}</span>`;
    b.addEventListener('click', () => show(i));
    thumbs.appendChild(b);
  });
  if (REALISATIONS.length < 2) {
    root.querySelector('.ba-nav').hidden = true;
    thumbs.hidden = true;
  }

  function preload(i) {
    const r = REALISATIONS[(i + REALISATIONS.length) % REALISATIONS.length];
    [r.before, r.after].forEach((src) => { const im = new Image(); im.src = asset(src); });
  }

  function render(i) {
    const r = REALISATIONS[i];
    beforeImg.src = asset(r.before);
    afterImg.src = asset(r.after);
    beforeImg.alt = `Avant : ${r.alt}${r.demo ? ' (visuel de démonstration)' : ''}`;
    afterImg.alt = `Après : ${r.alt}${r.demo ? ' (visuel de démonstration)' : ''}`;
    els.cat.textContent = r.category;
    els.title.textContent = r.title;
    els.desc.textContent = r.description || '';
    els.desc.hidden = !r.description;
    els.count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(REALISATIONS.length).padStart(2, '0')}`;
    demoBadge.hidden = !r.demo;
    [...thumbs.children].forEach((t, k) => t.setAttribute('aria-pressed', String(k === i)));
  }

  function show(i) {
    const next = (i + REALISATIONS.length) % REALISATIONS.length;
    if (next === index && afterImg.getAttribute('src')) return;
    index = next;
    if (reduceMotion) { render(index); setPos(50); return; }
    compare.classList.add('is-switching');
    setTimeout(() => {
      render(index);
      setPos(50);
      const done = () => compare.classList.remove('is-switching');
      if (afterImg.complete) requestAnimationFrame(done); else afterImg.addEventListener('load', done, { once: true });
      preload(index + 1);
    }, 260);
  }

  root.querySelector('[data-prev]').addEventListener('click', () => show(index - 1));
  root.querySelector('[data-next]').addEventListener('click', () => show(index + 1));

  disclaimer.hidden = !REALISATIONS.some((r) => r.demo);
  render(0);
  setPos(50);
  preload(1);

  // Petite démonstration du geste lorsque la section apparaît
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      compare.classList.add('is-intro');
      setTimeout(() => setPos(28), 400);
      setTimeout(() => setPos(66), 1500);
      setTimeout(() => setPos(50), 2600);
      setTimeout(() => compare.classList.remove('is-intro'), 3900);
    }, { threshold: 0.6 });
    io.observe(compare);
  }
}
