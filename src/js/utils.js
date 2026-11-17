/** Préfixe un chemin absolu ("/images/...") avec la base de déploiement (compatible GitHub Pages). */
export function asset(path) {
  const base = import.meta.env.BASE_URL || '/';
  return base.replace(/\/$/, '') + path;
}
