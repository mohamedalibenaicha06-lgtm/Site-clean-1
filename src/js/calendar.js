/**
 * Sélecteur de date accessible (date SOUHAITÉE — aucune disponibilité n'est affichée ni garantie).
 * - Clavier : flèches, Page préc./suiv. (mois), Début/Fin (semaine), Entrée, Échap
 * - Mobile : s'affiche en panneau bas d'écran
 */
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const DAYS_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const DAYS_LONG = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const formatLong = (d) => `${DAYS_LONG[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

export function initDatepicker(wrapper, mount) {
  const input = wrapper.querySelector('input[type="hidden"]');
  const trigger = wrapper.querySelector('[data-date-trigger]');
  const valueEl = wrapper.querySelector('[data-date-value]');
  const placeholder = valueEl.textContent;

  const today = startOfDay(new Date());
  const minDate = today;
  const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  let selected = null;
  let focusDate = today;
  let view = new Date(today.getFullYear(), today.getMonth(), 1);
  let panel = null;
  let backdrop = null;

  const inRange = (d) => d >= minDate && d <= maxDate;
  const isMobile = () => window.matchMedia('(max-width: 640px)').matches;

  function build() {
    backdrop = document.createElement('div');
    backdrop.className = 'cal-backdrop';
    panel = document.createElement('div');
    panel.className = 'cal';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Choisir une date souhaitée');
    panel.innerHTML = `
      <div class="cal-head">
        <button type="button" class="icon-btn" data-cal-prev aria-label="Mois précédent"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-arrow" transform="rotate(180 12 12)"/></svg></button>
        <p class="cal-title" aria-live="polite" data-cal-title></p>
        <button type="button" class="icon-btn" data-cal-next aria-label="Mois suivant"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-arrow"/></svg></button>
      </div>
      <table class="cal-grid" role="grid">
        <thead><tr>${DAYS_SHORT.map((d) => `<th scope="col" abbr="${d}">${d.slice(0, 2)}</th>`).join('')}</tr></thead>
        <tbody data-cal-body></tbody>
      </table>
      <div class="cal-foot"><span>Date indicative, confirmée par notre équipe.</span><button type="button" data-cal-clear>Effacer</button></div>`;
    panel.querySelector('[data-cal-prev]').addEventListener('click', () => moveMonth(-1));
    panel.querySelector('[data-cal-next]').addEventListener('click', () => moveMonth(1));
    panel.querySelector('[data-cal-clear]').addEventListener('click', () => { setValue(null); close(); });
    panel.addEventListener('keydown', onKey);
    backdrop.addEventListener('click', close);
  }

  function renderMonth() {
    const body = panel.querySelector('[data-cal-body]');
    panel.querySelector('[data-cal-title]').textContent = `${MONTHS[view.getMonth()]} ${view.getFullYear()}`;
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7; // lundi = 0
    const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    let html = '<tr>';
    for (let i = 0; i < offset; i++) html += '<td></td>';
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(view.getFullYear(), view.getMonth(), day);
      const col = (offset + day - 1) % 7;
      if (col === 0 && day !== 1) html += '</tr><tr>';
      const disabled = !inRange(d);
      const cls = ['cal-day', sameDay(d, today) ? 'is-today' : ''].join(' ').trim();
      html += `<td><button type="button" class="${cls}" data-date="${iso(d)}" tabindex="${sameDay(d, focusDate) ? 0 : -1}"
        aria-label="${formatLong(d)}${sameDay(d, today) ? ', aujourd’hui' : ''}" aria-selected="${sameDay(d, selected)}" ${disabled ? 'disabled' : ''}>${day}</button></td>`;
    }
    html += '</tr>';
    body.innerHTML = html;
    body.querySelectorAll('.cal-day:not(:disabled)').forEach((btn) => {
      btn.addEventListener('click', () => { setValue(parse(btn.dataset.date)); close(); });
    });
    panel.querySelector('[data-cal-prev]').disabled = view <= new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    panel.querySelector('[data-cal-next]').disabled = view >= new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
  }

  const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };

  function moveMonth(n) {
    view = new Date(view.getFullYear(), view.getMonth() + n, 1);
    const day = Math.min(focusDate.getDate(), new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate());
    focusDate = new Date(view.getFullYear(), view.getMonth(), day);
    if (focusDate < minDate) focusDate = minDate;
    if (focusDate > maxDate) focusDate = maxDate;
    renderMonth();
  }

  function focusDay(d) {
    if (d < minDate) d = minDate;
    if (d > maxDate) d = maxDate;
    focusDate = d;
    if (d.getMonth() !== view.getMonth() || d.getFullYear() !== view.getFullYear()) {
      view = new Date(d.getFullYear(), d.getMonth(), 1);
    }
    renderMonth();
    panel.querySelector(`[data-date="${iso(d)}"]`)?.focus();
  }

  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'Tab') { // piège du focus dans la boîte de dialogue
      const f = [...panel.querySelectorAll('button:not(:disabled)')].filter((b) => b.tabIndex !== -1);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      return;
    }
    if (!e.target.classList.contains('cal-day')) return;
    const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key in moves) { e.preventDefault(); focusDay(addDays(focusDate, moves[e.key])); }
    else if (e.key === 'PageUp') { e.preventDefault(); focusDay(new Date(focusDate.getFullYear(), focusDate.getMonth() - 1, focusDate.getDate())); }
    else if (e.key === 'PageDown') { e.preventDefault(); focusDay(new Date(focusDate.getFullYear(), focusDate.getMonth() + 1, focusDate.getDate())); }
    else if (e.key === 'Home') { e.preventDefault(); focusDay(addDays(focusDate, -((focusDate.getDay() + 6) % 7))); }
    else if (e.key === 'End') { e.preventDefault(); focusDay(addDays(focusDate, 6 - ((focusDate.getDay() + 6) % 7))); }
  }

  function setValue(d) {
    selected = d;
    input.value = d ? formatLong(d) : '';
    valueEl.textContent = d ? formatLong(d) : placeholder;
    trigger.classList.toggle('has-value', !!d);
  }

  function position() {
    if (isMobile()) { panel.style.left = ''; panel.style.top = ''; return; }
    const r = trigger.getBoundingClientRect();
    const w = panel.offsetWidth;
    const left = Math.min(Math.max(12, r.left + window.scrollX), window.scrollX + document.documentElement.clientWidth - w - 12);
    let top = r.bottom + window.scrollY + 8;
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
  }

  function open() {
    if (!panel) build();
    focusDate = selected || today;
    view = new Date(focusDate.getFullYear(), focusDate.getMonth(), 1);
    if (isMobile()) mount.appendChild(backdrop);
    mount.appendChild(panel);
    renderMonth();
    if (!isMobile()) {
      // fait défiler juste assez pour afficher le calendrier sous le champ
      const need = trigger.getBoundingClientRect().bottom + panel.offsetHeight + 24 - window.innerHeight;
      if (need > 0) window.scrollBy({ top: need, behavior: 'instant' });
    }
    position();
    requestAnimationFrame(() => {
      panel.classList.add('is-open');
      backdrop.classList.add('is-open');
      panel.querySelector(`[data-date="${iso(focusDate)}"]`)?.focus();
    });
    trigger.setAttribute('aria-expanded', 'true');
    document.addEventListener('pointerdown', outside, true);
    window.addEventListener('resize', position);
  }

  function close() {
    if (!panel || !panel.isConnected) return;
    panel.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    document.removeEventListener('pointerdown', outside, true);
    window.removeEventListener('resize', position);
    setTimeout(() => { panel.remove(); backdrop.remove(); }, 250);
    trigger.focus();
  }

  function outside(e) {
    if (!panel.contains(e.target) && !trigger.contains(e.target)) close();
  }

  trigger.setAttribute('aria-expanded', 'false');
  trigger.addEventListener('click', () => (panel && panel.isConnected && panel.classList.contains('is-open') ? close() : open()));

  return { reset: () => setValue(null) };
}
