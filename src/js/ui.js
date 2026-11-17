/** Header au défilement, menu mobile, navigation active, révélations, bouton WhatsApp. */

export function initHeader() {
  const header = document.querySelector('[data-header]');
  const wa = document.querySelector('[data-wa-float]');
  if (!header) return;
  let ticking = false;
  const update = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 24);
    if (wa) wa.classList.toggle('is-visible', y > window.innerHeight * 0.6);
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();

  // Le bouton flottant s'efface quand les boutons d'envoi des formulaires sont à l'écran
  if (wa && 'IntersectionObserver' in window) {
    const visible = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      wa.classList.toggle('is-tucked', visible.size > 0);
    });
    document.querySelectorAll('.form-actions, .site-footer').forEach((el) => io.observe(el));
  }
}

export function initMobileMenu() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  if (!toggle || !menu) return;
  const label = toggle.querySelector('[data-menu-label]');
  const header = document.querySelector('[data-header]');
  let isOpen = false;

  const setOpen = (open, { focusToggle = true } = {}) => {
    isOpen = open;
    toggle.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Fermer le menu' : 'Ouvrir le menu';
    document.body.classList.toggle('menu-open', open);
    header.classList.toggle('is-menu-open', open);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
      setTimeout(() => menu.querySelector('a')?.focus({ preventScroll: true }), 350);
    } else {
      menu.classList.remove('is-open');
      setTimeout(() => { if (!isOpen) menu.hidden = true; }, 600);
      if (focusToggle) toggle.focus({ preventScroll: true });
    }
  };

  toggle.addEventListener('click', () => setOpen(!isOpen));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false, { focusToggle: false })));
  document.addEventListener('keydown', (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') setOpen(false);
    if (e.key === 'Tab') {
      const focusables = [toggle, ...menu.querySelectorAll('a')];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  window.matchMedia('(min-width: 1081px)').addEventListener('change', (mq) => { if (mq.matches && isOpen) setOpen(false, { focusToggle: false }); });
}

export function initActiveNav() {
  const links = [...document.querySelectorAll('[data-nav]')];
  if (!links.length || !('IntersectionObserver' in window)) return;
  const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const sections = [...map.keys()].map((id) => document.getElementById(id)).filter(Boolean);
  // "conciergeries" et "tarifs" rattachées à la section précédente
  const extra = { conciergeries: 'prestations', tarifs: 'avant-apres' };
  Object.keys(extra).forEach((id) => { const el = document.getElementById(id); if (el) sections.push(el); });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = extra[entry.target.id] || entry.target.id;
      links.forEach((a) => {
        const active = a.getAttribute('href') === `#${id}`;
        a.classList.toggle('is-active', active);
        if (active) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => io.observe(s));
}

export function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-visible')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  els.forEach((el) => io.observe(el));
}
