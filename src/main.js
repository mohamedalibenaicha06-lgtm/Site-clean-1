import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/cormorant-garamond/latin-500-italic.css';
import '@fontsource/cormorant-garamond/latin-600.css';
import '@fontsource-variable/manrope/wght.css';
import './styles/main.css';

import { initHeader, initMobileMenu, initActiveNav, initReveal } from './js/ui.js';
import { initBeforeAfter } from './js/compare.js';
import { initDatepicker } from './js/calendar.js';
import { initForms, initPrefill } from './js/forms.js';

document.documentElement.classList.add('js');

function start() {
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  initHeader();
  initMobileMenu();
  initActiveNav();
  initReveal();
  initBeforeAfter(document.querySelector('[data-ba]'));
  const mount = document.querySelector('[data-calendar-root]') || document.body;
  document.querySelectorAll('[data-datepicker]').forEach((el) => initDatepicker(el, mount));
  initForms();
  initPrefill();

  // Déclenche l'intro une fois les polices prêtes (évite le saut de typographie)
  const go = () => document.documentElement.classList.add('is-loaded');
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.race([fonts, new Promise((r) => setTimeout(r, 700))]).then(() => requestAnimationFrame(go));
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
