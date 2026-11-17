import { CONTACT } from '../data/site.js';

/**
 * Formulaires → message prérempli WhatsApp ou email (mailto).
 * Aucune donnée n'est envoyée à un serveur : le visiteur valide lui-même l'envoi
 * dans WhatsApp ou dans sa messagerie. Aucun « succès » n'est simulé.
 */

const PHONE_RE = /^(?:(?:\+|00)33\s?[1-9]|0[1-9])(?:[\s.-]?\d{2}){4}$|^(?:\+|00)(?!33)\d[\d\s.-]{6,16}\d$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const MESSAGES = {
  required: 'Ce champ est requis.',
  select: 'Veuillez faire un choix.',
  phone: 'Numéro invalide. Exemple : 06 12 34 56 78.',
  email: 'Adresse email invalide. Exemple : nom@exemple.fr.',
  consent: 'Merci d’accepter l’utilisation de vos informations pour traiter votre demande.',
  surface: 'Indiquez une surface entre 5 et 5000 m².',
};

function errorEl(field) {
  return document.getElementById(`${field.id}-err`);
}

function setError(field, msg) {
  const el = errorEl(field);
  if (msg) {
    field.setAttribute('aria-invalid', 'true');
    if (el) {
      el.textContent = msg;
      field.setAttribute('aria-describedby', el.id);
    }
  } else {
    field.removeAttribute('aria-invalid');
    if (el) el.textContent = '';
  }
}

function validateField(field) {
  const value = field.type === 'checkbox' ? field.checked : field.value.trim();
  let msg = '';
  if (field.type === 'checkbox') {
    if (field.required && !value) msg = MESSAGES.consent;
  } else if (field.required && !value) {
    msg = field.tagName === 'SELECT' ? MESSAGES.select : MESSAGES.required;
  } else if (value) {
    if (field.dataset.validate === 'phone' && !PHONE_RE.test(value)) msg = MESSAGES.phone;
    if (field.dataset.validate === 'email' && !EMAIL_RE.test(value)) msg = MESSAGES.email;
    if (field.type === 'number') {
      const n = Number(value);
      if (!Number.isFinite(n) || n < Number(field.min || 0) || n > Number(field.max || Infinity)) msg = MESSAGES.surface;
    }
  }
  setError(field, msg);
  return !msg;
}

function collect(form) {
  const lines = [];
  const seen = new Set();
  form.querySelectorAll('[data-label]').forEach((el) => {
    if (el.type === 'radio') {
      if (seen.has(el.name)) return;
      seen.add(el.name);
      const checked = form.querySelector(`input[name="${el.name}"]:checked`);
      if (checked) lines.push([el.dataset.label, checked.value]);
      return;
    }
    const v = el.value.trim();
    if (v) lines.push([el.dataset.label, v + (el.dataset.suffix || '')]);
  });
  return lines;
}

function buildMessage(form, lines, { whatsapp }) {
  const isDevis = form.dataset.form === 'devis';
  const intro = isDevis
    ? 'Bonjour SOS Ménage 06, je souhaite faire une demande d’intervention / de devis.'
    : 'Bonjour SOS Ménage 06, je vous contacte depuis votre site internet.';
  const b = (s) => (whatsapp ? `*${s}*` : s);
  const body = lines
    .filter(([label]) => label !== 'Message')
    .map(([label, v]) => `${whatsapp ? '• ' : '- '}${b(label)} : ${v}`)
    .join('\n');
  const message = lines.find(([label]) => label === 'Message');
  let text = `${intro}\n\n${body}`;
  if (message) text += `\n\n${b('Message')} :\n${message[1]}`;
  if (isDevis) text += '\n\n(Date et créneau indicatifs, sous réserve de confirmation.)';
  return text;
}

function subjectFor(form, lines) {
  const get = (l) => lines.find(([label]) => label === l)?.[1];
  if (form.dataset.form === 'devis') {
    return ['Demande d’intervention', get('Prestation'), get('Ville')].filter(Boolean).join(' – ');
  }
  return `Message depuis le site – ${get('Nom') || ''}`.trim();
}

/** Ouvre un lien mailto: via une ancre temporaire (plus fiable que location.href sur mobile). */
function openLink(url) {
  const a = document.createElement('a');
  a.href = url;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function showStatus(form, html, type = 'info') {
  const status = form.querySelector('[data-status]');
  status.className = `form-status is-${type}`;
  status.innerHTML = html;
  status.hidden = false;
}

export function initForms() {
  document.querySelectorAll('form[data-form]').forEach((form) => {
    const fields = [...form.querySelectorAll('input[required], select[required], textarea[required], [data-validate], input[type="number"]')];

    // Validation au fil de la saisie (après une première erreur)
    fields.forEach((f) => {
      const evt = f.type === 'checkbox' || f.tagName === 'SELECT' ? 'change' : 'blur';
      f.addEventListener(evt, () => { if (f.value || f.hasAttribute('aria-invalid')) validateField(f); });
      f.addEventListener('input', () => { if (f.hasAttribute('aria-invalid')) validateField(f); });
    });

    // Masque le message d'erreur global dès que tout est corrigé
    const clearStatus = () => {
      const status = form.querySelector('[data-status]');
      if (status.classList.contains('is-error') && !form.querySelector('[aria-invalid="true"]')) status.hidden = true;
    };
    form.addEventListener('input', clearStatus);
    form.addEventListener('change', clearStatus);

    form.addEventListener('submit', (e) => e.preventDefault());

    form.querySelectorAll('[data-send]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const results = fields.map(validateField);
        if (results.includes(false)) {
          const first = fields[results.indexOf(false)];
          showStatus(form, 'Certains champs sont à compléter ou à corriger. Ils sont indiqués ci-dessus.', 'error');
          first.focus({ preventScroll: true });
          first.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
          return;
        }

        const lines = collect(form);
        const channel = btn.dataset.send;

        if (channel === 'whatsapp') {
          const text = buildMessage(form, lines, { whatsapp: true });
          const url = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
          const win = window.open(url, '_blank', 'noopener');
          showStatus(
            form,
            `WhatsApp ${win ? 's’ouvre dans un nouvel onglet' : 'va s’ouvrir'} avec votre message déjà rédigé. <strong>Pensez à appuyer sur « Envoyer » dans WhatsApp</strong> pour nous transmettre votre demande.
             ${win ? '' : `<br><a href="${url}" target="_blank" rel="noopener">Ouvrir WhatsApp</a>`}`,
          );
          if (!win) window.location.href = url;
        } else {
          const text = buildMessage(form, lines, { whatsapp: false });
          const url = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subjectFor(form, lines))}&body=${encodeURIComponent(text)}`;
          openLink(url);
          showStatus(
            form,
            `Votre application email devrait s’ouvrir avec le message prérempli. <strong>Vérifiez-le puis envoyez-le</strong> depuis votre messagerie.<br>
             Rien ne s’ouvre&nbsp;? Écrivez-nous directement à <a href="mailto:${CONTACT.email}">${CONTACT.email}</a> ou appelez le <a href="tel:${CONTACT.phoneIntl}">${CONTACT.phoneDisplay}</a>.`,
          );
        }
      });
    });
  });
}

/** Préremplit le formulaire de devis depuis les boutons « Demander un devis ». */
export function initPrefill() {
  const service = document.getElementById('d-presta');
  const client = document.getElementById('d-client');
  document.querySelectorAll('[data-prefill-service], [data-prefill-client]').forEach((link) => {
    link.addEventListener('click', () => {
      if (link.dataset.prefillService && service) {
        service.value = link.dataset.prefillService;
        setError(service, '');
      }
      if (link.dataset.prefillClient && client) {
        client.value = link.dataset.prefillClient;
        setError(client, '');
      }
    });
  });
}
