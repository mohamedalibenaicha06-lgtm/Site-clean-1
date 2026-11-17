import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/cormorant-garamond/latin-600.css';
import '@fontsource-variable/manrope/wght.css';
import './styles/main.css';

const year = document.querySelector('[data-year]');
if (year) year.textContent = String(new Date().getFullYear());
